/**
 * Bulletproof Screen Manager - UI state and navigation system
 * This system manages all screen transitions and UI state with bulletproof error handling
 */

class ScreenManager {
    constructor(eventBus, logger) {
        this.eventBus = eventBus || console;
        this.logger = logger || console;
        this.initialized = false;
        
        // Screen configuration
        this.screens = new Map();
        this.currentScreen = null;
        this.screenHistory = [];
        this.maxHistory = 50;
        
        // Animation settings
        this.transitionDuration = 300;
        this.animationsEnabled = true;
        
        try {
            this.initialize();
        } catch (error) {
            this.logger.error?.('ScreenManager initialization failed', error) || 
                console.error('ScreenManager init failed:', error);
            throw error;
        }
    }
    
    initialize() {
        this.logger.info?.('ScreenManager initializing...') || console.log('ScreenManager initializing...');
        
        // Discover and register existing screens
        this.discoverScreens();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Set up navigation handlers
        this.setupNavigationHandlers();
        
        // Initialize default screen
        this.initializeDefaultScreen();
        
        this.initialized = true;
        this.logger.info?.('ScreenManager initialized successfully') || console.log('ScreenManager initialized');
        
        // Emit initialization event
        this.emitEvent('screenmanager.initialized', { timestamp: Date.now() });
    }
    
    discoverScreens() {
        try {
            // Find all elements with 'screen' class
            const screenElements = document.querySelectorAll('.screen, [data-screen]');
            
            screenElements.forEach(element => {
                const screenId = element.id || element.getAttribute('data-screen');
                if (screenId) {
                    this.registerScreen(screenId, element);
                }
            });
            
            this.logger.info?.(`Discovered ${this.screens.size} screens`) || 
                console.log(`Discovered ${this.screens.size} screens`);
                
        } catch (error) {
            this.logger.error?.('Failed to discover screens', error) || 
                console.error('Screen discovery failed:', error);
        }
    }
    
    registerScreen(screenId, element) {
        try {
            if (!screenId || typeof screenId !== 'string') {
                throw new Error('Screen ID must be a valid string');
            }
            
            if (!element || !element.tagName) {
                throw new Error('Screen element must be a valid DOM element');
            }
            
            const screenConfig = {
                id: screenId,
                element: element,
                visible: !element.classList.contains('hidden') && 
                        element.style.display !== 'none' &&
                        !element.hasAttribute('hidden'),
                initialized: false,
                lastShown: null,
                showCount: 0
            };
            
            this.screens.set(screenId, screenConfig);
            
            // Ensure screen has proper initial state
            this.prepareScreenElement(element);
            
            this.logger.debug?.(`Screen registered: ${screenId}`) || console.debug(`Screen: ${screenId}`);
            
        } catch (error) {
            this.logger.error?.(`Failed to register screen: ${screenId}`, error) || 
                console.error(`Screen registration failed: ${screenId}`, error);
        }
    }
    
    prepareScreenElement(element) {
        try {
            // Ensure screen has the 'screen' class
            if (!element.classList.contains('screen')) {
                element.classList.add('screen');
            }
            
            // Set initial styles for transitions
            if (!element.style.position) {
                element.style.position = 'absolute';
            }
            
            if (!element.style.width) {
                element.style.width = '100%';
            }
            
            if (!element.style.height) {
                element.style.height = '100%';
            }
            
            // Set transition properties
            element.style.transition = `opacity ${this.transitionDuration}ms ease-in-out`;
            
        } catch (error) {
            this.logger.error?.('Failed to prepare screen element', error) || 
                console.error('Screen preparation failed:', error);
        }
    }
    
    setupEventHandlers() {
        try {
            // Listen for screen navigation requests
            this.eventBus.on?.('screen.show', (data) => {
                this.showScreen(data.screenId, data.options);
            });
            
            this.eventBus.on?.('screen.hide', (data) => {
                this.hideScreen(data.screenId);
            });
            
            this.eventBus.on?.('screen.back', () => {
                this.goBack();
            });
            
            // Listen for UI state changes
            this.eventBus.on?.('ui.refresh', (data) => {
                this.refreshCurrentScreen(data);
            });
            
            this.logger.debug?.('Screen event handlers established') || 
                console.debug('Screen handlers ready');
                
        } catch (error) {
            this.logger.error?.('Failed to setup screen event handlers', error) || 
                console.error('Screen handlers failed:', error);
        }
    }
    
