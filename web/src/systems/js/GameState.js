/**
 * Game State - Centralized Game State Management
 * Manages the current game state with validation and change tracking
 */
import { Logger } from '../../utils/Logger.js';

export class GameState {
  constructor(eventBus) {
    this.logger = new Logger('GameState');
    this.eventBus = eventBus;
    this.state = {};
    this.previousState = {};
    this.changeLog = [];
    this.maxChangeLog = 100;
    this.hasUnsavedChanges = false;
    this.lastSaveTime = 0;
    this.isInitialized = false;
    
    // State validation schema
    this.stateSchema = this.getStateSchema();
  }

  /**
   * Initialize game state
   */
  async initialize() {
    try {
      this.logger.info('Initializing GameState...');
      
      // Initialize with default state
      await this.initializeDefaults();
      
      this.isInitialized = true;
      this.logger.info('GameState initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize GameState:', error);
      throw error;
    }
  }

  /**
   * Initialize with default game state
   */
  async initializeDefaults() {
    this.state = {
      // Game metadata
      version: '0.2.0',
      createdAt: Date.now(),
      lastSaved: 0,
      
      // UI state
      currentScreen: 'main-menu',
      previousScreen: null,
      selectedPilot: null,
      selectedMech: null,
      selectedContract: null,
      
      // Game state
      inGame: false,
      isPaused: false,
      
      // Company data
      company: {
        name: "New Company",
        funds: 500000,
        rating: 'Green',
        reputation: {
          'Steiner': 0,
          'Davion': 0,
          'Liao': 0,
          'Marik': 0,
          'Kurita': 0,
          'Mercenary': 25
        },
        expenses: {
          monthly: 45000,
          salaries: 0,
          maintenance: 0,
          insurance: 0
        }
      },
      
      // Time system
      time: {
        day: 1,
        month: 1,
        year: 3025
      },
      
      // Game entities
      pilots: [],
      mechs: [],
      contracts: [],
      
      // Combat state
      combat: {
        isActive: false,
        turn: 0,
        currentUnit: null,
        battlefield: null
      },
      
      // Player statistics
      statistics: {
        playtime: 0,
        contractsCompleted: 0,
        contractsFailed: 0,
        pilotHires: 0,
        pilotDeaths: 0,
        mechsPurchased: 0,
        mechsLost: 0,
        totalEarnings: 0,
        totalSpending: 0
      },
      
      // Game settings (stored in state for save compatibility)
      settings: {
        autoSave: true,
        difficulty: 'normal',
        combatSpeed: 'normal',
        soundEnabled: true,
        musicEnabled: true
      }
    };
    
    this.validateState();
    this.logStateChange('initialized', this.state);
    
    this.eventBus.emit('gameState:initialized', { state: this.state });
  }

  /**
   * Get state validation schema
   */
  getStateSchema() {
    return {
      version: { type: 'string', required: true },
      createdAt: { type: 'number', required: true },
      company: {
        type: 'object',
        required: true,
        properties: {
          name: { type: 'string', required: true },
          funds: { type: 'number', required: true },
          rating: { type: 'string', required: true }
        }
      },
      time: {
        type: 'object',
        required: true,
        properties: {
          day: { type: 'number', required: true },
          month: { type: 'number', required: true },
          year: { type: 'number', required: true }
        }
      },
      pilots: { type: 'array', required: true },
      mechs: { type: 'array', required: true },
      contracts: { type: 'array', required: true },
      statistics: { type: 'object', required: true }
    };
  }

