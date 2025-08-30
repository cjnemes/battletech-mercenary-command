/**
 * Bulletproof Save Manager - Persistent storage system
 * This system handles game save/load operations with multiple fallbacks
 */

class SaveManager {
    constructor(eventBus, logger) {
        this.eventBus = eventBus || console;
        this.logger = logger || console;
        this.initialized = false;
        
        // Storage configuration
        this.saveKey = 'battletech_save_v2';
        this.autoSaveKey = 'battletech_autosave_v2';
        this.backupKey = 'battletech_backup_v2';
        this.maxSaveSize = 10 * 1024 * 1024; // 10MB limit
        this.compressionEnabled = true;
        
        // Save metadata
        this.saveMetadata = {
            version: '2.0.0',
            lastSaved: null,
            saveCount: 0,
            autoSaveInterval: 5 * 60 * 1000 // 5 minutes
        };
        
        // Auto-save timer
        this.autoSaveTimer = null;
        
        try {
            this.initialize();
        } catch (error) {
            this.logger.error?.('SaveManager initialization failed', error) || 
                console.error('SaveManager init failed:', error);
            throw error;
        }
    }
    
    initialize() {
        this.logger.info?.('SaveManager initializing...') || console.log('SaveManager initializing...');
        
        // Test storage availability
        this.testStorageCapabilities();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Start auto-save if enabled
        this.startAutoSave();
        
        this.initialized = true;
        this.logger.info?.('SaveManager initialized successfully') || console.log('SaveManager initialized');
        
        // Emit initialization event
        this.emitEvent('savemanager.initialized', { timestamp: Date.now() });
    }
    
    testStorageCapabilities() {
        try {
            // Test localStorage availability
            if (this.isLocalStorageAvailable()) {
                this.storageMethod = 'localStorage';
                this.logger.info?.('Using localStorage for saves') || console.log('Using localStorage');
            } else if (this.isSessionStorageAvailable()) {
                this.storageMethod = 'sessionStorage';
                this.logger.warn?.('localStorage unavailable, using sessionStorage') || 
                    console.warn('Using sessionStorage fallback');
            } else {
                this.storageMethod = 'memory';
                this.memoryStorage = {};
                this.logger.warn?.('No persistent storage available, using memory only') || 
                    console.warn('Memory-only storage');
            }
            
        } catch (error) {
            this.logger.error?.('Storage capability test failed', error) || 
                console.error('Storage test failed:', error);
            this.storageMethod = 'memory';
            this.memoryStorage = {};
        }
    }
    
    setupEventHandlers() {
        try {
            // Listen for manual save requests
            this.eventBus.on?.('game.save', (data) => {
                this.saveGame(data.gameState, data.saveSlot);
            });
            
            // Listen for load requests
            this.eventBus.on?.('game.load', (data) => {
                this.loadGame(data.saveSlot);
            });
            
            // Listen for auto-save requests
            this.eventBus.on?.('game.autosave', (data) => {
                this.autoSave(data.gameState);
            });
            
            // Listen for state changes that trigger saves
            this.eventBus.on?.('state.updated', (data) => {
                if (this.shouldTriggerAutoSave(data)) {
                    // Delay auto-save to avoid frequent saves
                    this.scheduleAutoSave();
                }
            });
            
            this.logger.debug?.('Save event handlers established') || 
                console.debug('Save handlers ready');
                
        } catch (error) {
            this.logger.error?.('Failed to setup save event handlers', error) || 
                console.error('Save handlers failed:', error);
        }
    }
    
