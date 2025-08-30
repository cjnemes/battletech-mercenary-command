/**
 * Bulletproof Logger - Comprehensive logging system
 * This module is designed to NEVER fail and provides debugging visibility
 */

class Logger {
    constructor(context = 'Game') {
        this.context = context;
        this.logs = [];
        this.maxLogs = 1000; // Prevent memory issues
        
        // Never let logger initialization fail
        try {
            this.initializeLogger();
        } catch (error) {
            console.error('Logger initialization failed, using console fallback:', error);
            this.fallbackMode = true;
        }
    }
    
    initializeLogger() {
        this.startTime = Date.now();
        this.fallbackMode = false;
        console.log(`[${this.context}] Logger initialized`);
    }
    
    // Core logging method - bulletproof
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            context: this.context,
            message,
            data
        };
        
        try {
            // Store log entry
            this.logs.push(logEntry);
            
            // Trim logs if too many
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(-this.maxLogs * 0.8);
            }
            
            // Output to console
            const consoleMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
            
            switch (level) {
                case 'ERROR':
                    console.error(consoleMessage, data);
                    break;
                case 'WARN':
                    console.warn(consoleMessage, data);
                    break;
                case 'INFO':
                    console.info(consoleMessage, data);
                    break;
                case 'DEBUG':
                    console.debug(consoleMessage, data);
                    break;
                default:
                    console.log(consoleMessage, data);
            }
            
        } catch (error) {
            // Even logging can't fail - fallback to basic console
            console.error('Logging failed:', error);
            console.log(`[FALLBACK] [${level}] ${message}`, data);
        }
    }
    
    // Convenience methods
    error(message, data) { this.log('ERROR', message, data); }
    warn(message, data) { this.log('WARN', message, data); }
    info(message, data) { this.log('INFO', message, data); }
    debug(message, data) { this.log('DEBUG', message, data); }
    
    // Get system status
    getStatus() {
        return {
            context: this.context,
            fallbackMode: this.fallbackMode,
            totalLogs: this.logs.length,
            uptime: Date.now() - this.startTime
        };
    }
    
    // Get recent logs for debugging
    getRecentLogs(count = 50) {
        return this.logs.slice(-count);
    }
    
    // Clear logs to prevent memory issues
    clearLogs() {
        const count = this.logs.length;
        this.logs = [];
        this.info(`Cleared ${count} log entries`);
    }
}

// Export for use in other modules
window.BattletechLogger = Logger;

export default Logger;