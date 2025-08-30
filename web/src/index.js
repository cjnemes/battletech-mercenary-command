/**
 * Battletech Mercenary Command - Main Entry Point
 * Professional Architecture with Modular Game Systems
 */

// Import core systems
import { GameEngine } from '@systems/js/GameEngine';
import { EventBus } from '@utils/EventBus';
import { Logger } from '@utils/Logger';
import { ErrorHandler } from '@utils/ErrorHandler';
import { PerformanceMonitor } from '@utils/PerformanceMonitor';

// Import main styles
import '@systems/css/main.css';

// Global error handling setup
ErrorHandler.initialize();
PerformanceMonitor.initialize();

/**
 * Main Application Class
 * Manages the overall application lifecycle and coordinates all systems
 */
class BattletechApp {
  constructor() {
    this.logger = new Logger('BattletechApp');
    this.eventBus = new EventBus();
    this.gameEngine = null;
    this.isInitialized = false;
    
    this.logger.info('Battletech Mercenary Command initializing...');
  }

  /**
   * Initialize the application
   */
  async initialize() {
    try {
      // Check browser compatibility
      this.checkBrowserCompatibility();
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        await new Promise((resolve) => {
          document.addEventListener('DOMContentLoaded', resolve);
        });
      }

      // Initialize game engine
      this.gameEngine = new GameEngine(this.eventBus);
      await this.gameEngine.initialize();

      // Setup global event listeners
      this.setupGlobalEventListeners();

      // Setup global tutorial system access
      this.setupGlobalTutorialAccess();

      // Mark as initialized
      this.isInitialized = true;
      
      this.logger.info('Application initialized successfully');
      this.eventBus.emit('app:initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
      ErrorHandler.handleError(error, { context: 'Application Initialization' });
    }
  }

  /**
   * Check if the browser supports required features
   */
  checkBrowserCompatibility() {
    const requiredFeatures = [
      'Promise',
      'fetch',
      'localStorage',
      'indexedDB',
      'requestAnimationFrame',
      'Map',
      'Set'
    ];

    const missingFeatures = requiredFeatures.filter(feature => 
      !(feature in window) && !(feature in window.constructor.prototype)
    );

    if (missingFeatures.length > 0) {
      throw new Error(`Browser missing required features: ${missingFeatures.join(', ')}`);
    }

    // Check for modern JavaScript features
    try {
      // Test ES6 features
      eval('const test = () => {}; const { destructure } = {}; class TestClass {}');
    } catch (error) {
      throw new Error('Browser does not support required JavaScript features');
    }

    this.logger.info('Browser compatibility check passed');
  }