    /**
     * Save game state to specified slot
     */
    async saveGame(gameState, saveSlot = 'default') {
        try {
            if (!gameState) {
                throw new Error('No game state provided for saving');
            }
            
            this.logger.info?.(`Saving game to slot: ${saveSlot}`) || 
                console.log(`Saving to: ${saveSlot}`);
            
            // Prepare save data
            const saveData = this.prepareSaveData(gameState);
            
            // Validate save size
            if (!this.validateSaveSize(saveData)) {
                throw new Error('Save data exceeds maximum size limit');
            }
            
            // Create backup of previous save
            await this.createSaveBackup(saveSlot);
            
            // Compress if enabled
            let finalData = saveData;
            if (this.compressionEnabled) {
                finalData = this.compressData(saveData);
            }
            
            // Write save data
            const success = await this.writeSaveData(saveSlot, finalData);
            
            if (success) {
                this.updateSaveMetadata();
                this.logger.info?.(`Game saved successfully to slot: ${saveSlot}`) || 
                    console.log(`Save complete: ${saveSlot}`);
                
                this.emitEvent('game.saved', {
                    saveSlot,
                    timestamp: Date.now(),
                    size: this.calculateDataSize(finalData)
                });
                
                return true;
            } else {
                throw new Error('Failed to write save data');
            }
            
        } catch (error) {
            this.logger.error?.(`Failed to save game to slot: ${saveSlot}`, error) || 
                console.error(`Save failed: ${saveSlot}`, error);
            
            this.emitEvent('game.save.failed', {
                saveSlot,
                error: error.message,
                timestamp: Date.now()
            });
            
            return false;
        }
    }
    
    /**
     * Load game state from specified slot
     */
    async loadGame(saveSlot = 'default') {
        try {
            this.logger.info?.(`Loading game from slot: ${saveSlot}`) || 
                console.log(`Loading from: ${saveSlot}`);
            
            // Read save data
            const rawData = await this.readSaveData(saveSlot);
            
            if (!rawData) {
                throw new Error(`No save data found in slot: ${saveSlot}`);
            }
            
            // Decompress if needed
            let saveData = rawData;
            if (this.compressionEnabled && this.isCompressed(rawData)) {
                saveData = this.decompressData(rawData);
            }
            
            // Validate save data
            if (!this.validateSaveData(saveData)) {
                throw new Error('Save data validation failed');
            }
            
            // Parse game state
            const gameState = this.parseSaveData(saveData);
            
            if (!gameState) {
                throw new Error('Failed to parse game state from save data');
            }
            
            this.logger.info?.(`Game loaded successfully from slot: ${saveSlot}`) || 
                console.log(`Load complete: ${saveSlot}`);
            
            this.emitEvent('game.loaded', {
                saveSlot,
                gameState,
                timestamp: Date.now()
            });
            
            return gameState;
            
        } catch (error) {
            this.logger.error?.(`Failed to load game from slot: ${saveSlot}`, error) || 
                console.error(`Load failed: ${saveSlot}`, error);
            
            this.emitEvent('game.load.failed', {
                saveSlot,
                error: error.message,
                timestamp: Date.now()
            });
            
            return null;
        }
    }
    
    /**
     * Auto-save game state
     */
    async autoSave(gameState) {
        try {
            if (!this.initialized || !gameState) {
                return false;
            }
            
            this.logger.debug?.('Auto-saving game state...') || console.debug('Auto-saving...');
            
            const success = await this.saveGame(gameState, 'autosave');
            
            if (success) {
                this.emitEvent('game.autosaved', { timestamp: Date.now() });
            }
            
            return success;
            
        } catch (error) {
            this.logger.error?.('Auto-save failed', error) || console.error('Auto-save failed:', error);
            return false;
        }
    }
    
    /**
     * Get list of available save slots
     */
    async getSaveSlots() {
        try {
            const slots = [];
            
            // Check common save slots
            const commonSlots = ['default', 'autosave', 'backup'];
            
            for (const slot of commonSlots) {
                const data = await this.readSaveData(slot);
                if (data) {
                    const metadata = this.extractSaveMetadata(data);
                    slots.push({
                        slot,
                        metadata,
                        size: this.calculateDataSize(data),
                        exists: true
                    });
                }
            }
            
            // Check for numbered slots (1-10)
            for (let i = 1; i <= 10; i++) {
                const slot = `save_${i}`;
                const data = await this.readSaveData(slot);
                if (data) {
                    const metadata = this.extractSaveMetadata(data);
                    slots.push({
                        slot,
                        metadata,
                        size: this.calculateDataSize(data),
                        exists: true
                    });
                }
            }
            
            return slots;
            
        } catch (error) {
            this.logger.error?.('Failed to get save slots', error) || 
                console.error('Get save slots failed:', error);
            return [];
        }
    }
    
