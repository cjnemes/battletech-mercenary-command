/**
 * Game Engine - Core Game System Orchestrator
 * Manages all game systems, state, and lifecycle
 */
import { Logger } from '../../utils/Logger.js';
import { DataManager } from './DataManager.js';
import { ScreenManager } from './ScreenManager.js';
import { GameState } from './GameState.js';

// Import game systems
import { CompanySystem } from './CompanySystem.js';
import { PilotSystem } from './PilotSystem.js';
import { MechSystem } from './MechSystem.js';
import { ContractSystem } from './ContractSystem.js';
import { CombatSystem } from './CombatSystem.js';
import { FactionSystem } from './FactionSystem.js';
import { TutorialSystem } from './TutorialSystem.js';
import { AudioManager } from './AudioManager.js';
import { MobileOptimizer } from './MobileOptimizer.js';

export class GameEngine {
  constructor(eventBus) {
    this.logger = new Logger('GameEngine');
    this.eventBus = eventBus;
    this.isInitialized = false;
    this.isRunning = false;
    this.isPaused = false;
    
    // Core systems
    this.dataManager = null;
    this.screenManager = null;
    this.gameState = null;
    this.audioManager = null;
    this.mobileOptimizer = null;
    
    // Game systems
    this.systems = new Map();
    
    // Game loop
    this.gameLoopId = null;
    this.lastUpdateTime = 0;
    this.targetFPS = 60;
    this.accumulator = 0;
    this.fixedTimeStep = 1000 / this.targetFPS;
    
    // Performance tracking
    this.frameCount = 0;
    this.lastFPSUpdate = 0;
    this.currentFPS = 0;
    
    // Initialization promise for async components
    this.initializationPromises = [];
  }

  /**
   * Initialize the game engine and all systems
   */
  async initialize() {
    try {
      this.logger.info('Initializing GameEngine...');
      
      // Initialize core systems first
      await this.initializeCoreSystems();
      
      // Initialize game systems
      await this.initializeGameSystems();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize game state
      await this.initializeGameState();
      
      // Wait for all async initializations
      await Promise.all(this.initializationPromises);
      
      this.isInitialized = true;
      this.logger.info('GameEngine initialized successfully');
      
      // Emit initialization complete event
      this.eventBus.emit('engine:initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize GameEngine:', error);
      throw error;
    }
  }

  /**
   * Initialize core systems (data, screens, etc.)
   */
  async initializeCoreSystems() {
    // Initialize data manager
    this.dataManager = new DataManager(this.eventBus);
    await this.dataManager.initialize();
    
    // Initialize screen manager
    this.screenManager = new ScreenManager(this.eventBus);
    await this.screenManager.initialize();
    
    // Initialize game state
    this.gameState = new GameState(this.eventBus);
    await this.gameState.initialize();
    
    // Initialize audio manager
    this.audioManager = new AudioManager(this.eventBus);
    await this.audioManager.initialize();
    
    // Initialize mobile optimizer
    this.mobileOptimizer = new MobileOptimizer(this.eventBus);
    await this.mobileOptimizer.initialize();
    
    this.logger.info('Core systems initialized');
  }

  /**
   * Initialize all game systems
   */
  async initializeGameSystems() {
    const systemConfigs = [
      { name: 'tutorial', class: TutorialSystem, priority: 0 }, // Initialize first for early access
      { name: 'company', class: CompanySystem, priority: 1 },
      { name: 'faction', class: FactionSystem, priority: 2 },
      { name: 'pilot', class: PilotSystem, priority: 3 },
      { name: 'mech', class: MechSystem, priority: 4 },
      { name: 'contract', class: ContractSystem, priority: 5 },
      { name: 'combat', class: CombatSystem, priority: 6 }
    ];
    
    // Sort by priority
    systemConfigs.sort((a, b) => a.priority - b.priority);
    
    // Initialize each system
    for (const config of systemConfigs) {
      try {
        const system = new config.class(this.eventBus, this.gameState);
        await system.initialize();
        
        this.systems.set(config.name, system);
        this.logger.info(`${config.name} system initialized`);
        
      } catch (error) {
        this.logger.error(`Failed to initialize ${config.name} system:`, error);
        throw error;
      }
    }
    
    this.logger.info('All game systems initialized');
  }

