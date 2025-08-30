/**
 * Bulletproof Error Handler - Global error management system
 * This system captures and handles all errors to prevent application crashes
 */

class ErrorHandler {
    constructor(logger, eventBus) {
        this.logger = logger || console;
        this.eventBus = eventBus;
        this.errorCount = 0;
        this.maxErrors = 100;
        this.errorHistory = [];
        
        try {
            this.initialize();
        } catch (error) {
            console.error('❌ CRITICAL: ErrorHandler initialization failed', error);
            this.fallbackMode = true;
        }
    }
    
    initialize() {
        this.logger.info('🛡️ ErrorHandler initializing...');
        
        // Set up global error handlers
        this.setupGlobalErrorHandlers();
        
        // Set up unhandled promise rejection handler
        this.setupPromiseRejectionHandler();
        
        // Set up resource error handler
        this.setupResourceErrorHandler();
        
        this.logger.info('✅ ErrorHandler initialized successfully');
    }
    
    setupGlobalErrorHandlers() {
        try {
            // Handle JavaScript runtime errors
            const originalErrorHandler = window.onerror;
            
            window.onerror = (message, source, lineno, colno, error) => {
                this.handleGlobalError({
                    type: 'javascript',
                    message: message,
                    source: source,
                    line: lineno,
                    column: colno,
                    error: error,
                    timestamp: Date.now()
                });
                
                // Call original handler if it existed
                if (originalErrorHandler) {
                    return originalErrorHandler(message, source, lineno, colno, error);
                }
                
                return false; // Don't suppress default browser error handling
            };
            
            // Handle errors in event handlers and async code
            window.addEventListener('error', (event) => {
                this.handleGlobalError({
                    type: 'event',
                    message: event.message,
                    source: event.filename,
                    line: event.lineno,
                    column: event.colno,
                    error: event.error,
                    timestamp: Date.now()
                });
            });
            
            this.logger.debug('Global error handlers established');
            
        } catch (error) {
            this.logger.error('Failed to setup global error handlers', error);
        }
    }
    
    setupPromiseRejectionHandler() {
        try {
            window.addEventListener('unhandledrejection', (event) => {
                this.handlePromiseRejection({
                    type: 'unhandled_promise_rejection',
                    reason: event.reason,
                    promise: event.promise,
                    timestamp: Date.now()
                });
                
                // Prevent browser console error for handled rejections
                event.preventDefault();
            });
            
            window.addEventListener('rejectionhandled', (event) => {
                this.logger.debug('Previously unhandled promise rejection was handled', {
                    promise: event.promise
                });
            });
            
            this.logger.debug('Promise rejection handlers established');
            
        } catch (error) {
            this.logger.error('Failed to setup promise rejection handlers', error);
        }
    }
    
    setupResourceErrorHandler() {
        try {
            window.addEventListener('error', (event) => {
                // Handle resource loading errors (images, scripts, stylesheets)
                if (event.target !== window) {
                    this.handleResourceError({
                        type: 'resource',
                        element: event.target.tagName,
                        source: event.target.src || event.target.href,
                        message: 'Resource failed to load',
                        timestamp: Date.now()
                    });
                }
            }, true); // Use capture phase to catch resource errors
            
            this.logger.debug('Resource error handlers established');
            
        } catch (error) {
            this.logger.error('Failed to setup resource error handlers', error);
        }
    }
    
    /**
     * Handle JavaScript runtime errors
     */
    handleGlobalError(errorData) {
        try {
            this.errorCount++;
            this.recordError(errorData);
            
            this.logger.error('🚨 Global JavaScript Error', errorData);
            
            // Emit error event for other systems to handle
            if (this.eventBus) {
                this.eventBus.emit('system.error', {
                    source: 'ErrorHandler',
                    type: 'global_error',
                    data: errorData
                });
            }
            
            // Check if we're getting too many errors (possible infinite loop)
            if (this.errorCount > this.maxErrors) {
                this.handleCriticalErrorSituation();
            }
            
        } catch (handlingError) {
            // If error handling fails, use console directly
            console.error('❌ CRITICAL: Error handling failed', handlingError);
            console.error('❌ Original error that caused the failure:', errorData);
        }
    }
    