    /**
     * Delete save slot
     */
    async deleteSave(saveSlot) {
        try {
            const key = `${this.saveKey}_${saveSlot}`;
            
            switch (this.storageMethod) {
                case 'localStorage':
                    localStorage.removeItem(key);
                    break;
                case 'sessionStorage':
                    sessionStorage.removeItem(key);
                    break;
                case 'memory':
                    delete this.memoryStorage[key];
                    break;
            }
            
            this.logger.info?.(`Save slot deleted: ${saveSlot}`) || 
                console.log(`Deleted: ${saveSlot}`);
            
            this.emitEvent('save.deleted', { saveSlot, timestamp: Date.now() });
            
            return true;
            
        } catch (error) {
            this.logger.error?.(`Failed to delete save slot: ${saveSlot}`, error) || 
                console.error(`Delete failed: ${saveSlot}`, error);
            return false;
        }
    }
    
    /**
     * Helper methods for storage operations
     */
    async writeSaveData(saveSlot, data) {
        try {
            const key = `${this.saveKey}_${saveSlot}`;
            const serialized = JSON.stringify(data);
            
            switch (this.storageMethod) {
                case 'localStorage':
                    localStorage.setItem(key, serialized);
                    break;
                case 'sessionStorage':
                    sessionStorage.setItem(key, serialized);
                    break;
                case 'memory':
                    this.memoryStorage[key] = serialized;
                    break;
                default:
                    throw new Error(`Unknown storage method: ${this.storageMethod}`);
            }
            
            return true;
            
        } catch (error) {
            this.logger.error?.('Failed to write save data', error) || 
                console.error('Write save data failed:', error);
            return false;
        }
    }
    
    async readSaveData(saveSlot) {
        try {
            const key = `${this.saveKey}_${saveSlot}`;
            let serialized = null;
            
            switch (this.storageMethod) {
                case 'localStorage':
                    serialized = localStorage.getItem(key);
                    break;
                case 'sessionStorage':
                    serialized = sessionStorage.getItem(key);
                    break;
                case 'memory':
                    serialized = this.memoryStorage[key] || null;
                    break;
                default:
                    throw new Error(`Unknown storage method: ${this.storageMethod}`);
            }
            
            return serialized ? JSON.parse(serialized) : null;
            
        } catch (error) {
            this.logger.error?.('Failed to read save data', error) || 
                console.error('Read save data failed:', error);
            return null;
        }
    }
    
    prepareSaveData(gameState) {
        try {
            return {
                version: this.saveMetadata.version,
                timestamp: Date.now(),
                gameState: this.serializeGameState(gameState),
                metadata: {
                    saveCount: this.saveMetadata.saveCount + 1,
                    gameVersion: gameState.meta?.version || '2.0.0'
                }
            };
            
        } catch (error) {
            this.logger.error?.('Failed to prepare save data', error) || 
                console.error('Prepare save data failed:', error);
            throw error;
        }
    }
    
    serializeGameState(gameState) {
        try {
            const serialized = JSON.parse(JSON.stringify(gameState, (key, value) => {
                // Handle Map objects
                if (value instanceof Map) {
                    return {
                        __type: 'Map',
                        __data: Array.from(value.entries())
                    };
                }
                // Handle Date objects
                if (value instanceof Date) {
                    return {
                        __type: 'Date',
                        __data: value.toISOString()
                    };
                }
                return value;
            }));
            
            return serialized;
            
        } catch (error) {
            this.logger.error?.('Failed to serialize game state', error) || 
                console.error('Serialize failed:', error);
            throw error;
        }
    }
    
