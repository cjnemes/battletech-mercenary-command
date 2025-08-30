/**
 * Error Handler - Centralized Error Management
 * Handles errors gracefully with logging, reporting, and user feedback
 */
import { Logger } from './Logger';

export class ErrorHandler {
  static instance = null;
  static logger = new Logger('ErrorHandler');
  static errorQueue = [];
  static maxErrorQueue = 50;
  static isInitialized = false;

  /**
   * Initialize the error handler
   */
  static initialize() {
    if (ErrorHandler.isInitialized) {
      return;
    }

    // Setup global error handlers
    ErrorHandler.setupGlobalHandlers();
    
    // Setup error reporting
    ErrorHandler.setupErrorReporting();
    
    ErrorHandler.isInitialized = true;
    ErrorHandler.logger.info('ErrorHandler initialized');
  }

  /**
   * Setup global error handlers
   */
  static setupGlobalHandlers() {
    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      ErrorHandler.handleError(event.error, {
        context: 'Global Error Handler',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        type: 'javascript'
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      ErrorHandler.handleError(event.reason, {
        context: 'Unhandled Promise Rejection',
        type: 'promise'
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        ErrorHandler.handleResourceError(event);
      }
    }, true);
  }

  /**
   * Setup error reporting system
   */
  static setupErrorReporting() {
    // In production, you might want to send errors to a service
    if (process.env.NODE_ENV === 'production') {
      // Example: Setup integration with error reporting service
      ErrorHandler.logger.info('Error reporting configured for production');
    }
  }

  /**
   * Main error handling method
   */
  static handleError(error, context = {}) {
    const errorInfo = ErrorHandler.createErrorInfo(error, context);
    
    // Add to error queue
    ErrorHandler.addToErrorQueue(errorInfo);
    
    // Log the error
    ErrorHandler.logError(errorInfo);
    
    // Show user notification for critical errors
    if (errorInfo.severity === 'critical' || errorInfo.severity === 'fatal') {
      ErrorHandler.showUserNotification(errorInfo);
    }
    
    // Report error if in production
    if (process.env.NODE_ENV === 'production') {
      ErrorHandler.reportError(errorInfo);
    }
    
    // Emit error event for application handling
    ErrorHandler.emitErrorEvent(errorInfo);
    
    return errorInfo;
  }

  /**
   * Handle resource loading errors
   */
  static handleResourceError(event) {
    const target = event.target;
    const errorInfo = {
      type: 'resource',
      resource: target.tagName,
      src: target.src || target.href,
      message: `Failed to load ${target.tagName}: ${target.src || target.href}`,
      severity: 'warning',
      timestamp: new Date().toISOString(),
      context: 'Resource Loading'
    };
    
    ErrorHandler.logger.warn('Resource loading error:', errorInfo);
    
    // Try to handle common resource errors
    ErrorHandler.handleResourceErrorRecovery(target);
  }

  /**
   * Attempt to recover from resource errors
   */
  static handleResourceErrorRecovery(target) {
    switch (target.tagName.toLowerCase()) {
      case 'img':
        // Replace with placeholder or default image
        target.src = '/assets/images/placeholder.png';
        break;
      case 'script':
        // Log critical script loading failure
        ErrorHandler.logger.error(`Critical script failed to load: ${target.src}`);
        break;
      case 'link':
        // CSS loading failure - less critical
        ErrorHandler.logger.warn(`Stylesheet failed to load: ${target.href}`);
        break;
    }
  }

  /**
   * Create structured error information
   */
  static createErrorInfo(error, context = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: ErrorHandler.extractErrorMessage(error),
      stack: ErrorHandler.extractErrorStack(error),
      type: context.type || ErrorHandler.determineErrorType(error),
      severity: context.severity || ErrorHandler.determineSeverity(error),
      context: context.context || 'Unknown',
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: ErrorHandler.getUserId(),
      sessionId: ErrorHandler.getSessionId(),
      gameState: ErrorHandler.getGameStateSnapshot(),
      additionalContext: { ...context }
    };
    
    // Add browser and system information
    errorInfo.browserInfo = {
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
    
    return errorInfo;
  }

  /**
   * Extract error message from various error types
   */
  static extractErrorMessage(error) {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && error.message) {
      return error.message;
    }
    
    if (error && error.toString) {
      return error.toString();
    }
    
    return 'Unknown error occurred';
  }

  /**
   * Extract error stack trace
   */
  static extractErrorStack(error) {
    if (error && error.stack) {
      return error.stack;
    }
    
    // Generate stack trace if not available
    try {
      throw new Error();
    } catch (e) {
      return e.stack;
    }
  }