  /**
   * Setup global event listeners
   */
  setupEventListeners() {
    // Game lifecycle events
    this.eventBus.on('game:start', this.startGame.bind(this));
    this.eventBus.on('game:pause', this.pauseGame.bind(this));
    this.eventBus.on('game:resume', this.resumeGame.bind(this));
    this.eventBus.on('game:stop', this.stopGame.bind(this));
    this.eventBus.on('game:save', this.saveGame.bind(this));
    this.eventBus.on('game:load', this.loadGame.bind(this));
    
    // Screen management events
    this.eventBus.on('screen:change', this.handleScreenChange.bind(this));
    
    // System communication events
    this.eventBus.on('system:error', this.handleSystemError.bind(this));
    this.eventBus.on('system:warning', this.handleSystemWarning.bind(this));
    
    // Performance monitoring
    this.eventBus.on('engine:performance', this.updatePerformanceMetrics.bind(this));
    
    // Application lifecycle
    this.eventBus.on('app:blur', this.handleAppBlur.bind(this));
    this.eventBus.on('app:focus', this.handleAppFocus.bind(this));
    
    this.logger.info('Event listeners setup complete');
  }

  /**
   * Initialize default game state
   */
  async initializeGameState() {
    // Try to load the most recent auto-save
    try {
      const saves = await this.dataManager.getAllSaves();
      const autoSave = saves.find(save => save.name.includes('Auto-Save'));
      
      if (autoSave) {
        this.logger.info('Loading most recent auto-save');
        const gameState = await this.dataManager.loadGame(autoSave.id);
        await this.gameState.loadState(gameState);
        return;
      }
    } catch (error) {
      this.logger.warn('Could not load auto-save, starting fresh:', error);
    }
    
    // Initialize with default state
    await this.gameState.initializeDefaults();
    this.logger.info('Game state initialized with defaults');
  }

  /**
   * Start the game
   */
  async startGame(gameData = null) {
    try {
      if (!this.isInitialized) {
        throw new Error('GameEngine not initialized');
      }
      
      this.logger.info('Starting game...');
      
      // Load game data if provided
      if (gameData) {
        await this.gameState.loadState(gameData);
      }
      
      // Start all systems
      for (const [name, system] of this.systems) {
        if (system.start) {
          await system.start();
          this.logger.debug(`${name} system started`);
        }
      }
      
      // Start game loop
      this.startGameLoop();
      
      this.isRunning = true;
      this.isPaused = false;
      
      this.logger.info('Game started successfully');
      this.eventBus.emit('game:started');
      
    } catch (error) {
      this.logger.error('Failed to start game:', error);
      this.eventBus.emit('game:startError', { error });
      throw error;
    }
  }

  /**
   * Pause the game
   */
  pauseGame() {
    if (!this.isRunning) return;
    
    this.isPaused = true;
    
    // Pause all systems
    for (const [name, system] of this.systems) {
      if (system.pause) {
        system.pause();
      }
    }
    
    this.logger.info('Game paused');
    this.eventBus.emit('game:paused');
  }

  /**
   * Resume the game
   */
  resumeGame() {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    
    // Resume all systems
    for (const [name, system] of this.systems) {
      if (system.resume) {
        system.resume();
      }
    }
    
    // Reset timing to prevent large delta on resume
    this.lastUpdateTime = performance.now();
    
    this.logger.info('Game resumed');
    this.eventBus.emit('game:resumed');
  }

  /**
   * Stop the game
   */
  async stopGame() {
    if (!this.isRunning) return;
    
    try {
      this.logger.info('Stopping game...');
      
      // Stop game loop
      this.stopGameLoop();
      
      // Stop all systems
      for (const [name, system] of this.systems) {
        if (system.stop) {
          await system.stop();
          this.logger.debug(`${name} system stopped`);
        }
      }
      
      this.isRunning = false;
      this.isPaused = false;
      
      this.logger.info('Game stopped');
      this.eventBus.emit('game:stopped');
      
    } catch (error) {
      this.logger.error('Error stopping game:', error);
      this.eventBus.emit('game:stopError', { error });
    }
  }

  /**
   * Start the game loop
   */
  startGameLoop() {
    this.lastUpdateTime = performance.now();
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    this.logger.debug('Game loop started');
  }

