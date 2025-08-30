/**
 * Performance Monitor - Game Performance Tracking
 * Monitors FPS, memory usage, load times, and other performance metrics
 */
import { Logger } from './Logger';

export class PerformanceMonitor {
  static instance = null;
  static logger = new Logger('PerformanceMonitor');
  static isInitialized = false;
  static isMonitoring = false;
  static isPaused = false;

  // Performance metrics
  static metrics = {
    fps: {
      current: 0,
      average: 0,
      min: Infinity,
      max: 0,
      samples: [],
      targetFPS: 60
    },
    memory: {
      used: 0,
      total: 0,
      peak: 0,
      samples: []
    },
    timing: {
      frameTime: 0,
      renderTime: 0,
      updateTime: 0,
      samples: []
    },
    network: {
      requests: 0,
      totalTime: 0,
      errors: 0
    },
    game: {
      loadTime: 0,
      screenTransitions: 0,
      gameOperations: 0
    }
  };

  // Configuration
  static config = {
    maxSamples: 60, // Keep last 60 samples (1 second at 60fps)
    monitorInterval: 1000, // Update every second
    warningThresholds: {
      lowFPS: 30,
      highMemory: 100 * 1024 * 1024, // 100MB
      longFrameTime: 16.67 * 2 // 2x target frame time
    }
  };

  // Internal state
  static lastFrameTime = 0;
  static frameCount = 0;
  static startTime = 0;
  static monitoringInterval = null;
  static rafId = null;

  /**
   * Initialize performance monitoring
   */
  static initialize() {
    if (PerformanceMonitor.isInitialized) {
      return;
    }

    PerformanceMonitor.startTime = performance.now();
    
    // Setup performance observer if available
    PerformanceMonitor.setupPerformanceObserver();
    
    // Start monitoring
    PerformanceMonitor.start();
    
    PerformanceMonitor.isInitialized = true;
    PerformanceMonitor.logger.info('PerformanceMonitor initialized');
  }

