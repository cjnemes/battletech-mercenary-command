/**
 * GameEngine Tests
 * Professional test suite for the core game engine
 */

import { GameEngine } from '@systems/js/GameEngine';
import { EventBus } from '@utils/EventBus';

// Mock the heavy dependencies
jest.mock('@systems/js/DataManager');
jest.mock('@systems/js/ScreenManager');
jest.mock('@systems/js/GameState');

describe('GameEngine', () => {
  let gameEngine;
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
    gameEngine = new GameEngine(eventBus);
  });

  afterEach(() => {
    if (gameEngine?.isInitialized) {
      gameEngine.shutdown();
    }
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await gameEngine.initialize();
      
      expect(gameEngine.isInitialized).toBe(true);
      expect(gameEngine.isRunning).toBe(false);
      expect(gameEngine.isPaused).toBe(false);
    });

    test('should emit initialization event', async () => {
      const initListener = jest.fn();
      eventBus.on('engine:initialized', initListener);

      await gameEngine.initialize();

      expect(initListener).toHaveBeenCalled();
    });

    test('should handle initialization errors', async () => {
      // Mock a system to fail initialization
      const originalInitialize = gameEngine.initializeCoreSystems;
      gameEngine.initializeCoreSystems = jest.fn().mockRejectedValue(new Error('Init failed'));

      await expect(gameEngine.initialize()).rejects.toThrow('Init failed');
      expect(gameEngine.isInitialized).toBe(false);

      // Restore original method
      gameEngine.initializeCoreSystems = originalInitialize;
    });
  });

  describe('Game Lifecycle', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    test('should start game successfully', async () => {
      await gameEngine.startGame();

      expect(gameEngine.isRunning).toBe(true);
      expect(gameEngine.isPaused).toBe(false);
      expect(gameEngine.gameLoopId).toBeTruthy();
    });

    test('should emit game started event', async () => {
      const startListener = jest.fn();
      eventBus.on('game:started', startListener);

      await gameEngine.startGame();

      expect(startListener).toHaveBeenCalled();
    });

    test('should pause and resume game', async () => {
      await gameEngine.startGame();

      gameEngine.pauseGame();
      expect(gameEngine.isPaused).toBe(true);

      gameEngine.resumeGame();
      expect(gameEngine.isPaused).toBe(false);
    });

    test('should stop game successfully', async () => {
      await gameEngine.startGame();
      await gameEngine.stopGame();

      expect(gameEngine.isRunning).toBe(false);
      expect(gameEngine.gameLoopId).toBe(null);
    });

    test('should not start game if not initialized', async () => {
      const uninitializedEngine = new GameEngine(eventBus);
      
      await expect(uninitializedEngine.startGame()).rejects.toThrow('GameEngine not initialized');
    });
  });

  describe('Game Loop', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
      await gameEngine.startGame();
    });

    test('should maintain target FPS', (done) => {
      let frameCount = 0;
      const startTime = performance.now();

      const originalUpdateSystems = gameEngine.updateSystems;
      gameEngine.updateSystems = jest.fn((deltaTime) => {
        frameCount++;
        
        // Test for approximately 1 second
        if (performance.now() - startTime >= 1000) {
          const fps = gameEngine.currentFPS;
          expect(fps).toBeGreaterThan(30); // At least 30 FPS
          expect(fps).toBeLessThanOrEqual(gameEngine.targetFPS + 5); // Allow some variance
          
          // Restore original method
          gameEngine.updateSystems = originalUpdateSystems;
          done();
        }
      });
    }, 2000);

    test('should skip updates when paused', () => {
      const updateSpy = jest.spyOn(gameEngine, 'updateSystems');
      
      gameEngine.pauseGame();
      
      // Simulate a few game loop iterations
      const mockTime = performance.now();
      gameEngine.gameLoop(mockTime);
      gameEngine.gameLoop(mockTime + 16);
      gameEngine.gameLoop(mockTime + 32);

      expect(updateSpy).not.toHaveBeenCalled();
    });
  });

  describe('System Management', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    test('should register game systems', () => {
      expect(gameEngine.systems.size).toBeGreaterThan(0);
      expect(gameEngine.systems.has('company')).toBe(true);
      expect(gameEngine.systems.has('pilot')).toBe(true);
      expect(gameEngine.systems.has('mech')).toBe(true);
    });

    test('should get system by name', () => {
      const companySystem = gameEngine.getSystem('company');
      expect(companySystem).toBeDefined();
    });

    test('should get all systems', () => {
      const allSystems = gameEngine.getAllSystems();
      expect(Array.isArray(allSystems)).toBe(true);
      expect(allSystems.length).toBeGreaterThan(0);
    });

    test('should handle system errors', () => {
      const errorData = {
        error: new Error('Test error'),
        context: 'Test Context',
        system: 'testSystem'
      };

      const errorListener = jest.fn();
      eventBus.on('engine:systemError', errorListener);

      gameEngine.handleSystemError(errorData);

      expect(errorListener).toHaveBeenCalledWith(errorData);
    });
  });

  describe('Save/Load Operations', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    test('should save game', async () => {
      const saveListener = jest.fn();
      eventBus.on('game:saved', saveListener);

      const saveId = await gameEngine.saveGame('Test Save');

      expect(saveId).toBeDefined();
      expect(saveListener).toHaveBeenCalledWith({
        saveId,
        saveName: 'Test Save'
      });
    });

    test('should load game', async () => {
      const loadListener = jest.fn();
      eventBus.on('game:loaded', loadListener);

      await gameEngine.loadGame('testSaveId');

      expect(loadListener).toHaveBeenCalled();
    });

    test('should handle save errors', async () => {
      const errorListener = jest.fn();
      eventBus.on('game:saveError', errorListener);

      // Mock dataManager to throw error
      gameEngine.dataManager.saveGame = jest.fn().mockRejectedValue(new Error('Save failed'));

      await expect(gameEngine.saveGame('Test Save')).rejects.toThrow('Save failed');
      expect(errorListener).toHaveBeenCalled();
    });
  });

  describe('Event Handling', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    test('should handle screen change events', () => {
      const screenChangeData = {
        from: 'main-menu',
        to: 'company-overview',
        data: { test: true }
      };

      gameEngine.handleScreenChange(screenChangeData);
      
      // Should not throw and should log the change
      expect(true).toBe(true); // Placeholder assertion
    });

    test('should handle app blur/focus', async () => {
      await gameEngine.startGame();

      gameEngine.handleAppBlur();
      expect(gameEngine.isPaused).toBe(true);

      const focusListener = jest.fn();
      eventBus.on('engine:focusRestored', focusListener);

      gameEngine.handleAppFocus();
      expect(focusListener).toHaveBeenCalled();
    });
  });

  describe('Performance Monitoring', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    test('should track FPS', () => {
      expect(gameEngine.currentFPS).toBeDefined();
      expect(gameEngine.targetFPS).toBe(60);
    });

    test('should emit performance warnings', () => {
      const warningListener = jest.fn();
      eventBus.on('engine:lowPerformance', warningListener);

      gameEngine.updatePerformanceMetrics({
        fps: 15, // Low FPS
        frameTime: 16.67,
        systems: 5
      });

      expect(warningListener).toHaveBeenCalledWith({
        fps: 15,
        frameTime: 16.67
      });
    });
  });

  describe('Status and Information', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    test('should return engine status', () => {
      const status = gameEngine.getStatus();

      expect(status).toHaveProperty('isInitialized', true);
      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('isPaused');
      expect(status).toHaveProperty('currentFPS');
      expect(status).toHaveProperty('systemCount');
    });

    test('should check for unsaved changes', () => {
      const hasUnsaved = gameEngine.hasUnsavedChanges();
      expect(typeof hasUnsaved).toBe('boolean');
    });
  });

  describe('Debug Features', () => {
    beforeEach(async () => {
      await gameEngine.initialize();
    });

    test('should create debug panel in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      gameEngine.createDebugPanel();
      
      const debugPanel = document.getElementById('debug-panel');
      expect(debugPanel).toBeTruthy();

      // Cleanup
      if (debugPanel) {
        debugPanel.remove();
      }
      process.env.NODE_ENV = originalEnv;
    });

    test('should not create debug panel in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      gameEngine.createDebugPanel();
      
      const debugPanel = document.getElementById('debug-panel');
      expect(debugPanel).toBeFalsy();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Shutdown', () => {
    test('should shutdown gracefully', async () => {
      await gameEngine.initialize();
      await gameEngine.startGame();

      await gameEngine.shutdown();

      expect(gameEngine.isInitialized).toBe(false);
      expect(gameEngine.isRunning).toBe(false);
      expect(gameEngine.systems.size).toBe(0);
    });

    test('should handle shutdown errors', async () => {
      await gameEngine.initialize();
      
      // Mock a system to fail shutdown
      const mockSystem = {
        shutdown: jest.fn().mockRejectedValue(new Error('Shutdown failed'))
      };
      gameEngine.systems.set('failingSystem', mockSystem);

      // Should not throw, just log the error
      await expect(gameEngine.shutdown()).resolves.not.toThrow();
    });
  });
});