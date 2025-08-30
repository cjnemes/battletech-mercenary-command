/**
 * Logger - Professional Logging System
 * Provides structured logging with levels, formatting, and persistence
 */
export class Logger {
  static LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  };

  static LOG_LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
  static LOG_LEVEL_COLORS = {
    DEBUG: '#8491a3',
    INFO: '#5aa3ff',
    WARN: '#f39c12',
    ERROR: '#e74c3c',
    FATAL: '#c0392b'
  };

  constructor(context = 'App') {
    this.context = context;
    this.minLevel = Logger.getMinLogLevel();
    this.logBuffer = [];
    this.maxBufferSize = 1000;
    this.persistLogs = true;
  }

  /**
   * Get minimum log level based on environment
   */
  static getMinLogLevel() {
    if (process.env.NODE_ENV === 'development') {
      return Logger.LOG_LEVELS.DEBUG;
    } else if (process.env.NODE_ENV === 'test') {
      return Logger.LOG_LEVELS.WARN;
    } else {
      return Logger.LOG_LEVELS.INFO;
    }
  }

  /**
   * Debug level logging
   */
  debug(message, ...args) {
    this.log(Logger.LOG_LEVELS.DEBUG, message, ...args);
  }

  /**
   * Info level logging
   */
  info(message, ...args) {
    this.log(Logger.LOG_LEVELS.INFO, message, ...args);
  }

  /**
   * Warning level logging
   */
  warn(message, ...args) {
    this.log(Logger.LOG_LEVELS.WARN, message, ...args);
  }

  /**
   * Error level logging
   */
  error(message, ...args) {
    this.log(Logger.LOG_LEVELS.ERROR, message, ...args);
  }

  /**
   * Fatal error logging
   */
  fatal(message, ...args) {
    this.log(Logger.LOG_LEVELS.FATAL, message, ...args);
  }

  /**
   * Core logging method
   */
  log(level, message, ...args) {
    if (level < this.minLevel) {
      return;
    }

    const logEntry = this.createLogEntry(level, message, args);
    
    // Add to buffer
    this.addToBuffer(logEntry);
    
    // Console output
    this.outputToConsole(logEntry);
    
    // Persist if enabled
    if (this.persistLogs && level >= Logger.LOG_LEVELS.INFO) {
      this.persistLog(logEntry);
    }

    // Emit log event for external handlers
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('battletech:log', {
        detail: logEntry
      }));
    }
  }

  /**
   * Create structured log entry
   */
  createLogEntry(level, message, args) {
    const timestamp = new Date();
    const levelName = Logger.LOG_LEVEL_NAMES[level];
    
    return {
      timestamp: timestamp.toISOString(),
      level: levelName,
      context: this.context,
      message: String(message),
      args: args.length > 0 ? args : undefined,
      stack: level >= Logger.LOG_LEVELS.ERROR ? this.getStackTrace() : undefined
    };
  }

  /**
   * Output log entry to console
   */
  outputToConsole(logEntry) {
    const { timestamp, level, context, message, args } = logEntry;
    const color = Logger.LOG_LEVEL_COLORS[level];
    
    // Format timestamp for console
    const time = new Date(timestamp).toLocaleTimeString();
    
    // Create formatted message
    const formattedMessage = `%c[${time}] %c${level} %c[${context}] %c${message}`;
    const styles = [
      'color: #8491a3', // timestamp
      `color: ${color}; font-weight: bold`, // level
      'color: #b8c5d6', // context
      'color: inherit' // message
    ];

    // Choose appropriate console method
    const consoleMethod = this.getConsoleMethod(level);
    
    if (args && args.length > 0) {
      consoleMethod(formattedMessage, ...styles, ...args);
    } else {
      consoleMethod(formattedMessage, ...styles);
    }
  }

  /**
   * Get appropriate console method for log level
   */
  getConsoleMethod(level) {
    switch (level) {
      case 'DEBUG':
        return console.debug;
      case 'INFO':
        return console.info;
      case 'WARN':
        return console.warn;
      case 'ERROR':
      case 'FATAL':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Add log entry to buffer
   */
  addToBuffer(logEntry) {
    this.logBuffer.push(logEntry);
    
    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  /**
   * Persist log to localStorage
   */
  persistLog(logEntry) {
    try {
      const key = `battletech_logs_${new Date().toDateString()}`;
      const existingLogs = JSON.parse(localStorage.getItem(key) || '[]');
      
      existingLogs.push(logEntry);
      
      // Keep only last 100 entries per day
      if (existingLogs.length > 100) {
        existingLogs.shift();
      }
      
      localStorage.setItem(key, JSON.stringify(existingLogs));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Get stack trace for error logging
   */
  getStackTrace() {
    const stack = new Error().stack;
    if (stack) {
      return stack.split('\n').slice(3).join('\n'); // Remove Logger frames
    }
    return undefined;
  }

  /**
   * Get recent log entries from buffer
   */
  getRecentLogs(count = 50) {
    return this.logBuffer.slice(-count);
  }

  /**
   * Get persisted logs for a specific date
   */
  getPersistedLogs(date = new Date()) {
    try {
      const key = `battletech_logs_${date.toDateString()}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear log buffer
   */
  clearBuffer() {
    this.logBuffer.length = 0;
  }

  /**
   * Clear persisted logs
   */
  clearPersistedLogs(date = null) {
    try {
      if (date) {
        const key = `battletech_logs_${date.toDateString()}`;
        localStorage.removeItem(key);
      } else {
        // Clear all log entries
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('battletech_logs_')
        );
        keys.forEach(key => localStorage.removeItem(key));
      }
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Set minimum log level
   */
  setMinLevel(level) {
    this.minLevel = typeof level === 'string' 
      ? Logger.LOG_LEVELS[level.toUpperCase()] 
      : level;
  }

  /**
   * Enable/disable log persistence
   */
  setPersistence(enabled) {
    this.persistLogs = enabled;
  }

  /**
   * Export logs as downloadable file
   */
  exportLogs(format = 'json') {
    const logs = this.getRecentLogs();
    let content;
    let mimeType;
    let filename;

    switch (format.toLowerCase()) {
      case 'csv':
        content = this.convertToCsv(logs);
        mimeType = 'text/csv';
        filename = `battletech-logs-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'txt':
        content = this.convertToText(logs);
        mimeType = 'text/plain';
        filename = `battletech-logs-${new Date().toISOString().split('T')[0]}.txt`;
        break;
      default:
        content = JSON.stringify(logs, null, 2);
        mimeType = 'application/json';
        filename = `battletech-logs-${new Date().toISOString().split('T')[0]}.json`;
    }

    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Convert logs to CSV format
   */
  convertToCsv(logs) {
    const headers = ['Timestamp', 'Level', 'Context', 'Message'];
    const rows = logs.map(log => [
      log.timestamp,
      log.level,
      log.context,
      `"${log.message.replace(/"/g, '""')}"`
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Convert logs to plain text format
   */
  convertToText(logs) {
    return logs.map(log => 
      `[${log.timestamp}] ${log.level} [${log.context}] ${log.message}`
    ).join('\n');
  }

  /**
   * Create a child logger with extended context
   */
  child(additionalContext) {
    const childLogger = new Logger(`${this.context}:${additionalContext}`);
    childLogger.minLevel = this.minLevel;
    childLogger.persistLogs = this.persistLogs;
    return childLogger;
  }

  /**
   * Static method to create logger instances
   */
  static create(context) {
    return new Logger(context);
  }
}