  /**
   * Setup Performance Observer for detailed metrics
   */
  static setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      try {
        // Observe navigation timing
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'navigation') {
              PerformanceMonitor.processNavigationEntry(entry);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });

        // Observe resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.entryType === 'resource') {
              PerformanceMonitor.processResourceEntry(entry);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });

        PerformanceMonitor.logger.debug('PerformanceObserver setup complete');
      } catch (error) {
        PerformanceMonitor.logger.warn('PerformanceObserver setup failed:', error);
      }
    }
  }

  /**
   * Process navigation timing entry
   */
  static processNavigationEntry(entry) {
    PerformanceMonitor.metrics.game.loadTime = entry.loadEventEnd - entry.navigationStart;
    PerformanceMonitor.logger.info(`Page load time: ${PerformanceMonitor.metrics.game.loadTime}ms`);
  }

  /**
   * Process resource timing entry
   */
  static processResourceEntry(entry) {
    PerformanceMonitor.metrics.network.requests++;
    PerformanceMonitor.metrics.network.totalTime += entry.duration;
    
    if (entry.name.includes('error') || entry.transferSize === 0) {
      PerformanceMonitor.metrics.network.errors++;
    }
  }

  /**
   * Start performance monitoring
   */
  static start() {
    if (PerformanceMonitor.isMonitoring) {
      return;
    }

    PerformanceMonitor.isMonitoring = true;
    PerformanceMonitor.isPaused = false;
    
    // Start frame monitoring
    PerformanceMonitor.startFrameMonitoring();
    
    // Start periodic monitoring
    PerformanceMonitor.monitoringInterval = setInterval(() => {
      if (!PerformanceMonitor.isPaused) {
        PerformanceMonitor.updateMetrics();
      }
    }, PerformanceMonitor.config.monitorInterval);

    PerformanceMonitor.logger.debug('Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  static stop() {
    if (!PerformanceMonitor.isMonitoring) {
      return;
    }

    PerformanceMonitor.isMonitoring = false;
    
    // Stop frame monitoring
    if (PerformanceMonitor.rafId) {
      cancelAnimationFrame(PerformanceMonitor.rafId);
      PerformanceMonitor.rafId = null;
    }
    
    // Stop periodic monitoring
    if (PerformanceMonitor.monitoringInterval) {
      clearInterval(PerformanceMonitor.monitoringInterval);
      PerformanceMonitor.monitoringInterval = null;
    }

    PerformanceMonitor.logger.debug('Performance monitoring stopped');
  }

  /**
   * Pause monitoring
   */
  static pause() {
    PerformanceMonitor.isPaused = true;
    PerformanceMonitor.logger.debug('Performance monitoring paused');
  }

  /**
   * Resume monitoring
   */
  static resume() {
    PerformanceMonitor.isPaused = false;
    PerformanceMonitor.logger.debug('Performance monitoring resumed');
  }

  /**
   * Start frame-by-frame monitoring
   */
  static startFrameMonitoring() {
    const frameLoop = (currentTime) => {
      if (!PerformanceMonitor.isMonitoring) {
        return;
      }

      if (!PerformanceMonitor.isPaused) {
        PerformanceMonitor.processFrame(currentTime);
      }
      
      PerformanceMonitor.rafId = requestAnimationFrame(frameLoop);
    };

    PerformanceMonitor.rafId = requestAnimationFrame(frameLoop);
  }

  /**
   * Process individual frame for FPS calculation
   */
  static processFrame(currentTime) {
    if (PerformanceMonitor.lastFrameTime === 0) {
      PerformanceMonitor.lastFrameTime = currentTime;
      return;
    }

    const deltaTime = currentTime - PerformanceMonitor.lastFrameTime;
    PerformanceMonitor.lastFrameTime = currentTime;

    // Calculate FPS
    const fps = 1000 / deltaTime;
    
    // Update FPS metrics
    PerformanceMonitor.updateFPSMetrics(fps, deltaTime);
    
    PerformanceMonitor.frameCount++;
  }

  /**
   * Update FPS metrics
   */
  static updateFPSMetrics(fps, frameTime) {
    const fpsMetrics = PerformanceMonitor.metrics.fps;
    const timingMetrics = PerformanceMonitor.metrics.timing;
    
    // Current FPS
    fpsMetrics.current = Math.round(fps);
    
    // Add to samples
    fpsMetrics.samples.push(fps);
    timingMetrics.samples.push(frameTime);
    
    // Maintain sample size
    if (fpsMetrics.samples.length > PerformanceMonitor.config.maxSamples) {
      fpsMetrics.samples.shift();
      timingMetrics.samples.shift();
    }
    
    // Calculate average FPS
    fpsMetrics.average = Math.round(
      fpsMetrics.samples.reduce((sum, sample) => sum + sample, 0) / fpsMetrics.samples.length
    );
    
    // Update min/max
    fpsMetrics.min = Math.min(fpsMetrics.min, fps);
    fpsMetrics.max = Math.max(fpsMetrics.max, fps);
    
    // Update timing
    timingMetrics.frameTime = frameTime;
    
    // Check for performance warnings
    PerformanceMonitor.checkPerformanceWarnings(fps, frameTime);
  }

  /**
   * Update memory and other metrics
   */
  static updateMetrics() {
    // Update memory metrics if available
    if (performance.memory) {
      const memory = PerformanceMonitor.metrics.memory;
      memory.used = performance.memory.usedJSHeapSize;
      memory.total = performance.memory.totalJSHeapSize;
      memory.peak = Math.max(memory.peak, memory.used);
      
      memory.samples.push(memory.used);
      if (memory.samples.length > PerformanceMonitor.config.maxSamples) {
        memory.samples.shift();
      }
    }
  }

  /**
   * Check for performance warnings
   */
  static checkPerformanceWarnings(fps, frameTime) {
    const thresholds = PerformanceMonitor.config.warningThresholds;
    
    // Low FPS warning
    if (fps < thresholds.lowFPS) {
      PerformanceMonitor.logger.warn(`Low FPS detected: ${fps.toFixed(1)} fps`);
    }
    
    // Long frame time warning
    if (frameTime > thresholds.longFrameTime) {
      PerformanceMonitor.logger.warn(`Long frame time: ${frameTime.toFixed(2)}ms`);
    }
    
    // High memory usage warning
    if (performance.memory && performance.memory.usedJSHeapSize > thresholds.highMemory) {
      PerformanceMonitor.logger.warn(`High memory usage: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`);
    }
  }

  /**
   * Mark the start of a timed operation
   */
  static startTimer(name) {
    const timer = {
      name,
      startTime: performance.now(),
      endTime: null,
      duration: null
    };
    
    return timer;
  }

  /**
   * End a timed operation
   */
  static endTimer(timer) {
    if (!timer || timer.endTime !== null) {
      return timer;
    }
    
    timer.endTime = performance.now();
    timer.duration = timer.endTime - timer.startTime;
    
    PerformanceMonitor.logger.debug(`Timer '${timer.name}': ${timer.duration.toFixed(2)}ms`);
    
    return timer;
  }

  /**
   * Time a function execution
   */
  static timeFunction(name, fn, ...args) {
    const timer = PerformanceMonitor.startTimer(name);
    
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result && typeof result.then === 'function') {
        return result.finally(() => PerformanceMonitor.endTimer(timer));
      }
      
      PerformanceMonitor.endTimer(timer);
      return result;
    } catch (error) {
      PerformanceMonitor.endTimer(timer);
      throw error;
    }
  }

  /**
   * Get current performance metrics
   */
  static getMetrics() {
    return {
      ...PerformanceMonitor.metrics,
      uptime: performance.now() - PerformanceMonitor.startTime,
      frameCount: PerformanceMonitor.frameCount,
      isMonitoring: PerformanceMonitor.isMonitoring,
      isPaused: PerformanceMonitor.isPaused
    };
  }

  /**
   * Get performance summary
   */
  static getSummary() {
    const metrics = PerformanceMonitor.getMetrics();
    
    return {
      fps: {
        current: metrics.fps.current,
        average: metrics.fps.average,
        min: metrics.fps.min === Infinity ? 0 : Math.round(metrics.fps.min),
        max: Math.round(metrics.fps.max)
      },
      memory: performance.memory ? {
        used: `${(metrics.memory.used / 1024 / 1024).toFixed(1)}MB`,
        total: `${(metrics.memory.total / 1024 / 1024).toFixed(1)}MB`,
        peak: `${(metrics.memory.peak / 1024 / 1024).toFixed(1)}MB`
      } : 'Not available',
      timing: {
        uptime: `${(metrics.uptime / 1000).toFixed(1)}s`,
        frameTime: `${metrics.timing.frameTime.toFixed(2)}ms`,
        loadTime: `${metrics.game.loadTime}ms`
      },
      network: {
        requests: metrics.network.requests,
        errors: metrics.network.errors,
        averageTime: metrics.network.requests > 0 
          ? `${(metrics.network.totalTime / metrics.network.requests).toFixed(2)}ms`
          : '0ms'
      }
    };
  }

  /**
   * Export performance data
   */
  static exportData() {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: PerformanceMonitor.getMetrics(),
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      }
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Reset all metrics
   */
  static reset() {
    PerformanceMonitor.metrics = {
      fps: {
        current: 0,
        average: 0,
        min: Infinity,
        max: 0,
        samples: [],
        targetFPS: 60
      },
      memory: {
        used: 0,
        total: 0,
        peak: 0,
        samples: []
      },
      timing: {
        frameTime: 0,
        renderTime: 0,
        updateTime: 0,
        samples: []
      },
      network: {
        requests: 0,
        totalTime: 0,
        errors: 0
      },
      game: {
        loadTime: 0,
        screenTransitions: 0,
        gameOperations: 0
      }
    };
    
    PerformanceMonitor.frameCount = 0;
    PerformanceMonitor.startTime = performance.now();
    
    PerformanceMonitor.logger.info('Performance metrics reset');
  }

  /**
   * Create performance display panel
   */
  static createDisplayPanel() {
    const panel = document.createElement('div');
    panel.id = 'performance-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      border-radius: 4px;
      min-width: 200px;
    `;
    
    document.body.appendChild(panel);
    
    // Update panel every second
    const updatePanel = () => {
      if (!panel.parentElement) return;
      
      const summary = PerformanceMonitor.getSummary();
      panel.innerHTML = `
        <div style="margin-bottom: 5px; font-weight: bold;">Performance Monitor</div>
        <div>FPS: ${summary.fps.current} (avg: ${summary.fps.average})</div>
        <div>Frame: ${summary.timing.frameTime}ms</div>
        <div>Memory: ${typeof summary.memory === 'object' ? summary.memory.used : summary.memory}</div>
        <div>Uptime: ${summary.timing.uptime}</div>
        <div>Requests: ${summary.network.requests} (${summary.network.errors} errors)</div>
      `;
      
      setTimeout(updatePanel, 1000);
    };
    
    updatePanel();
    return panel;
  }

  /**
   * Toggle performance display panel
   */
  static toggle() {
    const existingPanel = document.getElementById('performance-panel');
    if (existingPanel) {
      existingPanel.remove();
    } else {
      PerformanceMonitor.createDisplayPanel();
    }
  }

  /**
   * Shutdown performance monitoring
   */
  static shutdown() {
    PerformanceMonitor.stop();
    
    const panel = document.getElementById('performance-panel');
    if (panel) {
      panel.remove();
    }
    
    PerformanceMonitor.isInitialized = false;
    PerformanceMonitor.logger.info('PerformanceMonitor shutdown');
  }
}