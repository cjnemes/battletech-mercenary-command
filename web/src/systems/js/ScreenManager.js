/**
 * Screen Manager - Professional Screen/UI Management
 * Handles screen transitions, UI state, and component lifecycle
 */
import { Logger } from '@utils/Logger';

export class ScreenManager {
  constructor(eventBus) {
    this.logger = new Logger('ScreenManager');
    this.eventBus = eventBus;
    this.currentScreen = 'main-menu';
    this.previousScreen = null;
    this.screenHistory = [];
    this.maxHistorySize = 10;
    this.isTransitioning = false;
    this.screens = new Map();
    this.components = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the screen manager
   */
  async initialize() {
    try {
      this.logger.info('Initializing ScreenManager...');
      
      // Register default screens
      this.registerDefaultScreens();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize current screen
      await this.initializeCurrentScreen();
      
      this.isInitialized = true;
      this.logger.info('ScreenManager initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize ScreenManager:', error);
      throw error;
    }
  }

  /**
   * Register default game screens
   */
  registerDefaultScreens() {
    const screenConfigs = [
      {
        id: 'main-menu',
        element: '#main-menu',
        title: 'Main Menu',
        canGoBack: false,
        preload: true
      },
      {
        id: 'company-overview',
        element: '#company-overview',
        title: 'Company Overview',
        canGoBack: true,
        preload: true
      },
      {
        id: 'mech-bay',
        element: '#mech-bay',
        title: 'Mech Bay',
        canGoBack: true,
        preload: false
      },
      {
        id: 'star-map',
        element: '#star-map',
        title: 'Star Map',
        canGoBack: true,
        preload: false
      },
      {
        id: 'tactical-combat',
        element: '#tactical-combat',
        title: 'Tactical Combat',
        canGoBack: true,
        preload: false
      }
    ];

    screenConfigs.forEach(config => this.registerScreen(config));
  }

  /**
   * Register a screen
   */
  registerScreen(config) {
    const screen = {
      id: config.id,
      element: document.querySelector(config.element),
      title: config.title || config.id,
      canGoBack: config.canGoBack !== false,
      preload: config.preload || false,
      isActive: false,
      isLoaded: false,
      components: [],
      data: {},
      lifecycle: {
        onEnter: config.onEnter || null,
        onExit: config.onExit || null,
        onUpdate: config.onUpdate || null
      }
    };

    if (!screen.element) {
      this.logger.warn(`Screen element not found: ${config.element}`);
      return false;
    }

    this.screens.set(config.id, screen);
    this.logger.debug(`Screen registered: ${config.id}`);
    return true;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Screen navigation events
    this.eventBus.on('screen:show', this.showScreen.bind(this));
    this.eventBus.on('screen:back', this.goBack.bind(this));
    this.eventBus.on('screen:refresh', this.refreshCurrentScreen.bind(this));
    
    // Component events
    this.eventBus.on('component:register', this.registerComponent.bind(this));
    this.eventBus.on('component:unregister', this.unregisterComponent.bind(this));
    
    // Keyboard navigation
    this.eventBus.on('keyboard:escape', this.handleEscapeKey.bind(this));
  }

  /**
   * Initialize the current screen
   */
  async initializeCurrentScreen() {
    const screen = this.screens.get(this.currentScreen);
    if (screen) {
      await this.activateScreen(screen);
    }
  }

  /**
   * Show a specific screen
   */
  async showScreen(screenId, data = {}, options = {}) {
    try {
      if (this.isTransitioning && !options.force) {
        this.logger.warn(`Screen transition in progress, ignoring request for ${screenId}`);
        return false;
      }

      const screen = this.screens.get(screenId);
      if (!screen) {
        this.logger.error(`Screen not found: ${screenId}`);
        return false;
      }

      if (this.currentScreen === screenId && !options.force) {
        this.logger.debug(`Already on screen ${screenId}`);
        return true;
      }

      this.isTransitioning = true;
      this.logger.info(`Transitioning to screen: ${screenId}`);

      // Deactivate current screen
      const currentScreen = this.screens.get(this.currentScreen);
      if (currentScreen) {
        await this.deactivateScreen(currentScreen);
      }

      // Update screen history
      this.updateScreenHistory(screenId);

      // Activate new screen
      screen.data = { ...screen.data, ...data };
      await this.activateScreen(screen, options);

      // Update current screen
      this.previousScreen = this.currentScreen;
      this.currentScreen = screenId;

      this.isTransitioning = false;

      // Emit transition complete event
      this.eventBus.emit('screen:changed', {
        from: this.previousScreen,
        to: screenId,
        data
      });

      return true;

    } catch (error) {
      this.isTransitioning = false;
      this.logger.error(`Failed to show screen ${screenId}:`, error);
      return false;
    }
  }

  /**
   * Activate a screen
   */
  async activateScreen(screen, options = {}) {
    try {
      // Load screen if not loaded
      if (!screen.isLoaded) {
        await this.loadScreen(screen);
      }

      // Run enter lifecycle
      if (screen.lifecycle.onEnter) {
        await screen.lifecycle.onEnter(screen.data, options);
      }

      // Show screen element with transition
      if (options.animate !== false) {
        await this.animateScreenTransition(screen.element, 'in');
      } else {
        this.showScreenElement(screen.element);
      }

      // Activate screen components
      await this.activateScreenComponents(screen);

      screen.isActive = true;
      this.logger.debug(`Screen activated: ${screen.id}`);

    } catch (error) {
      this.logger.error(`Failed to activate screen ${screen.id}:`, error);
      throw error;
    }
  }

  /**
   * Deactivate a screen
   */
  async deactivateScreen(screen, options = {}) {
    try {
      if (!screen.isActive) return;

      // Deactivate screen components
      await this.deactivateScreenComponents(screen);

      // Run exit lifecycle
      if (screen.lifecycle.onExit) {
        await screen.lifecycle.onExit(screen.data, options);
      }

      // Hide screen element with transition
      if (options.animate !== false) {
        await this.animateScreenTransition(screen.element, 'out');
      } else {
        this.hideScreenElement(screen.element);
      }

      screen.isActive = false;
      this.logger.debug(`Screen deactivated: ${screen.id}`);

    } catch (error) {
      this.logger.error(`Failed to deactivate screen ${screen.id}:`, error);
      throw error;
    }
  }

  /**
   * Load screen resources
   */
  async loadScreen(screen) {
    try {
      this.logger.debug(`Loading screen: ${screen.id}`);

      // Load screen-specific components
      await this.loadScreenComponents(screen);

      // Load screen-specific data
      await this.loadScreenData(screen);

      screen.isLoaded = true;
      this.logger.debug(`Screen loaded: ${screen.id}`);

    } catch (error) {
      this.logger.error(`Failed to load screen ${screen.id}:`, error);
      throw error;
    }
  }

  /**
   * Load screen components
   */
  async loadScreenComponents(screen) {
    const componentSelectors = {
      'company-overview': ['.pilot-list', '.mech-list', '.info-card'],
      'mech-bay': ['.mech-list', '.mech-details'],
      'star-map': ['.contract-list', '.contract-details'],
      'tactical-combat': ['#battlefield', '.combat-ui']
    };

    const selectors = componentSelectors[screen.id];
    if (!selectors) return;

    for (const selector of selectors) {
      const element = screen.element.querySelector(selector);
      if (element && !this.components.has(`${screen.id}-${selector}`)) {
        // Register component placeholder
        this.components.set(`${screen.id}-${selector}`, {
          element,
          screenId: screen.id,
          isActive: false
        });
      }
    }
  }

  /**
   * Load screen-specific data
   */
  async loadScreenData(screen) {
    // Screen-specific data loading
    switch (screen.id) {
      case 'company-overview':
        // Load company data, pilot roster, etc.
        break;
      case 'mech-bay':
        // Load mech data, loadouts, etc.
        break;
      case 'star-map':
        // Load available contracts, faction data, etc.
        break;
      case 'tactical-combat':
        // Load battlefield, unit positions, etc.
        break;
    }
  }

  /**
   * Animate screen transitions
   */
  async animateScreenTransition(element, direction) {
    return new Promise((resolve) => {
      const duration = 300; // ms
      
      if (direction === 'in') {
        element.classList.add('active');
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
          element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
          
          setTimeout(() => {
            element.style.transition = '';
            resolve();
          }, duration);
        });
      } else {
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        element.style.opacity = '0';
        element.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
          element.classList.remove('active');
          element.style.transition = '';
          element.style.transform = '';
          resolve();
        }, duration);
      }
    });
  }

  /**
   * Show screen element immediately
   */
  showScreenElement(element) {
    element.classList.add('active');
    element.style.opacity = '1';
  }

  /**
   * Hide screen element immediately
   */
  hideScreenElement(element) {
    element.classList.remove('active');
    element.style.opacity = '0';
  }

  /**
   * Update screen history
   */
  updateScreenHistory(screenId) {
    if (this.currentScreen && this.currentScreen !== screenId) {
      this.screenHistory.push(this.currentScreen);
      
      // Maintain history size
      if (this.screenHistory.length > this.maxHistorySize) {
        this.screenHistory.shift();
      }
    }
  }

  /**
   * Go back to previous screen
   */
  async goBack() {
    if (this.screenHistory.length === 0) {
      this.logger.debug('No screen history available');
      return false;
    }

    const previousScreenId = this.screenHistory.pop();
    return await this.showScreen(previousScreenId, {}, { animate: true });
  }

  /**
   * Refresh current screen
   */
  async refreshCurrentScreen() {
    const screen = this.screens.get(this.currentScreen);
    if (screen) {
      screen.isLoaded = false;
      await this.showScreen(this.currentScreen, screen.data, { force: true });
    }
  }

  /**
   * Handle escape key
   */
  handleEscapeKey() {
    const screen = this.screens.get(this.currentScreen);
    if (screen && screen.canGoBack) {
      this.goBack();
    }
  }

  /**
   * Activate screen components
   */
  async activateScreenComponents(screen) {
    for (const [id, component] of this.components) {
      if (component.screenId === screen.id) {
        component.isActive = true;
        if (component.onActivate) {
          await component.onActivate();
        }
      }
    }
  }

  /**
   * Deactivate screen components
   */
  async deactivateScreenComponents(screen) {
    for (const [id, component] of this.components) {
      if (component.screenId === screen.id && component.isActive) {
        component.isActive = false;
        if (component.onDeactivate) {
          await component.onDeactivate();
        }
      }
    }
  }

  /**
   * Register a UI component
   */
  registerComponent(componentData) {
    const { id, element, screenId, lifecycle } = componentData;
    
    const component = {
      id,
      element: typeof element === 'string' ? document.querySelector(element) : element,
      screenId,
      isActive: false,
      lifecycle: lifecycle || {},
      onActivate: lifecycle?.onActivate,
      onDeactivate: lifecycle?.onDeactivate,
      onUpdate: lifecycle?.onUpdate
    };

    this.components.set(id, component);
    this.logger.debug(`Component registered: ${id}`);
  }

  /**
   * Unregister a UI component
   */
  unregisterComponent(componentId) {
    if (this.components.has(componentId)) {
      const component = this.components.get(componentId);
      if (component.onDeactivate && component.isActive) {
        component.onDeactivate();
      }
      
      this.components.delete(componentId);
      this.logger.debug(`Component unregistered: ${componentId}`);
    }
  }

  /**
   * Update active screen and components
   */
  update(deltaTime) {
    const screen = this.screens.get(this.currentScreen);
    if (!screen || !screen.isActive) return;

    // Update screen
    if (screen.lifecycle.onUpdate) {
      screen.lifecycle.onUpdate(deltaTime);
    }

    // Update active components
    for (const [id, component] of this.components) {
      if (component.isActive && component.onUpdate) {
        component.onUpdate(deltaTime);
      }
    }
  }

  /**
   * Render method (called by game loop if needed)
   */
  render(interpolation) {
    // Currently UI is DOM-based, but this could be used for canvas rendering
  }

  /**
   * Get current screen
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Get screen by ID
   */
  getScreen(screenId) {
    return this.screens.get(screenId);
  }

  /**
   * Get all screens
   */
  getAllScreens() {
    return Array.from(this.screens.values());
  }

  /**
   * Check if screen exists
   */
  hasScreen(screenId) {
    return this.screens.has(screenId);
  }

  /**
   * Check if transitioning
   */
  isTransitionInProgress() {
    return this.isTransitioning;
  }

  /**
   * Get screen history
   */
  getHistory() {
    return [...this.screenHistory];
  }

  /**
   * Clear screen history
   */
  clearHistory() {
    this.screenHistory.length = 0;
  }

  /**
   * Shutdown screen manager
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down ScreenManager...');

      // Deactivate current screen
      const currentScreen = this.screens.get(this.currentScreen);
      if (currentScreen && currentScreen.isActive) {
        await this.deactivateScreen(currentScreen, { animate: false });
      }

      // Clear all components
      this.components.clear();
      this.screens.clear();
      this.screenHistory.length = 0;

      this.isInitialized = false;
      this.logger.info('ScreenManager shutdown complete');

    } catch (error) {
      this.logger.error('Error during ScreenManager shutdown:', error);
    }
  }
}