    parseSaveData(saveData) {
        try {
            if (!saveData.gameState) {
                throw new Error('No game state in save data');
            }
            
            const gameState = JSON.parse(JSON.stringify(saveData.gameState), (key, value) => {
                // Handle Map objects
                if (value && value.__type === 'Map') {
                    return new Map(value.__data);
                }
                // Handle Date objects
                if (value && value.__type === 'Date') {
                    return new Date(value.__data);
                }
                return value;
            });
            
            return gameState;
            
        } catch (error) {
            this.logger.error?.('Failed to parse save data', error) || 
                console.error('Parse save data failed:', error);
            return null;
        }
    }
    
    validateSaveData(saveData) {
        try {
            if (!saveData || typeof saveData !== 'object') {
                return false;
            }
            
            if (!saveData.version || !saveData.timestamp || !saveData.gameState) {
                return false;
            }
            
            return true;
            
        } catch (error) {
            return false;
        }
    }
    
    validateSaveSize(saveData) {
        try {
            const size = this.calculateDataSize(saveData);
            return size <= this.maxSaveSize;
        } catch (error) {
            return false;
        }
    }
    
    calculateDataSize(data) {
        try {
            return JSON.stringify(data).length * 2; // Rough estimate
        } catch (error) {
            return 0;
        }
    }
    
    // Storage capability tests
    isLocalStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    isSessionStorageAvailable() {
        try {
            const test = '__storage_test__';
            sessionStorage.setItem(test, 'test');
            sessionStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
    
    // Auto-save management
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.emitEvent('game.autosave.trigger', { timestamp: Date.now() });
        }, this.saveMetadata.autoSaveInterval);
    }
    
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    scheduleAutoSave() {
        // Implement debounced auto-save
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.emitEvent('game.autosave.trigger', { timestamp: Date.now() });
        }, 30000); // 30 second delay
    }
    
    shouldTriggerAutoSave(stateChangeData) {
        // Only auto-save on significant changes
        if (!stateChangeData || !stateChangeData.path) {
            return false;
        }
        
        const significantPaths = [
            'company.funds',
            'personnel.pilots',
            'assets.mechs',
            'contracts.active',
            'game.currentDate'
        ];
        
        return significantPaths.some(path => stateChangeData.path.startsWith(path));
    }
    
    // Placeholder methods for compression (can be implemented later)
    compressData(data) {
        // TODO: Implement actual compression
        return data;
    }
    
    decompressData(data) {
        // TODO: Implement actual decompression
        return data;
    }
    
    isCompressed(data) {
        // TODO: Implement compression detection
        return false;
    }
    
    createSaveBackup(saveSlot) {
        // TODO: Implement save backup
        return Promise.resolve();
    }
    
    extractSaveMetadata(saveData) {
        try {
            return {
                version: saveData.version,
                timestamp: saveData.timestamp,
                gameVersion: saveData.metadata?.gameVersion
            };
        } catch (error) {
            return {};
        }
    }
    
    updateSaveMetadata() {
        this.saveMetadata.lastSaved = Date.now();
        this.saveMetadata.saveCount++;
    }
    
    emitEvent(eventName, data) {
        try {
            if (this.eventBus && this.eventBus.emit) {
                this.eventBus.emit(eventName, data);
            }
        } catch (error) {
            console.error(`Failed to emit save event: ${eventName}`, error);
        }
    }
    
    /**
     * Cleanup method
     */
    shutdown() {
        try {
            this.stopAutoSave();
            this.logger.info?.('SaveManager shutdown complete') || console.log('SaveManager shutdown');
        } catch (error) {
            console.error('SaveManager shutdown failed:', error);
        }
    }
}

// Export for use in other modules
window.BattletechSaveManager = SaveManager;

export default SaveManager;