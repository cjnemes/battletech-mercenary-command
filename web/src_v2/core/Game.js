/**
 * Bulletproof Game Orchestrator - Main system coordinator
 * This class is the heart of the application and MUST NEVER FAIL
 */

import EventBus from './EventBus.js';
import Logger from '../utils/Logger.js';

class Game {
    constructor() {
        this.initialized = false;
        this.modules = new Map();
        
        try {
            this.initializeCore();
        } catch (error) {
            console.error('❌ CRITICAL: Game initialization failed completely', error);
            this.emergencyFallback();
            throw new Error(`Game initialization failed: ${error.message}`);
        }
    }
    
    initializeCore() {
        console.log('🚀 Game: Starting bulletproof initialization...');
        
        // Initialize logger first - we need logging for everything else
        try {
            this.logger = new Logger('Game');
            this.logger.info('Logger initialized successfully');
        } catch (error) {
            console.error('Logger initialization failed, using console fallback');
            this.logger = console;
        }
        
        // Initialize EventBus - core communication system
        try {
            this.eventBus = new EventBus(this.logger);
            this.logger.info('EventBus initialized successfully');
        } catch (error) {
            this.logger.error('EventBus initialization failed', error);
            throw error;
        }
        
        // Set up core event handlers
        this.setupCoreEventHandlers();
        
        // Mark as initialized
        this.initialized = true;
        this.logger.info('🎯 Game core initialization complete');
        
        // Emit initialization complete event
        this.eventBus.emit('game.initialized', { 
            timestamp: Date.now(),
            version: '2.0.0'
        });
    }
    
    setupCoreEventHandlers() {
        try {
            // Listen for critical system errors
            this.eventBus.on('system.error', (data) => {
                this.handleSystemError(data);
            });
            
            // Listen for module registration
            this.eventBus.on('module.register', (data) => {
                this.registerModule(data.name, data.instance);
            });
            
            // Listen for module unregistration
            this.eventBus.on('module.unregister', (data) => {
                this.unregisterModule(data.name);
            });
            
            this.logger.debug('Core event handlers established');
            
        } catch (error) {
            this.logger.error('Failed to setup core event handlers', error);
        }
    }
    
    /**
     * Register a module with the game system
     */
    registerModule(name, moduleInstance) {
        try {
            if (!name || typeof name !== 'string') {
                throw new Error('Module name must be a valid string');
            }
            
            if (!moduleInstance) {
                throw new Error('Module instance cannot be null');
            }
            
            if (this.modules.has(name)) {
                this.logger.warn(`Module ${name} is already registered, replacing...`);
            }
            
            this.modules.set(name, moduleInstance);
            this.logger.info(`✅ Module registered: ${name}`);
            
            // Emit module registered event
            this.eventBus.emit('module.registered', { 
                name, 
                timestamp: Date.now() 
            });
            
        } catch (error) {
            this.logger.error(`Failed to register module: ${name}`, error);
        }
    }
    
    /**
     * Unregister a module from the game system
     */
    unregisterModule(name) {
        try {
            if (this.modules.has(name)) {
                const module = this.modules.get(name);
                
                // Try to cleanly shutdown the module if it has a shutdown method
                if (module && typeof module.shutdown === 'function') {
                    try {
                        module.shutdown();
                    } catch (shutdownError) {
                        this.logger.error(`Module ${name} shutdown failed`, shutdownError);
                    }
                }
                
                this.modules.delete(name);
                this.logger.info(`❌ Module unregistered: ${name}`);
                
                // Emit module unregistered event
                this.eventBus.emit('module.unregistered', { 
                    name, 
                    timestamp: Date.now() 
                });
            } else {
                this.logger.warn(`Cannot unregister unknown module: ${name}`);
            }
            
        } catch (error) {
            this.logger.error(`Failed to unregister module: ${name}`, error);
        }
    }
    
    /**
     * Get a registered module by name
     */
    getModule(name) {
        try {
            if (!this.modules.has(name)) {
                this.logger.warn(`Module not found: ${name}`);
                return null;
            }
            
            return this.modules.get(name);
            
        } catch (error) {
            this.logger.error(`Failed to get module: ${name}`, error);
            return null;
        }
    }
    
    /**
     * Handle system-level errors
     */
    handleSystemError(errorData) {
        try {
            this.logger.error('🚨 System Error Detected', errorData);
            
            // Log error details for debugging
            if (errorData.source) {
                this.logger.error(`Error source: ${errorData.source}`);
            }
            
            if (errorData.error) {
                this.logger.error('Error details:', errorData.error);
            }
            
            // Emit error handled event for other systems to react
            this.eventBus.emit('system.error.handled', {
                originalError: errorData,
                handledAt: Date.now()
            });
            
        } catch (error) {
            // If error handling fails, use console directly
            console.error('❌ CRITICAL: Error handler failed', error);
            console.error('❌ Original error that caused the failure:', errorData);
        }
    }
    
    /**
     * Get system status for debugging
     */
    getStatus() {
        return {
            initialized: this.initialized,
            modules: Array.from(this.modules.keys()),
            eventBusStatus: this.eventBus ? this.eventBus.getStatus() : null,
            loggerStatus: this.logger && this.logger.getStatus ? this.logger.getStatus() : null,
            uptime: Date.now() - (this.logger.startTime || Date.now())
        };
    }
    
    /**
     * Emergency fallback when initialization fails completely
     */
    emergencyFallback() {
        try {
            console.error('🚨 EMERGENCY FALLBACK ACTIVATED');
            
            // Create minimal logger fallback
            this.logger = {
                error: console.error,
                warn: console.warn,
                info: console.info,
                debug: console.debug
            };
            
            // Create minimal EventBus fallback
            this.eventBus = {
                emit: () => {},
                on: () => {},
                off: () => {},
                getStatus: () => ({ fallbackMode: true })
            };
            
            this.logger.error('Emergency fallback systems activated');
            
        } catch (fallbackError) {
            console.error('❌ TOTAL SYSTEM FAILURE: Even emergency fallback failed', fallbackError);
        }
    }
    
    /**
     * Shutdown the game system cleanly
     */
    shutdown() {
        try {
            this.logger.info('🛑 Game shutdown initiated...');
            
            // Emit shutdown event
            this.eventBus.emit('game.shutdown', { timestamp: Date.now() });
            
            // Shutdown all modules
            for (const [name, module] of this.modules) {
                try {
                    if (module && typeof module.shutdown === 'function') {
                        module.shutdown();
                        this.logger.info(`Module ${name} shutdown complete`);
                    }
                } catch (error) {
                    this.logger.error(`Module ${name} shutdown failed`, error);
                }
            }
            
            // Clear modules
            this.modules.clear();
            
            this.logger.info('🏁 Game shutdown complete');
            
        } catch (error) {
            console.error('❌ Game shutdown failed', error);
        }
    }
}

// Export for use in other modules
window.BattletechGame = Game;

export default Game;