  /**
   * Stop the game loop
   */
  stopGameLoop() {
    if (this.gameLoopId) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
      this.logger.debug('Game loop stopped');
    }
  }

  /**
   * Main game loop
   */
  gameLoop(currentTime) {
    if (!this.isRunning) return;
    
    // Calculate delta time
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;
    
    // Update FPS counter
    this.updateFPS(currentTime);
    
    // Skip frame if paused
    if (!this.isPaused) {
      // Fixed timestep with accumulator
      this.accumulator += deltaTime;
      
      // Update systems with fixed timestep
      while (this.accumulator >= this.fixedTimeStep) {
        this.updateSystems(this.fixedTimeStep);
        this.accumulator -= this.fixedTimeStep;
      }
      
      // Render with interpolation
      const interpolation = this.accumulator / this.fixedTimeStep;
      this.renderSystems(interpolation);
    }
    
    // Continue game loop
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Update all game systems
   */
  updateSystems(deltaTime) {
    try {
      // Update game state first
      this.gameState.update(deltaTime);
      
      // Update all systems
      for (const [name, system] of this.systems) {
        if (system.update && !system.isPaused) {
          system.update(deltaTime);
        }
      }
      
      // Emit update event
      this.eventBus.emit('engine:updated', { deltaTime });
      
    } catch (error) {
      this.logger.error('Error in system update:', error);
      this.handleSystemError({ error, context: 'System Update' });
    }
  }

  /**
   * Render all game systems
   */
  renderSystems(interpolation) {
    try {
      // Update screen manager
      if (this.screenManager.render) {
        this.screenManager.render(interpolation);
      }
      
      // Render all systems that need it
      for (const [name, system] of this.systems) {
        if (system.render && !system.isPaused) {
          system.render(interpolation);
        }
      }
      
      // Emit render event
      this.eventBus.emit('engine:rendered', { interpolation });
      
    } catch (error) {
      this.logger.error('Error in system render:', error);
      this.handleSystemError({ error, context: 'System Render' });
    }
  }

  /**
   * Update FPS counter
   */
  updateFPS(currentTime) {
    this.frameCount++;
    
    if (currentTime - this.lastFPSUpdate >= 1000) {
      this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastFPSUpdate));
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;
      
      // Emit performance data
      this.eventBus.emit('engine:performance', {
        fps: this.currentFPS,
        frameTime: this.fixedTimeStep,
        systems: this.systems.size
      });
    }
  }

  /**
   * Save current game state
   */
  async saveGame(saveName = null) {
    try {
      const currentState = this.gameState.getCurrentState();
      const saveId = await this.dataManager.saveGame(currentState, saveName);
      
      this.logger.info(`Game saved with ID: ${saveId}`);
      this.eventBus.emit('game:saved', { saveId, saveName });
      
      return saveId;
      
    } catch (error) {
      this.logger.error('Failed to save game:', error);
      this.eventBus.emit('game:saveError', { error });
      throw error;
    }
  }

  /**
   * Load game from save
   */
  async loadGame(saveId) {
    try {
      const gameState = await this.dataManager.loadGame(saveId);
      await this.gameState.loadState(gameState);
      
      // Notify all systems of state change
      for (const [name, system] of this.systems) {
        if (system.onStateLoaded) {
          system.onStateLoaded(gameState);
        }
      }
      
      this.logger.info(`Game loaded from save ID: ${saveId}`);
      this.eventBus.emit('game:loaded', { saveId, gameState });
      
    } catch (error) {
      this.logger.error('Failed to load game:', error);
      this.eventBus.emit('game:loadError', { error });
      throw error;
    }
  }

  /**
   * Handle screen changes
   */
  handleScreenChange({ from, to, data }) {
    this.logger.debug(`Screen changed: ${from} -> ${to}`);
    
    // Notify systems of screen change
    for (const [name, system] of this.systems) {
      if (system.onScreenChange) {
        system.onScreenChange(from, to, data);
      }
    }
  }

  /**
   * Handle system errors
   */
  handleSystemError({ error, context, system }) {
    this.logger.error(`System error in ${context}:`, error);
    
    // Attempt graceful degradation
    if (system && this.systems.has(system)) {
      const systemInstance = this.systems.get(system);
      if (systemInstance.handleError) {
        systemInstance.handleError(error);
      }
    }
    
    this.eventBus.emit('engine:systemError', { error, context, system });
  }

  /**
   * Handle system warnings
   */
  handleSystemWarning({ warning, context, system }) {
    this.logger.warn(`System warning in ${context}: ${warning}`);
    this.eventBus.emit('engine:systemWarning', { warning, context, system });
  }

  /**
   * Handle application blur (lost focus)
   */
  handleAppBlur() {
    if (this.isRunning && !this.isPaused) {
      this.pauseGame();
      this.eventBus.emit('engine:autoPaused');
    }
  }

  /**
   * Handle application focus
   */
  handleAppFocus() {
    // Don't auto-resume, let user decide
    this.eventBus.emit('engine:focusRestored');
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics({ fps, frameTime, systems }) {
    // Check for performance issues
    if (fps < 30) {
      this.logger.warn(`Low FPS detected: ${fps}`);
      this.eventBus.emit('engine:lowPerformance', { fps, frameTime });
    }
    
    if (frameTime > 33) { // Above 30fps threshold
      this.logger.warn(`High frame time: ${frameTime}ms`);
    }
  }

  /**
   * Get system by name
   */
  getSystem(name) {
    return this.systems.get(name);
  }

  /**
   * Get all systems
   */
  getAllSystems() {
    return Array.from(this.systems.entries()).map(([name, system]) => ({
      name,
      system,
      isRunning: system.isRunning || false,
      isPaused: system.isPaused || false
    }));
  }

  /**
   * Get engine status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentFPS: this.currentFPS,
      systemCount: this.systems.size,
      currentScreen: this.screenManager?.getCurrentScreen(),
      gameState: this.gameState?.getCurrentState()
    };
  }

  /**
   * Check if there are unsaved changes
   */
  hasUnsavedChanges() {
    return this.gameState?.hasUnsavedChanges() || false;
  }

  /**
   * Create debug panel for development
   */
  createDebugPanel() {
    if (!(typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development')) return;
    
    const panel = document.createElement('div');
    panel.id = 'debug-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px;
      font-family: monospace;
      font-size: 11px;
      z-index: 10000;
      border-radius: 4px;
      min-width: 250px;
      border: 1px solid #333;
    `;
    
    this.updateDebugPanel(panel);
    document.body.appendChild(panel);
    
    // Update every second
    const updateInterval = setInterval(() => {
      if (!panel.parentElement) {
        clearInterval(updateInterval);
        return;
      }
      this.updateDebugPanel(panel);
    }, 1000);
  }

  /**
   * Update debug panel content
   */
  updateDebugPanel(panel) {
    const status = this.getStatus();
    const memoryInfo = performance.memory ? {
      used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`,
      total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB`
    } : { used: 'N/A', total: 'N/A' };
    
    panel.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold; color: #5aa3ff;">Debug Panel</div>
      <div>Status: ${status.isRunning ? (status.isPaused ? 'PAUSED' : 'RUNNING') : 'STOPPED'}</div>
      <div>FPS: ${status.currentFPS}</div>
      <div>Systems: ${status.systemCount}</div>
      <div>Screen: ${status.currentScreen || 'N/A'}</div>
      <div>Memory: ${memoryInfo.used} / ${memoryInfo.total}</div>
      <div>Unsaved: ${this.hasUnsavedChanges() ? 'Yes' : 'No'}</div>
      <hr style="border: 1px solid #333; margin: 8px 0;">
      <div style="font-size: 10px;">
        <div>ESC: Toggle pause</div>
        <div>F2: Performance monitor</div>
        <div>Ctrl+I: Toggle debug</div>
      </div>
    `;
  }

  /**
   * Shutdown the game engine
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down GameEngine...');
      
      // Stop the game if running
      if (this.isRunning) {
        await this.stopGame();
      }
      
      // Shutdown all systems in reverse order
      const systemEntries = Array.from(this.systems.entries()).reverse();
      for (const [name, system] of systemEntries) {
        if (system.shutdown) {
          await system.shutdown();
          this.logger.debug(`${name} system shut down`);
        }
      }
      
      // Shutdown core systems
      if (this.mobileOptimizer) {
        await this.mobileOptimizer.shutdown();
      }
      
      if (this.audioManager) {
        await this.audioManager.shutdown();
      }
      
      if (this.gameState) {
        await this.gameState.shutdown();
      }
      
      if (this.screenManager) {
        await this.screenManager.shutdown();
      }
      
      if (this.dataManager) {
        await this.dataManager.shutdown();
      }
      
      // Clear systems
      this.systems.clear();
      
      // Remove debug panel
      const debugPanel = document.getElementById('debug-panel');
      if (debugPanel) {
        debugPanel.remove();
      }
      
      this.isInitialized = false;
      this.logger.info('GameEngine shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during GameEngine shutdown:', error);
    }
  }
}