    /**
     * Handle unhandled promise rejections
     */
    handlePromiseRejection(rejectionData) {
        try {
            this.errorCount++;
            this.recordError(rejectionData);
            
            this.logger.error('🚨 Unhandled Promise Rejection', rejectionData);
            
            // Emit error event
            if (this.eventBus) {
                this.eventBus.emit('system.error', {
                    source: 'ErrorHandler',
                    type: 'promise_rejection',
                    data: rejectionData
                });
            }
            
        } catch (handlingError) {
            console.error('❌ CRITICAL: Promise rejection handling failed', handlingError);
            console.error('❌ Original rejection:', rejectionData);
        }
    }
    
    /**
     * Handle resource loading errors
     */
    handleResourceError(resourceData) {
        try {
            this.recordError(resourceData);
            
            this.logger.warn('⚠️ Resource Loading Error', resourceData);
            
            // Emit error event
            if (this.eventBus) {
                this.eventBus.emit('system.error', {
                    source: 'ErrorHandler',
                    type: 'resource_error',
                    data: resourceData
                });
            }
            
        } catch (handlingError) {
            console.error('❌ Resource error handling failed', handlingError);
        }
    }
    
    /**
     * Handle module-specific errors
     */
    handleModuleError(moduleName, error, context = {}) {
        try {
            const errorData = {
                type: 'module_error',
                module: moduleName,
                error: error,
                context: context,
                message: error.message || 'Unknown module error',
                stack: error.stack,
                timestamp: Date.now()
            };
            
            this.recordError(errorData);
            
            this.logger.error(`🚨 Module Error [${moduleName}]`, errorData);
            
            // Emit error event
            if (this.eventBus) {
                this.eventBus.emit('system.error', {
                    source: 'ErrorHandler',
                    type: 'module_error',
                    data: errorData
                });
            }
            
            return errorData;
            
        } catch (handlingError) {
            console.error('❌ Module error handling failed', handlingError);
            return null;
        }
    }
    
    /**
     * Record error in history for debugging
     */
    recordError(errorData) {
        try {
            this.errorHistory.push({
                ...errorData,
                id: Date.now() + Math.random()
            });
            
            // Trim error history to prevent memory issues
            if (this.errorHistory.length > 200) {
                this.errorHistory = this.errorHistory.slice(-150);
            }
            
        } catch (error) {
            console.error('Failed to record error in history:', error);
        }
    }
    
    /**
     * Handle critical error situations (too many errors)
     */
    handleCriticalErrorSituation() {
        try {
            this.logger.error('🚨 CRITICAL: Too many errors detected, possible infinite loop');
            
            // Emit critical error event
            if (this.eventBus) {
                this.eventBus.emit('system.critical.error', {
                    errorCount: this.errorCount,
                    timestamp: Date.now()
                });
            }
            
            // Reset error count to prevent spam
            this.errorCount = 0;
            
        } catch (error) {
            console.error('❌ Critical error handling failed:', error);
        }
    }
    
    /**
     * Get error statistics
     */
    getErrorStats() {
        return {
            totalErrors: this.errorCount,
            recentErrors: this.errorHistory.slice(-10),
            errorHistory: this.errorHistory.length,
            fallbackMode: this.fallbackMode || false
        };
    }
    
    /**
     * Clear error history
     */
    clearErrorHistory() {
        const count = this.errorHistory.length;
        this.errorHistory = [];
        this.errorCount = 0;
        this.logger.info(`Cleared ${count} error history entries`);
    }
    
    /**
     * Create safe wrapper for potentially dangerous functions
     */
    createSafeWrapper(fn, context = 'unknown') {
        return (...args) => {
            try {
                return fn.apply(this, args);
            } catch (error) {
                this.handleModuleError(context, error, { args });
                return null;
            }
        };
    }
    
    /**
     * Create safe async wrapper for promises
     */
    createSafeAsyncWrapper(asyncFn, context = 'unknown') {
        return async (...args) => {
            try {
                return await asyncFn.apply(this, args);
            } catch (error) {
                this.handleModuleError(context, error, { args });
                return null;
            }
        };
    }
}

// Export for use in other modules
window.BattletechErrorHandler = ErrorHandler;

export default ErrorHandler;