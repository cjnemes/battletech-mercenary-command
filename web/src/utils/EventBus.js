/**
 * Event Bus - Decoupled Communication System
 * Enables loose coupling between game components
 */
export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.wildcardListeners = [];
    this.maxListeners = 100;
    this.debug = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') || false;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   * @param {Object} options - Options (once, priority, context)
   */
  on(event, callback, options = {}) {
    if (typeof callback !== 'function') {
      throw new Error('Event callback must be a function');
    }

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listeners = this.listeners.get(event);
    
    // Check listener limit
    if (listeners.length >= this.maxListeners) {
      console.warn(`EventBus: Maximum listeners (${this.maxListeners}) reached for event '${event}'`);
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      context: options.context || null,
      id: this.generateListenerId()
    };

    // Insert listener based on priority (higher priority first)
    const insertIndex = listeners.findIndex(l => l.priority < listener.priority);
    if (insertIndex === -1) {
      listeners.push(listener);
    } else {
      listeners.splice(insertIndex, 0, listener);
    }

    if (this.debug) {
      console.log(`EventBus: Listener added for '${event}' (${listener.id})`);
    }

    return listener.id;
  }

  /**
   * Subscribe to an event once
   */
  once(event, callback, options = {}) {
    return this.on(event, callback, { ...options, once: true });
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function|string} callbackOrId - Callback function or listener ID
   */
  off(event, callbackOrId) {
    if (!this.listeners.has(event)) {
      return false;
    }

    const listeners = this.listeners.get(event);
    const isId = typeof callbackOrId === 'string';
    
    const index = listeners.findIndex(listener => 
      isId ? listener.id === callbackOrId : listener.callback === callbackOrId
    );

    if (index !== -1) {
      const removed = listeners.splice(index, 1)[0];
      
      if (listeners.length === 0) {
        this.listeners.delete(event);
      }

      if (this.debug) {
        console.log(`EventBus: Listener removed for '${event}' (${removed.id})`);
      }
      
      return true;
    }

    return false;
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @param {Object} options - Options (async, timeout)
   */
  emit(event, data = null, options = {}) {
    if (this.debug) {
      console.log(`EventBus: Emitting '${event}'`, data);
    }

    // Handle async emission
    if (options.async) {
      return this.emitAsync(event, data, options);
    }

    // Get event listeners
    const listeners = this.listeners.get(event) || [];
    const results = [];
    const toRemove = [];

    // Execute listeners
    for (const listener of listeners) {
      try {
        let result;
        
        if (listener.context) {
          result = listener.callback.call(listener.context, data, event);
        } else {
          result = listener.callback(data, event);
        }
        
        results.push(result);

        // Mark for removal if 'once' listener
        if (listener.once) {
          toRemove.push(listener);
        }
        
      } catch (error) {
        console.error(`EventBus: Error in listener for '${event}':`, error);
        
        // Emit error event
        if (event !== 'error') {
          setTimeout(() => this.emit('error', { 
            originalEvent: event, 
            error, 
            listener: listener.id 
          }), 0);
        }
      }
    }

    // Remove 'once' listeners
    toRemove.forEach(listener => this.off(event, listener.id));

    // Handle wildcard listeners
    this.wildcardListeners.forEach(listener => {
      try {
        listener.callback(event, data);
      } catch (error) {
        console.error('EventBus: Error in wildcard listener:', error);
      }
    });

    return results;
  }

  /**
   * Emit event asynchronously
   */
  async emitAsync(event, data = null, options = {}) {
    const timeout = options.timeout || 5000;
    const listeners = this.listeners.get(event) || [];
    const promises = [];
    const toRemove = [];

    // Execute listeners asynchronously
    for (const listener of listeners) {
      const promise = new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Listener timeout for event '${event}'`));
        }, timeout);

        try {
          const result = listener.context 
            ? listener.callback.call(listener.context, data, event)
            : listener.callback(data, event);
          
          clearTimeout(timeoutId);
          
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject);
          } else {
            resolve(result);
          }
          
          if (listener.once) {
            toRemove.push(listener);
          }
          
        } catch (error) {
          clearTimeout(timeoutId);
          reject(error);
        }
      });

      promises.push(promise);
    }

    try {
      const results = await Promise.all(promises);
      
      // Remove 'once' listeners
      toRemove.forEach(listener => this.off(event, listener.id));
      
      return results;
    } catch (error) {
      console.error(`EventBus: Error in async emission for '${event}':`, error);
      throw error;
    }
  }

  /**
   * Subscribe to all events (wildcard)
   */
  onAny(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Wildcard callback must be a function');
    }

    const listener = {
      callback,
      id: this.generateListenerId()
    };

    this.wildcardListeners.push(listener);
    return listener.id;
  }

  /**
   * Unsubscribe from all events
   */
  offAny(callbackOrId) {
    const isId = typeof callbackOrId === 'string';
    const index = this.wildcardListeners.findIndex(listener =>
      isId ? listener.id === callbackOrId : listener.callback === callbackOrId
    );

    if (index !== -1) {
      this.wildcardListeners.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get all listeners for an event
   */
  getListeners(event) {
    return this.listeners.get(event) || [];
  }

  /**
   * Get all event names
   */
  getEvents() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all listeners for an event or all events
   */
  clear(event = null) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
      this.wildcardListeners.length = 0;
    }
  }

  /**
   * Get listener statistics
   */
  getStats() {
    const stats = {
      events: this.listeners.size,
      totalListeners: 0,
      wildcardListeners: this.wildcardListeners.length,
      eventBreakdown: {}
    };

    this.listeners.forEach((listeners, event) => {
      stats.totalListeners += listeners.length;
      stats.eventBreakdown[event] = listeners.length;
    });

    return stats;
  }

  /**
   * Generate unique listener ID
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enable/disable debug mode
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
}