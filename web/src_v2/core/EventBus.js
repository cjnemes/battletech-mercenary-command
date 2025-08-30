/**
 * Bulletproof EventBus - Communication hub for all modules
 * This system enables modules to communicate without direct dependencies
 */

class EventBus {
    constructor(logger) {
        this.logger = logger || console;
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistory = 500;
        
        try {
            this.initialize();
        } catch (error) {
            this.logger.error?.('EventBus initialization failed', error) || console.error('EventBus init failed:', error);
            throw error;
        }
    }
    
    initialize() {
        this.logger.info?.('EventBus initializing...') || console.log('EventBus initializing...');
        
        // Set up global error handler for events
        this.setupErrorHandling();
        
        this.logger.info?.('EventBus initialized successfully') || console.log('EventBus initialized');
    }
    
    setupErrorHandling() {
        // Store original handler to prevent infinite loops
        this.originalErrorHandler = window.onerror;
        
        // Don't override if already set by another system
        if (!window.battletechErrorHandlerSet) {
            window.onerror = (message, source, lineno, colno, error) => {
                this.logger.error?.('Global error caught by EventBus', {
                    message, source, lineno, colno, error
                }) || console.error('Global error:', message);
                
                // Call original handler if it existed
                if (this.originalErrorHandler) {
                    return this.originalErrorHandler(message, source, lineno, colno, error);
                }
                
                return false;
            };
            window.battletechErrorHandlerSet = true;
        }
    }
    
    /**
     * Subscribe to an event
     */
    on(eventName, callback) {
        try {
            if (typeof eventName !== 'string') {
                throw new Error('Event name must be a string');
            }
            
            if (typeof callback !== 'function') {
                throw new Error('Callback must be a function');
            }
            
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, []);
            }
            
            this.listeners.get(eventName).push(callback);
            
            this.logger.debug?.(`Subscribed to event: ${eventName}`) || console.debug(`Subscribed to: ${eventName}`);
            
        } catch (error) {
            this.logger.error?.('Failed to subscribe to event', { eventName, error }) || 
                console.error('Subscribe failed:', eventName, error);
        }
    }
    
    /**
     * Unsubscribe from an event
     */
    off(eventName, callback) {
        try {
            if (!this.listeners.has(eventName)) {
                this.logger.warn?.(`No listeners for event: ${eventName}`) || 
                    console.warn(`No listeners for: ${eventName}`);
                return;
            }
            
            const listeners = this.listeners.get(eventName);
            const index = listeners.indexOf(callback);
            
            if (index > -1) {
                listeners.splice(index, 1);
                this.logger.debug?.(`Unsubscribed from event: ${eventName}`) || 
                    console.debug(`Unsubscribed from: ${eventName}`);
            }
            
            // Clean up empty listener arrays
            if (listeners.length === 0) {
                this.listeners.delete(eventName);
            }
            
        } catch (error) {
            this.logger.error?.('Failed to unsubscribe from event', { eventName, error }) || 
                console.error('Unsubscribe failed:', eventName, error);
        }
    }
    
    /**
     * Emit an event to all subscribers
     */
    emit(eventName, data = null) {
        try {
            // Record event in history
            this.recordEvent(eventName, data);
            
            if (!this.listeners.has(eventName)) {
                this.logger.debug?.(`No listeners for event: ${eventName}`) || 
                    console.debug(`No listeners for: ${eventName}`);
                return;
            }
            
            const listeners = this.listeners.get(eventName);
            this.logger.debug?.(`Emitting event: ${eventName} to ${listeners.length} listeners`) || 
                console.debug(`Emitting: ${eventName} to ${listeners.length} listeners`);
            
            // Call each listener with error handling
            listeners.forEach((callback, index) => {
                try {
                    callback(data);
                } catch (error) {
                    this.logger.error?.(`Event listener error for ${eventName}[${index}]`, error) || 
                        console.error(`Listener error for ${eventName}:`, error);
                    
                    // Don't let one failed listener break others
                }
            });
            
        } catch (error) {
            this.logger.error?.('Failed to emit event', { eventName, error }) || 
                console.error('Emit failed:', eventName, error);
        }
    }
    
    /**
     * Record event for debugging
     */
    recordEvent(eventName, data) {
        try {
            const eventRecord = {
                timestamp: Date.now(),
                name: eventName,
                data: data,
                listenerCount: this.listeners.has(eventName) ? this.listeners.get(eventName).length : 0
            };
            
            this.eventHistory.push(eventRecord);
            
            // Trim history to prevent memory issues
            if (this.eventHistory.length > this.maxHistory) {
                this.eventHistory = this.eventHistory.slice(-this.maxHistory * 0.8);
            }
            
        } catch (error) {
            // Don't let event recording break the actual event system
            console.error('Event recording failed:', error);
        }
    }
    
    /**
     * Get system status for debugging
     */
    getStatus() {
        return {
            totalEventTypes: this.listeners.size,
            totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            eventHistory: this.eventHistory.length,
            eventTypes: Array.from(this.listeners.keys())
        };
    }
    
    /**
     * Get recent events for debugging
     */
    getRecentEvents(count = 20) {
        return this.eventHistory.slice(-count);
    }
    
    /**
     * Clear event history to prevent memory issues
     */
    clearHistory() {
        const count = this.eventHistory.length;
        this.eventHistory = [];
        this.logger.info?.(`Cleared ${count} event history entries`) || 
            console.log(`Cleared ${count} event history entries`);
    }
}

// Export for use in other modules
window.BattletechEventBus = EventBus;

export default EventBus;