    setupNavigationHandlers() {
        try {
            // Set up global navigation functions for onclick handlers
            window.showScreen = (screenId, options) => {
                this.showScreen(screenId, options);
            };
            
            window.goBack = () => {
                this.goBack();
            };
            
            // Legacy function names for compatibility
            window.showMainMenu = () => this.showScreen('main-menu');
            window.showCompanyOverview = () => this.showScreen('company-overview');
            window.showMechBay = () => this.showScreen('mech-bay');
            window.showStarMap = () => this.showScreen('star-map');
            window.showTacticalCombat = () => this.showScreen('tactical-combat');
            
            // Handle browser back button
            window.addEventListener('popstate', (event) => {
                if (event.state && event.state.screenId) {
                    this.showScreen(event.state.screenId, { skipHistory: true });
                }
            });
            
            this.logger.debug?.('Navigation handlers established') || 
                console.debug('Navigation ready');
                
        } catch (error) {
            this.logger.error?.('Failed to setup navigation handlers', error) || 
                console.error('Navigation setup failed:', error);
        }
    }
    
    initializeDefaultScreen() {
        try {
            // Find the initially visible screen or default to first screen
            let defaultScreen = null;
            
            // Look for screen with 'active' class
            for (const [screenId, config] of this.screens) {
                if (config.element.classList.contains('active')) {
                    defaultScreen = screenId;
                    break;
                }
            }
            
            // If no active screen, use main-menu or first available
            if (!defaultScreen) {
                if (this.screens.has('main-menu')) {
                    defaultScreen = 'main-menu';
                } else if (this.screens.size > 0) {
                    defaultScreen = this.screens.keys().next().value;
                }
            }
            
            if (defaultScreen) {
                this.currentScreen = defaultScreen;
                this.screens.get(defaultScreen).visible = true;
                this.logger.info?.(`Default screen set: ${defaultScreen}`) || 
                    console.log(`Default screen: ${defaultScreen}`);
            }
            
        } catch (error) {
            this.logger.error?.('Failed to initialize default screen', error) || 
                console.error('Default screen init failed:', error);
        }
    }
    
