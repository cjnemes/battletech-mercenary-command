/**
 * MobileOptimizer - Enhanced Mobile Experience System
 * Professional mobile optimizations with touch interactions and performance enhancements
 */
import { Logger } from '../../utils/Logger.js';

export class MobileOptimizer {
  constructor(eventBus) {
    this.logger = new Logger('MobileOptimizer');
    this.eventBus = eventBus;
    
    // Mobile Detection
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.isTouchDevice = this.detectTouch();
    this.isIOS = this.detectIOS();
    this.isAndroid = this.detectAndroid();
    
    // Touch State Management
    this.touchStartTime = 0;
    this.lastTouchEnd = 0;
    this.touchThreshold = 300; // Double-tap threshold
    this.swipeThreshold = 50; // Minimum swipe distance
    this.velocityThreshold = 0.3; // Swipe velocity threshold
    
    // Gesture Recognition
    this.touchStartPos = { x: 0, y: 0 };
    this.touchEndPos = { x: 0, y: 0 };
    this.isSwipeInProgress = false;
    this.activeGestures = new Set();
    
    // Performance Optimization
    this.isInitialized = false;
    this.performanceMode = 'auto'; // 'auto', 'performance', 'battery'
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // UI State
    this.collapsedSections = new Set();
    this.bottomSheetStack = [];
    this.currentOrientation = this.getOrientation();
    
    // Haptic Feedback Support
    this.hapticSupported = 'vibrate' in navigator;
    this.hapticEnabled = true;
    
    // Virtual Keyboard Handling
    this.viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    this.keyboardVisible = false;
    
    // Performance Monitoring
    this.frameTime = 0;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    
    // Touch Event Listeners
    this.touchListeners = new Map();
    this.passiveListeners = { passive: true };
    this.nonPassiveListeners = { passive: false };
    
    // Scroll Optimization
    this.scrollTicking = false;
    this.lastScrollTop = 0;
    this.scrollVelocity = 0;
  }

  /**
   * Initialize mobile optimization system
   */
  async initialize() {
    try {
      this.logger.info('Initializing MobileOptimizer...');
      
      // Setup mobile-specific optimizations
      this.setupViewportOptimizations();
      this.setupTouchHandling();
      this.setupGestureRecognition();
      this.setupPerformanceOptimizations();
      this.setupAccessibilityEnhancements();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Apply initial optimizations
      this.applyMobileOptimizations();
      
      // Setup orientation handling
      this.setupOrientationHandling();
      
      // Setup virtual keyboard handling
      if (window.visualViewport) {
        this.setupVirtualKeyboard();
      }
      
      // Load user preferences
      this.loadMobilePreferences();
      
      this.isInitialized = true;
      this.logger.info(`MobileOptimizer initialized - Device: ${this.getDeviceInfo()}`);
      
      this.eventBus.emit('mobile:initialized', {
        isMobile: this.isMobile,
        isTablet: this.isTablet,
        deviceInfo: this.getDeviceInfo()
      });
      
    } catch (error) {
      this.logger.error('Failed to initialize MobileOptimizer:', error);
      throw error;
    }
  }

  /**
   * Setup viewport optimizations
   */
  setupViewportOptimizations() {
    // Set mobile-friendly viewport
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    
    // Optimized viewport settings
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes, viewport-fit=cover';
    
    // Add mobile-specific meta tags
    this.addMobileMetaTags();
    
    // Setup iOS-specific optimizations
    if (this.isIOS) {
      this.setupIOSOptimizations();
    }
    
    // Setup Android-specific optimizations
    if (this.isAndroid) {
      this.setupAndroidOptimizations();
    }
  }