  /**
   * Setup global event listeners for the application
   */
  setupGlobalEventListeners() {
    // Handle visibility changes (page focus/blur)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.eventBus.emit('app:blur');
        PerformanceMonitor.pause();
      } else {
        this.eventBus.emit('app:focus');
        PerformanceMonitor.resume();
      }
    });

    // Handle window beforeunload (save game state)
    window.addEventListener('beforeunload', (event) => {
      if (this.gameEngine?.hasUnsavedChanges()) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    });

    // Handle errors globally
    window.addEventListener('error', (event) => {
      ErrorHandler.handleError(event.error, { 
        context: 'Global Error Handler',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      ErrorHandler.handleError(event.reason, { 
        context: 'Unhandled Promise Rejection'
      });
      event.preventDefault();
    });

    // Handle resize events for responsive design
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.eventBus.emit('app:resize', {
          width: window.innerWidth,
          height: window.innerHeight
        });
      }, 250);
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      this.handleGlobalKeyboard(event);
    });

    this.logger.info('Global event listeners setup complete');
  }

  /**
   * Handle global keyboard shortcuts
   */
  handleGlobalKeyboard(event) {
    // Only handle shortcuts if no input is focused
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.isContentEditable
    );

    if (isInputFocused) return;

    // Debug shortcuts (development only)
    if (process.env.NODE_ENV === 'development') {
      if (event.ctrlKey && event.key === 'i') {
        this.toggleDebugInfo();
        event.preventDefault();
      }
      if (event.key === 'F2') {
        PerformanceMonitor.toggle();
        event.preventDefault();
      }
    }

    // Game shortcuts
    switch (event.key) {
      case 'Escape':
        this.eventBus.emit('keyboard:escape');
        break;
      case 'F1':
        this.eventBus.emit('keyboard:help');
        this.showHelpMenu();
        event.preventDefault();
        break;
      case 'F5':
        // Allow default F5 behavior but emit event
        this.eventBus.emit('keyboard:refresh');
        break;
    }
  }

  /**
   * Setup global tutorial system access
   */
  setupGlobalTutorialAccess() {
    if (!window.TutorialSystem) {
      window.TutorialSystem = {};
    }
    
    // Make tutorial system globally accessible
    window.TutorialSystem.instance = this.gameEngine?.getSystem('tutorial');
    
    // Add tutorial helper functions
    window.TutorialSystem.start = (tutorialId, options) => {
      return window.TutorialSystem.instance?.startTutorial(tutorialId, options);
    };
    
    window.TutorialSystem.stop = () => {
      return window.TutorialSystem.instance?.stopTutorial();
    };
    
    window.TutorialSystem.skip = () => {
      return window.TutorialSystem.instance?.skipTutorial();
    };
    
    window.TutorialSystem.status = () => {
      return window.TutorialSystem.instance?.getStatus();
    };
  }

  /**
   * Show help menu with available tutorials
   */
  showHelpMenu() {
    const tutorialSystem = this.gameEngine?.getSystem('tutorial');
    if (!tutorialSystem) return;

    const statuses = tutorialSystem.getAllTutorialStatuses();
    const tutorials = Object.entries(statuses);

    if (tutorials.length === 0) {
      window.NotificationSystem.instance.info(
        'No tutorials are currently available. Tutorials will appear as you progress through the game.',
        { title: 'Help System' }
      );
      return;
    }

    // Create help menu content
    const tutorialList = tutorials.map(([id, status]) => {
      const statusIcon = status.status === 'completed' ? '✓' : 
                        status.status === 'started' ? '▶' : '○';
      return `<li style="margin: 8px 0;">
        ${statusIcon} <strong>${status.tutorial.title}</strong><br>
        <small style="color: var(--secondary-text);">${status.tutorial.description}</small><br>
        <button onclick="window.TutorialSystem.start('${id}', {force: true})" 
                style="margin-top: 4px; padding: 4px 8px; font-size: 11px;">
          ${status.status === 'completed' ? 'Replay' : 'Start'}
        </button>
      </li>`;
    }).join('');

    window.NotificationSystem.instance.show(
      `<ul style="list-style: none; padding: 0; margin: 10px 0;">${tutorialList}</ul>`,
      {
        title: 'Available Tutorials',
        type: 'info',
        autoDismiss: false,
        duration: 10000
      }
    );
  }

  /**
   * Toggle debug information display
   */
  toggleDebugInfo() {
    if (!this.gameEngine) return;
    
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
      debugPanel.style.display = debugPanel.style.display === 'none' ? 'block' : 'none';
    } else {
      this.gameEngine.createDebugPanel();
    }
  }

  /**
   * Shutdown the application gracefully
   */
  async shutdown() {
    if (!this.isInitialized) return;

    try {
      this.logger.info('Shutting down application...');
      
      // Save current game state
      if (this.gameEngine) {
        await this.gameEngine.shutdown();
      }

      // Cleanup performance monitoring
      PerformanceMonitor.shutdown();
      
      this.isInitialized = false;
      this.logger.info('Application shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during application shutdown:', error);
    }
  }
}

// Initialize application when module loads
const app = new BattletechApp();

// Start the application
app.initialize().catch((error) => {
  console.error('Failed to start Battletech Mercenary Command:', error);
  
  // Show user-friendly error message
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100vh; 
                background: #0c0f1a; color: #ffffff; font-family: monospace;">
      <div style="text-align: center; max-width: 600px; padding: 20px;">
        <h1 style="color: #5aa3ff; margin-bottom: 20px;">
          BATTLETECH MERCENARY COMMAND
        </h1>
        <h2 style="color: #e74c3c; margin-bottom: 20px;">Initialization Failed</h2>
        <p style="margin-bottom: 20px;">
          The game failed to start. This might be due to:
        </p>
        <ul style="text-align: left; margin-bottom: 20px;">
          <li>Outdated browser (please update to a modern browser)</li>
          <li>JavaScript disabled (please enable JavaScript)</li>
          <li>Network connectivity issues</li>
        </ul>
        <p style="margin-bottom: 20px;">
          Please refresh the page or contact support if the problem persists.
        </p>
        <button onclick="location.reload()" 
                style="background: #5aa3ff; color: white; border: none; padding: 10px 20px; 
                       cursor: pointer; border-radius: 4px;">
          Retry
        </button>
      </div>
    </div>
  `;
});

// Export app instance for debugging in development
if (process.env.NODE_ENV === 'development') {
  window.BattletechApp = app;
}

export default app;