    /**
     * Show a screen with optional transition effects
     */
    showScreen(screenId, options = {}) {
        try {
            if (!screenId || typeof screenId !== 'string') {
                throw new Error('Screen ID must be a valid string');
            }
            
            if (!this.screens.has(screenId)) {
                this.logger.warn?.(`Unknown screen: ${screenId}`) || console.warn(`Unknown screen: ${screenId}`);
                return false;
            }
            
            const screen = this.screens.get(screenId);
            const previousScreen = this.currentScreen;
            
            this.logger.info?.(`Showing screen: ${screenId}`) || console.log(`Showing: ${screenId}`);
            
            // Hide current screen first
            if (previousScreen && previousScreen !== screenId) {
                this.hideScreen(previousScreen, { immediate: options.immediate });
            }
            
            // Show the new screen
            this.displayScreen(screen, options);
            
            // Update current screen
            this.currentScreen = screenId;
            
            // Add to history (unless skipping)
            if (!options.skipHistory) {
                this.addToHistory(screenId);
            }
            
            // Update browser history
            if (!options.skipBrowserHistory) {
                this.updateBrowserHistory(screenId);
            }
            
            // Emit screen shown event
            this.emitEvent('screen.shown', {
                screenId,
                previousScreen,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            this.logger.error?.(`Failed to show screen: ${screenId}`, error) || 
                console.error(`Show screen failed: ${screenId}`, error);
            return false;
        }
    }
    
    /**
     * Hide a screen
     */
    hideScreen(screenId, options = {}) {
        try {
            if (!screenId || !this.screens.has(screenId)) {
                return false;
            }
            
            const screen = this.screens.get(screenId);
            
            if (!screen.visible) {
                return true; // Already hidden
            }
            
            this.logger.debug?.(`Hiding screen: ${screenId}`) || console.debug(`Hiding: ${screenId}`);
            
            // Hide the screen
            this.hideScreenElement(screen.element, options);
            
            // Update screen state
            screen.visible = false;
            
            // Emit screen hidden event
            this.emitEvent('screen.hidden', {
                screenId,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            this.logger.error?.(`Failed to hide screen: ${screenId}`, error) || 
                console.error(`Hide screen failed: ${screenId}`, error);
            return false;
        }
    }
    
    displayScreen(screen, options = {}) {
        try {
            const element = screen.element;
            
            // Remove hidden states
            element.classList.remove('hidden');
            element.removeAttribute('hidden');
            element.style.display = '';
            
            // Add active class
            element.classList.add('active');
            
            if (options.immediate || !this.animationsEnabled) {
                // Show immediately
                element.style.opacity = '1';
                element.style.visibility = 'visible';
            } else {
                // Animate in
                element.style.opacity = '0';
                element.style.visibility = 'visible';
                
                // Trigger transition
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                });
            }
            
            // Update screen state
            screen.visible = true;
            screen.lastShown = Date.now();
            screen.showCount++;
            
        } catch (error) {
            this.logger.error?.('Failed to display screen element', error) || 
                console.error('Display screen failed:', error);
        }
    }
    
    hideScreenElement(element, options = {}) {
        try {
            // Remove active class
            element.classList.remove('active');
            
            if (options.immediate || !this.animationsEnabled) {
                // Hide immediately
                element.style.opacity = '0';
                element.style.visibility = 'hidden';
            } else {
                // Animate out
                element.style.opacity = '0';
                
                // Hide after transition
                setTimeout(() => {
                    element.style.visibility = 'hidden';
                }, this.transitionDuration);
            }
            
        } catch (error) {
            this.logger.error?.('Failed to hide screen element', error) || 
                console.error('Hide screen failed:', error);
        }
    }
    
    /**
     * Go back to previous screen
     */
    goBack() {
        try {
            if (this.screenHistory.length < 2) {
                this.logger.debug?.('No previous screen to go back to') || console.debug('No previous screen');
                return false;
            }
            
            // Remove current screen from history
            this.screenHistory.pop();
            
            // Get previous screen
            const previousScreen = this.screenHistory[this.screenHistory.length - 1];
            
            // Show previous screen
            return this.showScreen(previousScreen, { skipHistory: true });
            
        } catch (error) {
            this.logger.error?.('Failed to go back', error) || console.error('Go back failed:', error);
            return false;
        }
    }
    
    /**
     * Refresh current screen
     */
    refreshCurrentScreen(data = {}) {
        try {
            if (!this.currentScreen) {
                return false;
            }
            
            this.logger.debug?.(`Refreshing current screen: ${this.currentScreen}`) || 
                console.debug(`Refreshing: ${this.currentScreen}`);
            
            // Emit refresh event for the current screen
            this.emitEvent('screen.refresh', {
                screenId: this.currentScreen,
                data,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            this.logger.error?.('Failed to refresh current screen', error) || 
                console.error('Screen refresh failed:', error);
            return false;
        }
    }
    
    /**
     * Helper methods
     */
    addToHistory(screenId) {
        try {
            // Don't add duplicate consecutive entries
            if (this.screenHistory.length > 0 && 
                this.screenHistory[this.screenHistory.length - 1] === screenId) {
                return;
            }
            
            this.screenHistory.push(screenId);
            
            // Trim history to prevent memory issues
            if (this.screenHistory.length > this.maxHistory) {
                this.screenHistory = this.screenHistory.slice(-this.maxHistory * 0.8);
            }
            
        } catch (error) {
            this.logger.error?.('Failed to add to screen history', error) || 
                console.error('History add failed:', error);
        }
    }
    
    updateBrowserHistory(screenId) {
        try {
            if (window.history && window.history.pushState) {
                const state = { screenId, timestamp: Date.now() };
                const url = `#${screenId}`;
                window.history.pushState(state, '', url);
            }
        } catch (error) {
            // Browser history is not critical, don't fail on this
            this.logger.debug?.('Browser history update failed', error) || 
                console.debug('Browser history failed:', error);
        }
    }
    
    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            totalScreens: this.screens.size,
            currentScreen: this.currentScreen,
            historyLength: this.screenHistory.length,
            animationsEnabled: this.animationsEnabled,
            screenList: Array.from(this.screens.keys()),
            visibleScreens: Array.from(this.screens.values())
                .filter(screen => screen.visible)
                .map(screen => screen.id)
        };
    }
    
    /**
     * Get screen information
     */
    getScreenInfo(screenId) {
        try {
            if (!this.screens.has(screenId)) {
                return null;
            }
            
            const screen = this.screens.get(screenId);
            return {
                id: screen.id,
                visible: screen.visible,
                showCount: screen.showCount,
                lastShown: screen.lastShown,
                element: screen.element.tagName
            };
            
        } catch (error) {
            this.logger.error?.(`Failed to get screen info: ${screenId}`, error) || 
                console.error(`Get screen info failed: ${screenId}`, error);
            return null;
        }
    }
    
    emitEvent(eventName, data) {
        try {
            if (this.eventBus && this.eventBus.emit) {
                this.eventBus.emit(eventName, data);
            }
        } catch (error) {
            console.error(`Failed to emit screen event: ${eventName}`, error);
        }
    }
    
    /**
     * Cleanup method
     */
    shutdown() {
        try {
            this.logger.info?.('ScreenManager shutdown initiated') || console.log('ScreenManager shutdown');
            
            // Clear global functions
            delete window.showScreen;
            delete window.goBack;
            delete window.showMainMenu;
            delete window.showCompanyOverview;
            delete window.showMechBay;
            delete window.showStarMap;
            delete window.showTacticalCombat;
            
            this.initialized = false;
            this.logger.info?.('ScreenManager shutdown complete') || console.log('ScreenManager shutdown complete');
            
        } catch (error) {
            console.error('ScreenManager shutdown failed:', error);
        }
    }
}

// Export for use in other modules
window.BattletechScreenManager = ScreenManager;

export default ScreenManager;