  /**
   * Determine error type
   */
  static determineErrorType(error) {
    if (error instanceof TypeError) return 'TypeError';
    if (error instanceof ReferenceError) return 'ReferenceError';
    if (error instanceof SyntaxError) return 'SyntaxError';
    if (error instanceof RangeError) return 'RangeError';
    if (error instanceof Error) return 'Error';
    
    return 'Unknown';
  }

  /**
   * Determine error severity
   */
  static determineSeverity(error) {
    const message = ErrorHandler.extractErrorMessage(error).toLowerCase();
    
    // Fatal errors that break the game
    if (message.includes('out of memory') || 
        message.includes('script error') ||
        message.includes('network error')) {
      return 'fatal';
    }
    
    // Critical errors that affect core functionality
    if (message.includes('cannot read property') ||
        message.includes('is not defined') ||
        message.includes('is not a function')) {
      return 'critical';
    }
    
    // High priority errors
    if (message.includes('failed to fetch') ||
        message.includes('permission denied')) {
      return 'high';
    }
    
    // Medium priority errors
    if (message.includes('invalid') ||
        message.includes('unexpected')) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Add error to queue for tracking
   */
  static addToErrorQueue(errorInfo) {
    ErrorHandler.errorQueue.push(errorInfo);
    
    // Maintain queue size
    if (ErrorHandler.errorQueue.length > ErrorHandler.maxErrorQueue) {
      ErrorHandler.errorQueue.shift();
    }
  }

  /**
   * Log error with appropriate level
   */
  static logError(errorInfo) {
    const { severity, message, context, stack } = errorInfo;
    
    switch (severity) {
      case 'fatal':
        ErrorHandler.logger.fatal(`[${context}] ${message}`, { stack, errorInfo });
        break;
      case 'critical':
        ErrorHandler.logger.error(`[${context}] ${message}`, { stack, errorInfo });
        break;
      case 'high':
      case 'medium':
        ErrorHandler.logger.warn(`[${context}] ${message}`, errorInfo);
        break;
      default:
        ErrorHandler.logger.info(`[${context}] ${message}`, errorInfo);
    }
  }

  /**
   * Show user notification for critical errors
   */
  static showUserNotification(errorInfo) {
    // Create user-friendly error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-notification-content">
        <h3>Something went wrong</h3>
        <p>The game encountered an error. Don't worry, your progress has been saved.</p>
        <div class="error-notification-actions">
          <button onclick="location.reload()" class="btn btn-primary">Reload Game</button>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn btn-secondary">Continue</button>
        </div>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--card-bg);
      border: 2px solid var(--danger-color);
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      z-index: 10000;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Report error to external service (production)
   */
  static reportError(errorInfo) {
    // In a real application, send to error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    
    if (process.env.NODE_ENV === 'development') {
      ErrorHandler.logger.debug('Would report error to external service:', errorInfo);
    }
  }

  /**
   * Emit error event for application handling
   */
  static emitErrorEvent(errorInfo) {
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('battletech:error', {
        detail: errorInfo
      }));
    }
  }

  /**
   * Get user ID for error tracking
   */
  static getUserId() {
    // In a real application, get from authentication system
    return localStorage.getItem('battletech_user_id') || 'anonymous';
  }

  /**
   * Get session ID for error tracking
   */
  static getSessionId() {
    let sessionId = sessionStorage.getItem('battletech_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('battletech_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Get game state snapshot for debugging
   */
  static getGameStateSnapshot() {
    try {
      // Get basic game state info without sensitive data
      return {
        currentScreen: document.querySelector('.screen.active')?.id || 'unknown',
        hasGameData: !!localStorage.getItem('battletech_game_save'),
        timestamp: Date.now()
      };
    } catch (error) {
      return { error: 'Failed to get game state snapshot' };
    }
  }

  /**
   * Get recent errors
   */
  static getRecentErrors(count = 10) {
    return ErrorHandler.errorQueue.slice(-count);
  }

  /**
   * Clear error queue
   */
  static clearErrorQueue() {
    ErrorHandler.errorQueue.length = 0;
  }

  /**
   * Get error statistics
   */
  static getErrorStats() {
    const stats = {
      total: ErrorHandler.errorQueue.length,
      bySeverity: {},
      byType: {},
      byContext: {}
    };
    
    ErrorHandler.errorQueue.forEach(error => {
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      
      // Count by context
      stats.byContext[error.context] = (stats.byContext[error.context] || 0) + 1;
    });
    
    return stats;
  }
}