  /**
   * Validate current state against schema
   */
  validateState() {
    const errors = this.validateObject(this.state, this.stateSchema);
    if (errors.length > 0) {
      throw new Error(`State validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate object against schema
   */
  validateObject(obj, schema, path = '') {
    const errors = [];
    
    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      // Check required fields
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`Missing required field: ${currentPath}`);
        continue;
      }
      
      if (value !== undefined && value !== null) {
        // Check type
        if (rules.type && !this.checkType(value, rules.type)) {
          errors.push(`Invalid type for ${currentPath}: expected ${rules.type}, got ${typeof value}`);
        }
        
        // Check nested object properties
        if (rules.type === 'object' && rules.properties) {
          errors.push(...this.validateObject(value, rules.properties, currentPath));
        }
      }
    }
    
    return errors;
  }

  /**
   * Check if value matches expected type
   */
  checkType(value, expectedType) {
    switch (expectedType) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && !Array.isArray(value);
      default:
        return true;
    }
  }

  /**
   * Get current state
   */
  getCurrentState() {
    return { ...this.state };
  }

  /**
   * Get specific state property
   */
  get(path) {
    return this.getNestedProperty(this.state, path);
  }

  /**
   * Set specific state property
   */
  set(path, value, options = {}) {
    const oldValue = this.getNestedProperty(this.state, path);
    this.setNestedProperty(this.state, path, value);
    
    if (!options.silent) {
      this.logStateChange('set', { path, oldValue, newValue: value });
      this.markUnsaved();
      this.eventBus.emit('gameState:changed', { 
        path, 
        oldValue, 
        newValue: value,
        state: this.state 
      });
    }
  }

  /**
   * Update multiple state properties
   */
  update(updates, options = {}) {
    const changes = [];
    
    for (const [path, value] of Object.entries(updates)) {
      const oldValue = this.getNestedProperty(this.state, path);
      this.setNestedProperty(this.state, path, value);
      changes.push({ path, oldValue, newValue: value });
    }
    
    if (!options.silent && changes.length > 0) {
      this.logStateChange('update', changes);
      this.markUnsaved();
      this.eventBus.emit('gameState:updated', { 
        changes,
        state: this.state 
      });
    }
  }

  /**
   * Load state from external source
   */
  async loadState(newState) {
    try {
      // Store previous state
      this.previousState = { ...this.state };
      
      // Validate new state
      const tempState = { ...newState };
      this.validateObject(tempState, this.stateSchema);
      
      // Update current state
      this.state = tempState;
      
      this.logStateChange('loaded', this.state);
      this.markSaved();
      
      this.eventBus.emit('gameState:loaded', { 
        previousState: this.previousState,
        currentState: this.state 
      });
      
      this.logger.info('Game state loaded successfully');
      
    } catch (error) {
      this.logger.error('Failed to load game state:', error);
      // Restore previous state on error
      if (this.previousState) {
        this.state = this.previousState;
      }
      throw error;
    }
  }

  /**
   * Reset state to defaults
   */
  async resetState() {
    this.previousState = { ...this.state };
    await this.initializeDefaults();
    this.markUnsaved();
    
    this.eventBus.emit('gameState:reset', {
      previousState: this.previousState,
      currentState: this.state
    });
    
    this.logger.info('Game state reset to defaults');
  }

  /**
   * Get nested property by path
   */
  getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Set nested property by path
   */
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key];
    }, obj);
    
    target[lastKey] = value;
  }

  /**
   * Add item to array property
   */
  addToArray(path, item) {
    const array = this.getNestedProperty(this.state, path);
    if (!Array.isArray(array)) {
      throw new Error(`Property ${path} is not an array`);
    }
    
    array.push(item);
    this.logStateChange('arrayAdd', { path, item });
    this.markUnsaved();
    
    this.eventBus.emit('gameState:arrayChanged', {
      action: 'add',
      path,
      item,
      array: [...array]
    });
  }

  /**
   * Remove item from array property
   */
  removeFromArray(path, predicate) {
    const array = this.getNestedProperty(this.state, path);
    if (!Array.isArray(array)) {
      throw new Error(`Property ${path} is not an array`);
    }
    
    const index = typeof predicate === 'function' 
      ? array.findIndex(predicate)
      : array.indexOf(predicate);
    
    if (index !== -1) {
      const removedItem = array.splice(index, 1)[0];
      this.logStateChange('arrayRemove', { path, item: removedItem, index });
      this.markUnsaved();
      
      this.eventBus.emit('gameState:arrayChanged', {
        action: 'remove',
        path,
        item: removedItem,
        index,
        array: [...array]
      });
      
      return removedItem;
    }
    
    return null;
  }

  /**
   * Update item in array property
   */
  updateArrayItem(path, predicate, updates) {
    const array = this.getNestedProperty(this.state, path);
    if (!Array.isArray(array)) {
      throw new Error(`Property ${path} is not an array`);
    }
    
    const index = typeof predicate === 'function'
      ? array.findIndex(predicate)
      : array.indexOf(predicate);
    
    if (index !== -1) {
      const oldItem = { ...array[index] };
      Object.assign(array[index], updates);
      
      this.logStateChange('arrayUpdate', { path, index, oldItem, newItem: array[index] });
      this.markUnsaved();
      
      this.eventBus.emit('gameState:arrayChanged', {
        action: 'update',
        path,
        index,
        oldItem,
        newItem: array[index],
        array: [...array]
      });
      
      return array[index];
    }
    
    return null;
  }

  /**
   * Log state change
   */
  logStateChange(action, data) {
    const changeEntry = {
      timestamp: Date.now(),
      action,
      data
    };
    
    this.changeLog.push(changeEntry);
    
    // Maintain change log size
    if (this.changeLog.length > this.maxChangeLog) {
      this.changeLog.shift();
    }
    
    this.logger.debug(`State changed: ${action}`, data);
  }

  /**
   * Mark state as having unsaved changes
   */
  markUnsaved() {
    this.hasUnsavedChanges = true;
    this.eventBus.emit('gameState:unsaved');
  }

  /**
   * Mark state as saved
   */
  markSaved() {
    this.hasUnsavedChanges = false;
    this.lastSaveTime = Date.now();
    this.state.lastSaved = this.lastSaveTime;
    this.eventBus.emit('gameState:saved');
  }

  /**
   * Check if state has unsaved changes
   */
  hasUnsavedChanges() {
    return this.hasUnsavedChanges;
  }

  /**
   * Get change log
   */
  getChangeLog(limit = 50) {
    return this.changeLog.slice(-limit);
  }

  /**
   * Clear change log
   */
  clearChangeLog() {
    this.changeLog.length = 0;
  }

  /**
   * Create state snapshot
   */
  createSnapshot() {
    return {
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(this.state)),
      hasUnsavedChanges: this.hasUnsavedChanges
    };
  }

  /**
   * Restore from snapshot
   */
  restoreFromSnapshot(snapshot) {
    this.previousState = { ...this.state };
    this.state = { ...snapshot.state };
    this.hasUnsavedChanges = snapshot.hasUnsavedChanges;
    
    this.logStateChange('restored', { snapshot });
    this.eventBus.emit('gameState:restored', {
      snapshot,
      previousState: this.previousState,
      currentState: this.state
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(path, callback) {
    const listenerId = this.eventBus.on('gameState:changed', (data) => {
      if (!path || data.path === path || data.path.startsWith(path + '.')) {
        callback(data);
      }
    });
    
    return listenerId;
  }

  /**
   * Update method called by game loop
   */
  update(deltaTime) {
    // Update playtime
    this.state.statistics.playtime += deltaTime;
    
    // Auto-save periodically
    if (this.state.settings.autoSave && this.hasUnsavedChanges) {
      const timeSinceLastSave = Date.now() - this.lastSaveTime;
      if (timeSinceLastSave > 5 * 60 * 1000) { // 5 minutes
        this.eventBus.emit('game:autoSave', this.state);
      }
    }
  }

  /**
   * Export state as JSON
   */
  exportState() {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import state from JSON
   */
  importState(jsonData) {
    try {
      const importedState = JSON.parse(jsonData);
      return this.loadState(importedState);
    } catch (error) {
      this.logger.error('Failed to import state:', error);
      throw new Error('Invalid JSON data');
    }
  }

  /**
   * Get state statistics
   */
  getStateStats() {
    return {
      version: this.state.version,
      createdAt: this.state.createdAt,
      lastSaved: this.state.lastSaved,
      hasUnsavedChanges: this.hasUnsavedChanges,
      changeLogSize: this.changeLog.length,
      pilots: this.state.pilots.length,
      mechs: this.state.mechs.length,
      contracts: this.state.contracts.length,
      playtime: this.state.statistics.playtime,
      funds: this.state.company.funds
    };
  }

  /**
   * Shutdown game state
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down GameState...');
      
      // Clear change log
      this.changeLog.length = 0;
      
      // Emit shutdown event
      this.eventBus.emit('gameState:shutdown');
      
      this.isInitialized = false;
      this.logger.info('GameState shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during GameState shutdown:', error);
    }
  }
}