/**
 * Logger Utility - Professional logging system
 * Provides structured logging with different levels and contexts
 */

export class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.logLevel = this.getLogLevel();
    this.isDevelopment = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') || false;
  }

  /**
   * Get log level from environment or default to INFO
   */
  getLogLevel() {
    if (typeof process !== 'undefined' && process.env && process.env.LOG_LEVEL) {
      return process.env.LOG_LEVEL.toUpperCase();
    }
    
    // Default to DEBUG in development, INFO in production
    return this.isDevelopment ? 'DEBUG' : 'INFO';
  }

  /**
   * Check if log level should be output
   */
  shouldLog(level) {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }

  /**
   * Format log message with timestamp and context
   */
  formatMessage(level, message, ...args) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
    
    return args.length > 0 ? [formattedMessage, ...args] : [formattedMessage];
  }

  /**
   * Log debug message
   */
  debug(message, ...args) {
    if (this.shouldLog('DEBUG')) {
      const formattedArgs = this.formatMessage('DEBUG', message, ...args);
      console.debug(...formattedArgs);
    }
  }

  /**
   * Log info message
   */
  info(message, ...args) {
    if (this.shouldLog('INFO')) {
      const formattedArgs = this.formatMessage('INFO', message, ...args);
      console.info(...formattedArgs);
    }
  }

  /**
   * Log warning message
   */
  warn(message, ...args) {
    if (this.shouldLog('WARN')) {
      const formattedArgs = this.formatMessage('WARN', message, ...args);
      console.warn(...formattedArgs);
    }
  }

  /**
   * Log error message
   */
  error(message, ...args) {
    if (this.shouldLog('ERROR')) {
      const formattedArgs = this.formatMessage('ERROR', message, ...args);
      console.error(...formattedArgs);
    }
  }

  /**
   * Log with custom level
   */
  log(level, message, ...args) {
    switch (level.toUpperCase()) {
      case 'DEBUG':
        this.debug(message, ...args);
        break;
      case 'INFO':
        this.info(message, ...args);
        break;
      case 'WARN':
        this.warn(message, ...args);
        break;
      case 'ERROR':
        this.error(message, ...args);
        break;
      default:
        this.info(message, ...args);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext) {
    const childLogger = new Logger(`${this.context}:${additionalContext}`);
    childLogger.logLevel = this.logLevel;
    return childLogger;
  }

  /**
   * Set log level
   */
  setLevel(level) {
    this.logLevel = level.toUpperCase();
  }

  /**
   * Get current log level
   */
  getLevel() {
    return this.logLevel;
  }
}