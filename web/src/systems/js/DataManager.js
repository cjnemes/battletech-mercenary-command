/**
 * Data Manager - Professional Game Data Persistence
 * Handles save/load operations, data validation, and storage management
 */
import { Logger } from '@utils/Logger';
import { EventBus } from '@utils/EventBus';

export class DataManager {
  constructor(eventBus) {
    this.logger = new Logger('DataManager');
    this.eventBus = eventBus;
    this.db = null;
    this.dbName = 'BattletechMercenaryCommand';
    this.dbVersion = 1;
    this.isInitialized = false;
    this.saveQueue = [];
    this.isProcessingQueue = false;
    
    // Data schema version for migration handling
    this.currentSchemaVersion = '1.0.0';
    
    // Cache for frequently accessed data
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize the data management system
   */
  async initialize() {
    try {
      this.logger.info('Initializing DataManager...');
      
      // Check IndexedDB support
      if (!this.checkIndexedDBSupport()) {
        throw new Error('IndexedDB is not supported in this browser');
      }
      
      // Initialize database
      await this.initializeDatabase();
      
      // Setup periodic cleanup
      this.setupPeriodicCleanup();
      
      // Setup auto-save
      this.setupAutoSave();
      
      this.isInitialized = true;
      this.logger.info('DataManager initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize DataManager:', error);
      throw error;
    }
  }

  /**
   * Check if IndexedDB is supported
   */
  checkIndexedDBSupport() {
    return 'indexedDB' in window;
  }

  /**
   * Initialize the IndexedDB database
   */
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        this.logger.error('Database error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.logger.info('Database opened successfully');
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        this.logger.info('Database upgrade needed');
        this.db = event.target.result;
        this.createObjectStores();
      };
    });
  }

  /**
   * Create object stores for different data types
   */
  createObjectStores() {
    try {
      // Game saves store
      if (!this.db.objectStoreNames.contains('gameSaves')) {
        const gameSavesStore = this.db.createObjectStore('gameSaves', {
          keyPath: 'id',
          autoIncrement: true
        });
        gameSavesStore.createIndex('name', 'name', { unique: false });
        gameSavesStore.createIndex('timestamp', 'timestamp', { unique: false });
        gameSavesStore.createIndex('version', 'version', { unique: false });
      }
      
      // Settings store
      if (!this.db.objectStoreNames.contains('settings')) {
        this.db.createObjectStore('settings', {
          keyPath: 'key'
        });
      }
      
      // Player statistics store
      if (!this.db.objectStoreNames.contains('statistics')) {
        this.db.createObjectStore('statistics', {
          keyPath: 'id',
          autoIncrement: true
        });
      }
      
      // Temporary data store (for cache)
      if (!this.db.objectStoreNames.contains('tempData')) {
        const tempDataStore = this.db.createObjectStore('tempData', {
          keyPath: 'key'
        });
        tempDataStore.createIndex('expires', 'expires', { unique: false });
      }
      
      this.logger.info('Object stores created successfully');
      
    } catch (error) {
      this.logger.error('Error creating object stores:', error);
      throw error;
    }
  }

  /**
   * Save game state
   */
  async saveGame(gameState, saveName = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('DataManager not initialized');
      }
      
      const saveData = this.prepareSaveData(gameState, saveName);
      
      // Validate save data
      this.validateSaveData(saveData);
      
      // Add to save queue for processing
      await this.addToSaveQueue(saveData);
      
      this.logger.info(`Game saved: ${saveData.name}`);
      this.eventBus.emit('data:gameSaved', { saveData });
      
      return saveData.id;
      
    } catch (error) {
      this.logger.error('Failed to save game:', error);
      this.eventBus.emit('data:saveError', { error });
      throw error;
    }
  }

  /**
   * Prepare save data with metadata
   */
  prepareSaveData(gameState, saveName) {
    const timestamp = Date.now();
    const date = new Date(timestamp);
    
    return {
      name: saveName || `Auto-Save ${date.toLocaleString()}`,
      timestamp,
      version: this.currentSchemaVersion,
      gameVersion: gameState.version || '0.2.0',
      gameState: this.compressGameState(gameState),
      metadata: {
        companyName: gameState.company?.name || 'Unknown Company',
        funds: gameState.company?.funds || 0,
        pilots: gameState.pilots?.length || 0,
        mechs: gameState.mechs?.length || 0,
        currentDate: gameState.time ? 
          `${gameState.time.month}/${gameState.time.day}/${gameState.time.year}` : 'Unknown',
        playtime: gameState.statistics?.playtime || 0
      },
      size: this.calculateDataSize(gameState)
    };
  }

  /**
   * Compress game state to reduce storage size
   */
  compressGameState(gameState) {
    // Remove unnecessary data for storage
    const compressed = { ...gameState };
    
    // Remove UI state
    delete compressed.selectedPilot;
    delete compressed.selectedMech;
    delete compressed.selectedContract;
    delete compressed.currentScreen;
    delete compressed.previousScreen;
    
    // Remove temporary data
    delete compressed._tempData;
    delete compressed._cache;
    
    return compressed;
  }

  /**
   * Validate save data integrity
   */
  validateSaveData(saveData) {
    if (!saveData.gameState) {
      throw new Error('Invalid save data: missing game state');
    }
    
    if (!saveData.version) {
      throw new Error('Invalid save data: missing version');
    }
    
    if (!saveData.timestamp) {
      throw new Error('Invalid save data: missing timestamp');
    }
    
    // Check required game state properties
    const requiredProps = ['company', 'time', 'pilots', 'mechs'];
    for (const prop of requiredProps) {
      if (!saveData.gameState[prop]) {
        throw new Error(`Invalid save data: missing ${prop}`);
      }
    }
  }

  /**
   * Calculate data size for storage tracking
   */
  calculateDataSize(data) {
    return new Blob([JSON.stringify(data)]).size;
  }

  /**
   * Add save operation to queue
   */
  async addToSaveQueue(saveData) {
    return new Promise((resolve, reject) => {
      this.saveQueue.push({
        saveData,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processSaveQueue();
    });
  }

  /**
   * Process the save queue
   */
  async processSaveQueue() {
    if (this.isProcessingQueue || this.saveQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.saveQueue.length > 0) {
      const queueItem = this.saveQueue.shift();
      
      try {
        const result = await this.performSave(queueItem.saveData);
        queueItem.resolve(result);
      } catch (error) {
        queueItem.reject(error);
      }
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Perform the actual save operation
   */
  async performSave(saveData) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameSaves'], 'readwrite');
      const store = transaction.objectStore('gameSaves');
      
      const request = store.add(saveData);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }

  /**
   * Load game save
   */
  async loadGame(saveId) {
    try {
      if (!this.isInitialized) {
        throw new Error('DataManager not initialized');
      }
      
      const saveData = await this.getSaveById(saveId);
      
      if (!saveData) {
        throw new Error(`Save with ID ${saveId} not found`);
      }
      
      // Validate and migrate if necessary
      const gameState = await this.validateAndMigrateData(saveData);
      
      this.logger.info(`Game loaded: ${saveData.name}`);
      this.eventBus.emit('data:gameLoaded', { saveData, gameState });
      
      return gameState;
      
    } catch (error) {
      this.logger.error('Failed to load game:', error);
      this.eventBus.emit('data:loadError', { error });
      throw error;
    }
  }

  /**
   * Get save by ID
   */
  async getSaveById(saveId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameSaves'], 'readonly');
      const store = transaction.objectStore('gameSaves');
      const request = store.get(saveId);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Validate and migrate save data if needed
   */
  async validateAndMigrateData(saveData) {
    try {
      let gameState = saveData.gameState;
      
      // Check if migration is needed
      if (saveData.version !== this.currentSchemaVersion) {
        this.logger.info(`Migrating save data from ${saveData.version} to ${this.currentSchemaVersion}`);
        gameState = await this.migrateSaveData(gameState, saveData.version);
      }
      
      // Validate the loaded data
      this.validateGameState(gameState);
      
      return gameState;
      
    } catch (error) {
      this.logger.error('Data validation/migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate save data between versions
   */
  async migrateSaveData(gameState, fromVersion) {
    // Version migration logic
    switch (fromVersion) {
      case '0.1.0':
        gameState = this.migrateFrom010(gameState);
        break;
      // Add more migration cases as needed
      default:
        this.logger.warn(`Unknown save version: ${fromVersion}`);
    }
    
    return gameState;
  }

  /**
   * Migration from version 0.1.0
   */
  migrateFrom010(gameState) {
    // Example migration logic
    if (!gameState.statistics) {
      gameState.statistics = {
        playtime: 0,
        contractsCompleted: 0,
        pilotHires: 0,
        mechsPurchased: 0
      };
    }
    
    return gameState;
  }

  /**
   * Validate game state structure
   */
  validateGameState(gameState) {
    const requiredProperties = [
      'company',
      'time',
      'pilots',
      'mechs',
      'contracts'
    ];
    
    for (const prop of requiredProperties) {
      if (!(prop in gameState)) {
        throw new Error(`Invalid game state: missing ${prop}`);
      }
    }
    
    // Validate company data
    if (!gameState.company.name || typeof gameState.company.funds !== 'number') {
      throw new Error('Invalid company data');
    }
    
    // Validate arrays
    if (!Array.isArray(gameState.pilots) || !Array.isArray(gameState.mechs)) {
      throw new Error('Invalid array data in game state');
    }
  }

  /**
   * Get all saved games
   */
  async getAllSaves() {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameSaves'], 'readonly');
      const store = transaction.objectStore('gameSaves');
      const request = store.getAll();
      
      request.onsuccess = () => {
        // Sort by timestamp, newest first
        const saves = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(saves);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Delete a saved game
   */
  async deleteSave(saveId) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['gameSaves'], 'readwrite');
      const store = transaction.objectStore('gameSaves');
      const request = store.delete(saveId);
      
      request.onsuccess = () => {
        this.logger.info(`Save ${saveId} deleted`);
        this.eventBus.emit('data:saveDeleted', { saveId });
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Save/load settings
   */
  async saveSetting(key, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value, timestamp: Date.now() });
      
      request.onsuccess = () => {
        this.cache.set(`setting_${key}`, { value, timestamp: Date.now() });
        resolve();
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async loadSetting(key, defaultValue = null) {
    // Check cache first
    const cacheKey = `setting_${key}`;
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.value;
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        const value = result ? result.value : defaultValue;
        
        // Cache the result
        this.cache.set(cacheKey, { value, timestamp: Date.now() });
        
        resolve(value);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Export save data as JSON
   */
  async exportSave(saveId) {
    try {
      const saveData = await this.getSaveById(saveId);
      if (!saveData) {
        throw new Error(`Save ${saveId} not found`);
      }
      
      const exportData = {
        ...saveData,
        exportedAt: new Date().toISOString(),
        exportVersion: this.currentSchemaVersion
      };
      
      return JSON.stringify(exportData, null, 2);
      
    } catch (error) {
      this.logger.error('Failed to export save:', error);
      throw error;
    }
  }

  /**
   * Import save data from JSON
   */
  async importSave(jsonData, saveName = null) {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validate import data
      if (!importData.gameState || !importData.version) {
        throw new Error('Invalid import data');
      }
      
      // Create new save with imported data
      const saveData = this.prepareSaveData(
        importData.gameState,
        saveName || `Imported - ${importData.name || 'Unknown'}`
      );
      
      return await this.addToSaveQueue(saveData);
      
    } catch (error) {
      this.logger.error('Failed to import save:', error);
      throw error;
    }
  }

  /**
   * Setup periodic cleanup of old data
   */
  setupPeriodicCleanup() {
    setInterval(async () => {
      try {
        await this.cleanupOldData();
      } catch (error) {
        this.logger.error('Cleanup error:', error);
      }
    }, 24 * 60 * 60 * 1000); // Daily cleanup
  }

  /**
   * Cleanup old temporary data and cache
   */
  async cleanupOldData() {
    // Clear expired cache entries
    const now = Date.now();
    for (const [key, data] of this.cache.entries()) {
      if (now - data.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
    
    // Clear expired temporary data from database
    const transaction = this.db.transaction(['tempData'], 'readwrite');
    const store = transaction.objectStore('tempData');
    const index = store.index('expires');
    const range = IDBKeyRange.upperBound(now);
    
    return new Promise((resolve) => {
      const request = index.openCursor(range);
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  /**
   * Setup auto-save functionality
   */
  setupAutoSave() {
    this.eventBus.on('game:stateChanged', async (gameState) => {
      try {
        // Auto-save every 5 minutes of gameplay
        const lastAutoSave = await this.loadSetting('lastAutoSave', 0);
        const now = Date.now();
        
        if (now - lastAutoSave > 5 * 60 * 1000) { // 5 minutes
          await this.saveGame(gameState, 'Auto-Save');
          await this.saveSetting('lastAutoSave', now);
        }
      } catch (error) {
        this.logger.warn('Auto-save failed:', error);
      }
    });
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const saves = await this.getAllSaves();
      const totalSize = saves.reduce((sum, save) => sum + (save.size || 0), 0);
      
      return {
        totalSaves: saves.length,
        totalSize,
        averageSize: saves.length > 0 ? Math.round(totalSize / saves.length) : 0,
        oldestSave: saves.length > 0 ? saves[saves.length - 1].timestamp : null,
        newestSave: saves.length > 0 ? saves[0].timestamp : null
      };
    } catch (error) {
      this.logger.error('Failed to get storage stats:', error);
      return null;
    }
  }

  /**
   * Shutdown data manager
   */
  async shutdown() {
    try {
      // Process any remaining saves in queue
      await this.processSaveQueue();
      
      // Close database connection
      if (this.db) {
        this.db.close();
        this.db = null;
      }
      
      // Clear cache
      this.cache.clear();
      
      this.isInitialized = false;
      this.logger.info('DataManager shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during DataManager shutdown:', error);
    }
  }
}