  /**
   * Add mobile-specific meta tags
   */
  addMobileMetaTags() {
    const metaTags = [
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'Battletech Command' },
      { name: 'theme-color', content: '#0c0f1a' },
      { name: 'msapplication-navbutton-color', content: '#0c0f1a' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
    ];
    
    metaTags.forEach(tag => {
      if (!document.querySelector(`meta[name="${tag.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
  }

  /**
   * Setup iOS-specific optimizations
   */
  setupIOSOptimizations() {
    // Fix iOS Safari viewport issues
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    
    // Handle iOS Safari address bar changes
    const updateVH = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    };
    
    window.addEventListener('resize', updateVH);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateVH, 500); // Delay for iOS Safari
    });
    
    // Prevent bounce scrolling
    document.body.style.overscrollBehavior = 'none';
    
    // Fix iOS input zoom
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.style.fontSize === '' || parseFloat(input.style.fontSize) < 16) {
        input.style.fontSize = '16px';
      }
    });
  }

  /**
   * Setup Android-specific optimizations
   */
  setupAndroidOptimizations() {
    // Android Chrome optimizations
    if (navigator.userAgent.includes('Chrome')) {
      // Enable hardware acceleration
      document.documentElement.style.transform = 'translateZ(0)';
      
      // Optimize scroll performance
      document.body.style.overflowX = 'hidden';
    }
    
    // Handle Android keyboard
    if (window.visualViewport) {
      this.setupAndroidKeyboard();
    }
  }

  /**
   * Setup touch handling
   */
  setupTouchHandling() {
    // Basic touch events
    document.addEventListener('touchstart', this.handleTouchStart.bind(this), this.passiveListeners);
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), this.nonPassiveListeners);
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), this.passiveListeners);
    document.addEventListener('touchcancel', this.handleTouchCancel.bind(this), this.passiveListeners);
    
    // Enhanced button touch feedback
    this.setupButtonTouchFeedback();
    
    // Fast click implementation
    this.setupFastClick();
    
    // Touch ripple effects
    this.setupTouchRipples();
  }

  /**
   * Setup gesture recognition
   */
  setupGestureRecognition() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        this.touchStartPos = { x: touchStartX, y: touchStartY };
      }
    }, this.passiveListeners);
    
    document.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchEndTime = Date.now();
        const duration = touchEndTime - touchStartTime;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        this.touchEndPos = { x: touchEndX, y: touchEndY };
        
        // Detect swipe gestures
        if (distance > this.swipeThreshold && duration < 500) {
          this.handleSwipeGesture(deltaX, deltaY, duration);
        }
        
        // Detect tap gestures
        if (distance < 10 && duration < 300) {
          this.handleTapGesture(e.changedTouches[0], duration);
        }
      }
    }, this.passiveListeners);
  }

  /**
   * Handle swipe gestures
   */
  handleSwipeGesture(deltaX, deltaY, duration) {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    let direction = '';
    let velocity = 0;
    
    if (absX > absY) {
      // Horizontal swipe
      direction = deltaX > 0 ? 'right' : 'left';
      velocity = absX / duration;
    } else {
      // Vertical swipe
      direction = deltaY > 0 ? 'down' : 'up';
      velocity = absY / duration;
    }
    
    if (velocity > this.velocityThreshold) {
      this.eventBus.emit('mobile:swipe', {
        direction,
        velocity,
        distance: absX > absY ? absX : absY,
        deltaX,
        deltaY
      });
      
      this.handleSwipeAction(direction, velocity);
    }
  }

  /**
   * Handle swipe actions
   */
  handleSwipeAction(direction, velocity) {
    const currentScreen = document.querySelector('.screen.active');
    if (!currentScreen) return;
    
    // Screen navigation via swipe
    switch (direction) {
      case 'left':
        // Navigate to next screen
        this.eventBus.emit('ui:navigationSwipe', { direction: 'next' });
        break;
      case 'right':
        // Navigate to previous screen
        this.eventBus.emit('ui:navigationSwipe', { direction: 'previous' });
        break;
      case 'up':
        // Show additional options or dismiss bottom sheet
        if (this.bottomSheetStack.length > 0) {
          this.dismissBottomSheet();
        }
        break;
      case 'down':
        // Pull to refresh or show notifications
        if (window.scrollY === 0 && velocity > 0.5) {
          this.eventBus.emit('ui:pullToRefresh');
        }
        break;
    }
  }

  /**
   * Handle tap gestures
   */
  handleTapGesture(touch, duration) {
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!target) return;
    
    // Double-tap detection
    const now = Date.now();
    if (now - this.lastTouchEnd < this.touchThreshold) {
      this.eventBus.emit('mobile:doubleTap', {
        target,
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      
      this.handleDoubleTapAction(target);
    }
    
    this.lastTouchEnd = now;
    
    // Haptic feedback for interactive elements
    if (this.isInteractiveElement(target)) {
      this.triggerHapticFeedback('light');
    }
  }

  /**
   * Handle double-tap actions
   */
  handleDoubleTapAction(target) {
    // Zoom functionality for images or detailed views
    if (target.tagName === 'IMG' || target.classList.contains('zoomable')) {
      this.toggleZoom(target);
    }
    
    // Quick actions for cards
    if (target.closest('.info-card, .pilot-card, .mech-card')) {
      this.eventBus.emit('ui:quickAction', { target: target.closest('.info-card, .pilot-card, .mech-card') });
    }
  }

  /**
   * Setup button touch feedback
   */
  setupButtonTouchFeedback() {
    document.addEventListener('touchstart', (e) => {
      const button = e.target.closest('.btn, button, [role="button"]');
      if (button && !button.disabled) {
        button.classList.add('touch-active');
        this.triggerHapticFeedback('light');
        
        // Auto-remove after delay
        setTimeout(() => {
          button.classList.remove('touch-active');
        }, 150);
      }
    }, this.passiveListeners);
  }

  /**
   * Setup fast click implementation
   */
  setupFastClick() {
    let touchStartTarget = null;
    
    document.addEventListener('touchstart', (e) => {
      touchStartTarget = e.target;
    }, this.passiveListeners);
    
    document.addEventListener('touchend', (e) => {
      if (touchStartTarget === e.target && this.isInteractiveElement(e.target)) {
        e.preventDefault();
        e.target.click();
      }
      touchStartTarget = null;
    }, this.nonPassiveListeners);
  }

  /**
   * Setup touch ripple effects
   */
  setupTouchRipples() {
    document.addEventListener('touchstart', (e) => {
      const target = e.target.closest('.btn, .clickable, .ripple-effect');
      if (!target) return;
      
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      const x = e.touches[0].clientX - rect.left - size / 2;
      const y = e.touches[0].clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
      `;
      
      // Ensure target has relative positioning
      if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
      }
      
      target.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        if (ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 600);
    }, this.passiveListeners);
    
    // Add ripple animation CSS
    this.addRippleStyles();
  }

  /**
   * Add ripple animation styles
   */
  addRippleStyles() {
    if (document.getElementById('ripple-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'ripple-styles';
    style.textContent = `
      @keyframes ripple {
        0% {
          transform: scale(0);
          opacity: 0.7;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
      
      .touch-active {
        transform: scale(0.98) !important;
        transition: transform 0.1s ease !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup performance optimizations
   */
  setupPerformanceOptimizations() {
    // Detect performance mode
    this.detectPerformanceMode();
    
    // Setup lazy loading
    this.setupLazyLoading();
    
    // Setup scroll optimization
    this.setupScrollOptimization();
    
    // Setup animation optimization
    this.setupAnimationOptimization();
    
    // Monitor performance
    this.startPerformanceMonitoring();
  }

  /**
   * Detect optimal performance mode
   */
  detectPerformanceMode() {
    // Check for battery API
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        if (battery.level < 0.2 || battery.chargingTime === Infinity) {
          this.performanceMode = 'battery';
          this.eventBus.emit('mobile:performanceModeChanged', { mode: 'battery' });
        }
      });
    }
    
    // Check device capabilities
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;
    const deviceMemory = navigator.deviceMemory || 4;
    
    if (hardwareConcurrency < 4 || deviceMemory < 4) {
      this.performanceMode = 'performance';
      this.eventBus.emit('mobile:performanceModeChanged', { mode: 'performance' });
    }
  }

  /**
   * Setup lazy loading
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            this.loadLazyContent(element);
            lazyObserver.unobserve(element);
          }
        });
      }, {
        rootMargin: '50px'
      });
      
      // Observe lazy elements
      document.querySelectorAll('.lazy-load').forEach(el => {
        lazyObserver.observe(el);
      });
      
      // Store observer for later use
      this.lazyObserver = lazyObserver;
    }
  }

  /**
   * Setup scroll optimization
   */
  setupScrollOptimization() {
    let ticking = false;
    
    const optimizedScroll = () => {
      const scrollTop = window.pageYOffset;
      const velocity = Math.abs(scrollTop - this.lastScrollTop);
      
      this.scrollVelocity = velocity;
      this.lastScrollTop = scrollTop;
      
      // Optimize based on scroll speed
      if (velocity > 10 && this.performanceMode !== 'battery') {
        document.body.classList.add('fast-scrolling');
      } else {
        document.body.classList.remove('fast-scrolling');
      }
      
      this.eventBus.emit('mobile:scroll', {
        scrollTop,
        velocity,
        direction: velocity > 0 ? (scrollTop > this.lastScrollTop ? 'down' : 'up') : 'none'
      });
      
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(optimizedScroll);
        ticking = true;
      }
    }, this.passiveListeners);
  }

  /**
   * Setup orientation handling
   */
  setupOrientationHandling() {
    const handleOrientationChange = () => {
      const newOrientation = this.getOrientation();
      if (newOrientation !== this.currentOrientation) {
        this.currentOrientation = newOrientation;
        
        // Delay to allow for animation completion
        setTimeout(() => {
          this.eventBus.emit('mobile:orientationChanged', {
            orientation: newOrientation,
            width: window.innerWidth,
            height: window.innerHeight
          });
          
          this.applyOrientationOptimizations(newOrientation);
        }, 300);
      }
    };
    
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
  }

  /**
   * Setup virtual keyboard handling
   */
  setupVirtualKeyboard() {
    if (!window.visualViewport) return;
    
    const viewport = window.visualViewport;
    
    viewport.addEventListener('resize', () => {
      const heightDiff = window.innerHeight - viewport.height;
      const wasKeyboardVisible = this.keyboardVisible;
      this.keyboardVisible = heightDiff > 150; // Threshold for keyboard detection
      
      if (this.keyboardVisible !== wasKeyboardVisible) {
        document.body.classList.toggle('keyboard-visible', this.keyboardVisible);
        
        this.eventBus.emit('mobile:keyboardToggle', {
          visible: this.keyboardVisible,
          height: heightDiff
        });
        
        this.handleKeyboardVisibility(this.keyboardVisible, heightDiff);
      }
    });
  }

  /**
   * Handle keyboard visibility changes
   */
  handleKeyboardVisibility(visible, height) {
    if (visible) {
      // Scroll focused input into view
      const focusedInput = document.activeElement;
      if (focusedInput && (focusedInput.tagName === 'INPUT' || focusedInput.tagName === 'TEXTAREA')) {
        setTimeout(() => {
          focusedInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
      
      // Adjust bottom navigation
      const navButtons = document.querySelector('.nav-buttons');
      if (navButtons) {
        navButtons.style.transform = `translateY(-${height}px)`;
      }
    } else {
      // Reset navigation position
      const navButtons = document.querySelector('.nav-buttons');
      if (navButtons) {
        navButtons.style.transform = '';
      }
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // UI events
    this.eventBus.on('ui:showBottomSheet', this.showBottomSheet.bind(this));
    this.eventBus.on('ui:hideBottomSheet', this.dismissBottomSheet.bind(this));
    this.eventBus.on('ui:toggleSection', this.toggleCollapsibleSection.bind(this));
    
    // Performance events
    this.eventBus.on('mobile:optimizePerformance', this.optimizePerformance.bind(this));
    this.eventBus.on('mobile:enableBatteryMode', this.enableBatteryMode.bind(this));
    
    // Screen events
    this.eventBus.on('screen:change', this.handleScreenChange.bind(this));
  }

  /**
   * Apply mobile optimizations
   */
  applyMobileOptimizations() {
    const body = document.body;
    const app = document.getElementById('app');
    
    // Add mobile classes
    body.classList.add('mobile-optimized');
    if (this.isMobile) body.classList.add('is-mobile');
    if (this.isTablet) body.classList.add('is-tablet');
    if (this.isTouchDevice) body.classList.add('is-touch');
    if (this.isIOS) body.classList.add('is-ios');
    if (this.isAndroid) body.classList.add('is-android');
    
    // Apply performance optimizations
    if (this.performanceMode === 'battery') {
      body.classList.add('battery-mode');
    } else if (this.performanceMode === 'performance') {
      body.classList.add('performance-mode');
    }
    
    // Setup collapsible sections on mobile
    if (this.isMobile) {
      this.setupCollapsibleSections();
    }
  }

  /**
   * Setup collapsible sections for mobile
   */
  setupCollapsibleSections() {
    const sections = document.querySelectorAll('.section-header');
    sections.forEach(header => {
      if (!header.dataset.mobileSetup) {
        header.addEventListener('click', () => {
          this.toggleCollapsibleSection(header);
        });
        header.dataset.mobileSetup = 'true';
      }
    });
  }

  /**
   * Toggle collapsible section
   */
  toggleCollapsibleSection(header) {
    const content = header.nextElementSibling;
    if (!content || !content.classList.contains('section-content')) return;
    
    const isCollapsed = header.classList.contains('collapsed');
    const sectionId = header.dataset.sectionId || header.textContent.trim();
    
    if (isCollapsed) {
      header.classList.remove('collapsed');
      content.classList.remove('collapsed');
      this.collapsedSections.delete(sectionId);
    } else {
      header.classList.add('collapsed');
      content.classList.add('collapsed');
      this.collapsedSections.add(sectionId);
    }
    
    this.triggerHapticFeedback('light');
    this.saveMobilePreferences();
    
    this.eventBus.emit('mobile:sectionToggle', {
      sectionId,
      collapsed: !isCollapsed
    });
  }

  /**
   * Show bottom sheet modal
   */
  showBottomSheet(data) {
    const { content, title, actions } = data;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay bottom-sheet-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal bottom-sheet';
    
    modal.innerHTML = `
      ${title ? `<div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close">&times;</button>
      </div>` : ''}
      <div class="modal-body">${content}</div>
      ${actions ? `<div class="modal-footer">${actions}</div>` : ''}
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Setup close functionality
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismissBottomSheet());
    }
    
    // Setup swipe to dismiss
    let startY = 0;
    modal.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, this.passiveListeners);
    
    modal.addEventListener('touchmove', (e) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 0) {
        modal.style.transform = `translateY(${deltaY}px)`;
      }
    }, this.nonPassiveListeners);
    
    modal.addEventListener('touchend', (e) => {
      const currentY = e.changedTouches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 100) {
        this.dismissBottomSheet();
      } else {
        modal.style.transform = '';
      }
    }, this.passiveListeners);
    
    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });
    
    this.bottomSheetStack.push(overlay);
    this.triggerHapticFeedback('medium');
    
    return overlay;
  }

  /**
   * Dismiss bottom sheet modal
   */
  dismissBottomSheet() {
    if (this.bottomSheetStack.length === 0) return;
    
    const overlay = this.bottomSheetStack.pop();
    overlay.classList.remove('active');
    
    setTimeout(() => {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
    }, 300);
    
    this.triggerHapticFeedback('light');
  }

  /**
   * Trigger haptic feedback
   */
  triggerHapticFeedback(type = 'light') {
    if (!this.hapticSupported || !this.hapticEnabled) return;
    
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30
    };
    
    if (navigator.vibrate) {
      navigator.vibrate(patterns[type] || 10);
    }
  }

  /**
   * Detect mobile device
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Detect tablet device
   */
  detectTablet() {
    return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
  }

  /**
   * Detect touch support
   */
  detectTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Detect iOS
   */
  detectIOS() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  }

  /**
   * Detect Android
   */
  detectAndroid() {
    return /Android/.test(navigator.userAgent);
  }

  /**
   * Get device orientation
   */
  getOrientation() {
    if (screen.orientation) {
      return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
    }
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Check if element is interactive
   */
  isInteractiveElement(element) {
    const interactive = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'];
    return interactive.includes(element.tagName) || 
           element.hasAttribute('onclick') || 
           element.classList.contains('btn') ||
           element.classList.contains('clickable') ||
           element.getAttribute('role') === 'button';
  }

  /**
   * Get device information
   */
  getDeviceInfo() {
    return {
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isTouch: this.isTouchDevice,
      isIOS: this.isIOS,
      isAndroid: this.isAndroid,
      orientation: this.currentOrientation,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      performance: this.performanceMode,
      hapticSupported: this.hapticSupported
    };
  }

  /**
   * Load mobile preferences
   */
  loadMobilePreferences() {
    try {
      const prefs = JSON.parse(localStorage.getItem('battletech_mobile_prefs') || '{}');
      
      if (prefs.collapsedSections) {
        this.collapsedSections = new Set(prefs.collapsedSections);
      }
      
      if (prefs.hapticEnabled !== undefined) {
        this.hapticEnabled = prefs.hapticEnabled;
      }
      
      if (prefs.performanceMode) {
        this.performanceMode = prefs.performanceMode;
      }
      
    } catch (error) {
      this.logger.error('Failed to load mobile preferences:', error);
    }
  }

  /**
   * Save mobile preferences
   */
  saveMobilePreferences() {
    try {
      const prefs = {
        collapsedSections: Array.from(this.collapsedSections),
        hapticEnabled: this.hapticEnabled,
        performanceMode: this.performanceMode
      };
      
      localStorage.setItem('battletech_mobile_prefs', JSON.stringify(prefs));
      
    } catch (error) {
      this.logger.error('Failed to save mobile preferences:', error);
    }
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    const monitor = () => {
      const now = performance.now();
      const deltaTime = now - this.lastFrameTime;
      
      this.frameTime = deltaTime;
      this.frameCount++;
      this.lastFrameTime = now;
      
      // Check for performance issues
      if (deltaTime > 33.33) { // Below 30 FPS
        this.eventBus.emit('mobile:performanceIssue', {
          frameTime: deltaTime,
          recommendation: 'Consider enabling performance mode'
        });
      }
      
      requestAnimationFrame(monitor);
    };
    
    requestAnimationFrame(monitor);
  }

  /**
   * Get mobile optimization status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      deviceInfo: this.getDeviceInfo(),
      performanceMode: this.performanceMode,
      hapticEnabled: this.hapticEnabled,
      keyboardVisible: this.keyboardVisible,
      collapsedSections: Array.from(this.collapsedSections),
      bottomSheetCount: this.bottomSheetStack.length,
      frameTime: this.frameTime,
      frameCount: this.frameCount
    };
  }

  /**
   * Shutdown mobile optimizer
   */
  async shutdown() {
    try {
      this.logger.info('Shutting down MobileOptimizer...');
      
      // Save preferences
      this.saveMobilePreferences();
      
      // Clean up observers
      if (this.lazyObserver) {
        this.lazyObserver.disconnect();
      }
      
      // Dismiss any open bottom sheets
      while (this.bottomSheetStack.length > 0) {
        this.dismissBottomSheet();
      }
      
      // Remove event listeners
      this.touchListeners.forEach((listener, element) => {
        element.removeEventListener('touchstart', listener);
      });
      this.touchListeners.clear();
      
      this.isInitialized = false;
      this.logger.info('MobileOptimizer shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during MobileOptimizer shutdown:', error);
    }
  }
}