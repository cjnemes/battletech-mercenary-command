/**
 * Tutorial System - Comprehensive Tutorial and Onboarding Framework
 * Manages progressive tutorial sequences with intelligent highlighting and user guidance
 */
import { Logger } from '../../utils/Logger.js';

export class TutorialSystem {
  constructor(eventBus, gameState) {
    this.logger = new Logger('TutorialSystem');
    this.eventBus = eventBus;
    this.gameState = gameState;
    
    // Tutorial state management
    this.isActive = false;
    this.currentTutorial = null;
    this.currentStep = 0;
    this.tutorialProgress = new Map();
    this.isInitialized = false;
    
    // UI elements
    this.overlayElement = null;
    this.modalElement = null;
    this.highlightElement = null;
    this.tooltipElement = null;
    
    // Tutorial configuration
    this.tutorials = new Map();
    this.settings = {
      enableTutorials: true,
      skipCompleted: true,
      showHints: true,
      animationSpeed: 'normal',
      autoAdvance: false
    };
    
    // Step timing and animations
    this.animationDuration = 300;
    this.highlightPulseSpeed = 2000;
    this.autoAdvanceDelay = 5000;
    
    // Tutorial event tracking
    this.eventHistory = [];
    this.maxEventHistory = 50;
    
    // Smart tutorial adaptation
    this.userActions = new Map();
    this.adaptiveHints = true;
  }

  /**
   * Initialize the tutorial system
   */
  async initialize() {
    try {
      this.logger.info('Initializing TutorialSystem...');
      
      // Load tutorial settings from game state
      await this.loadTutorialSettings();
      
      // Create tutorial UI elements
      this.createTutorialUI();
      
      // Load tutorial progress
      await this.loadTutorialProgress();
      
      // Register available tutorials
      this.registerTutorials();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize CSS styles
      this.injectTutorialStyles();
      
      this.isInitialized = true;
      this.logger.info('TutorialSystem initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize TutorialSystem:', error);
      throw error;
    }
  }

  /**
   * Load tutorial settings from game state
   */
  async loadTutorialSettings() {
    const savedSettings = this.gameState.get('settings.tutorials');
    if (savedSettings) {
      this.settings = { ...this.settings, ...savedSettings };
    }
  }

  /**
   * Create tutorial UI elements
   */
  createTutorialUI() {
    // Create main overlay
    this.overlayElement = document.createElement('div');
    this.overlayElement.id = 'tutorial-overlay';
    this.overlayElement.className = 'tutorial-overlay hidden';
    
    // Create tutorial modal
    this.modalElement = document.createElement('div');
    this.modalElement.id = 'tutorial-modal';
    this.modalElement.className = 'tutorial-modal';
    
    // Create highlight element
    this.highlightElement = document.createElement('div');
    this.highlightElement.id = 'tutorial-highlight';
    this.highlightElement.className = 'tutorial-highlight hidden';
    
    // Create tooltip element
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.id = 'tutorial-tooltip';
    this.tooltipElement.className = 'tutorial-tooltip hidden';
    
    // Assemble the structure
    this.overlayElement.appendChild(this.modalElement);
    document.body.appendChild(this.overlayElement);
    document.body.appendChild(this.highlightElement);
    document.body.appendChild(this.tooltipElement);
    
    this.logger.debug('Tutorial UI elements created');
  }

  /**
   * Load tutorial progress from persistence
   */
  async loadTutorialProgress() {
    const progress = this.gameState.get('tutorialProgress');
    if (progress) {
      this.tutorialProgress = new Map(Object.entries(progress));
    }
    
    // Check if first-time user
    const isFirstTime = !this.gameState.get('hasPlayedBefore');
    if (isFirstTime && this.settings.enableTutorials) {
      // Mark for automatic tutorial start
      this.shouldStartMainTutorial = true;
    }
  }

  /**
   * Register available tutorials
   */
  registerTutorials() {
    // Import tutorial data dynamically
    import('./TutorialData.js').then(({ TutorialData }) => {
      const tutorialData = new TutorialData();
      
      // Register main onboarding tutorial
      this.registerTutorial('main-onboarding', tutorialData.getMainTutorial());
      
      // Register feature-specific tutorials
      this.registerTutorial('pilot-management', tutorialData.getPilotTutorial());
      this.registerTutorial('mech-customization', tutorialData.getMechTutorial());
      this.registerTutorial('contract-selection', tutorialData.getContractTutorial());
      this.registerTutorial('combat-basics', tutorialData.getCombatTutorial());
      
      this.logger.info(`Registered ${this.tutorials.size} tutorials`);
      
      // Start main tutorial if needed
      if (this.shouldStartMainTutorial) {
        setTimeout(() => this.startTutorial('main-onboarding'), 1000);
      }
    });
  }

  /**
   * Register a tutorial
   */
  registerTutorial(id, tutorialConfig) {
    if (!tutorialConfig || !tutorialConfig.steps || tutorialConfig.steps.length === 0) {
      this.logger.warn(`Invalid tutorial configuration for ${id}`);
      return false;
    }

    const tutorial = {
      id,
      title: tutorialConfig.title || id,
      description: tutorialConfig.description || '',
      category: tutorialConfig.category || 'general',
      priority: tutorialConfig.priority || 0,
      prerequisites: tutorialConfig.prerequisites || [],
      steps: tutorialConfig.steps,
      settings: {
        skippable: tutorialConfig.skippable !== false,
        repeatable: tutorialConfig.repeatable !== false,
        autoStart: tutorialConfig.autoStart || false,
        requiredScreen: tutorialConfig.requiredScreen || null
      }
    };

    this.tutorials.set(id, tutorial);
    this.logger.debug(`Tutorial registered: ${id}`);
    return true;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Tutorial control events
    this.eventBus.on('tutorial:start', this.startTutorial.bind(this));
    this.eventBus.on('tutorial:stop', this.stopTutorial.bind(this));
    this.eventBus.on('tutorial:next', this.nextStep.bind(this));
    this.eventBus.on('tutorial:previous', this.previousStep.bind(this));
    this.eventBus.on('tutorial:skip', this.skipTutorial.bind(this));
    this.eventBus.on('tutorial:replay', this.replayTutorial.bind(this));
    
    // Screen change events
    this.eventBus.on('screen:changed', this.handleScreenChange.bind(this));
    
    // User interaction tracking
    this.eventBus.on('ui:click', this.trackUserAction.bind(this));
    this.eventBus.on('ui:hover', this.trackUserAction.bind(this));
    
    // Game state events
    this.eventBus.on('gameState:loaded', this.handleGameStateLoaded.bind(this));
    
    // Settings updates
    this.eventBus.on('settings:tutorialsChanged', this.updateSettings.bind(this));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    
    this.logger.debug('Tutorial event listeners setup complete');
  }

  /**
   * Start a tutorial
   */
  async startTutorial(tutorialId, options = {}) {
    try {
      if (!this.settings.enableTutorials && !options.force) {
        this.logger.info('Tutorials disabled, ignoring start request');
        return false;
      }

      const tutorial = this.tutorials.get(tutorialId);
      if (!tutorial) {
        this.logger.error(`Tutorial not found: ${tutorialId}`);
        return false;
      }

      // Check if already completed and should be skipped
      if (this.isTutorialCompleted(tutorialId) && this.settings.skipCompleted && !options.force) {
        this.logger.info(`Tutorial ${tutorialId} already completed, skipping`);
        return false;
      }

      // Check prerequisites
      if (!this.checkPrerequisites(tutorial)) {
        this.logger.warn(`Prerequisites not met for tutorial: ${tutorialId}`);
        return false;
      }

      // Check screen requirements
      if (tutorial.settings.requiredScreen && 
          this.gameState.get('currentScreen') !== tutorial.settings.requiredScreen) {
        
        // Navigate to required screen first
        this.logger.info(`Navigating to required screen: ${tutorial.settings.requiredScreen}`);
        this.eventBus.emit('screen:show', tutorial.settings.requiredScreen);
        
        // Wait for screen change, then start tutorial
        this.eventBus.once('screen:changed', () => {
          setTimeout(() => this.startTutorial(tutorialId, options), 500);
        });
        return true;
      }

      // Stop any current tutorial
      if (this.isActive) {
        await this.stopTutorial();
      }

      // Initialize tutorial state
      this.currentTutorial = tutorial;
      this.currentStep = options.startStep || 0;
      this.isActive = true;

      // Update progress
      this.updateTutorialProgress(tutorialId, 'started');

      // Show tutorial UI
      await this.showTutorialStep(this.currentStep);

      // Emit tutorial started event
      this.eventBus.emit('tutorial:started', { 
        tutorialId, 
        tutorial: this.currentTutorial 
      });

      this.logger.info(`Tutorial started: ${tutorialId}`);
      return true;

    } catch (error) {
      this.logger.error('Failed to start tutorial:', error);
      return false;
    }
  }

  /**
   * Stop current tutorial
   */
  async stopTutorial(completed = false) {
    if (!this.isActive || !this.currentTutorial) {
      return;
    }

    try {
      // Update progress
      if (completed) {
        this.updateTutorialProgress(this.currentTutorial.id, 'completed');
      } else {
        this.updateTutorialProgress(this.currentTutorial.id, 'stopped', this.currentStep);
      }

      // Hide tutorial UI
      await this.hideTutorialUI();

      // Clear tutorial state
      const tutorialId = this.currentTutorial.id;
      this.currentTutorial = null;
      this.currentStep = 0;
      this.isActive = false;

      // Emit tutorial stopped event
      this.eventBus.emit('tutorial:stopped', { 
        tutorialId, 
        completed 
      });

      this.logger.info(`Tutorial stopped: ${tutorialId} (completed: ${completed})`);

    } catch (error) {
      this.logger.error('Failed to stop tutorial:', error);
    }
  }

  /**
   * Show tutorial step
   */
  async showTutorialStep(stepIndex) {
    if (!this.currentTutorial || stepIndex >= this.currentTutorial.steps.length) {
      return;
    }

    const step = this.currentTutorial.steps[stepIndex];
    this.currentStep = stepIndex;

    // Update modal content
    this.updateTutorialModal(step);

    // Handle highlighting
    await this.handleStepHighlighting(step);

    // Show tutorial UI
    await this.showTutorialUI();

    // Handle step-specific actions
    await this.executeStepActions(step);

    // Emit step shown event
    this.eventBus.emit('tutorial:stepShown', {
      tutorialId: this.currentTutorial.id,
      step: stepIndex,
      stepData: step
    });

    this.logger.debug(`Tutorial step shown: ${stepIndex} of ${this.currentTutorial.id}`);
  }

  /**
   * Update tutorial modal content
   */
  updateTutorialModal(step) {
    const modalContent = `
      <div class="tutorial-modal-header">
        <h2 class="tutorial-title">${this.currentTutorial.title}</h2>
        <div class="tutorial-progress">
          <span class="current-step">${this.currentStep + 1}</span>
          <span class="step-separator">/</span>
          <span class="total-steps">${this.currentTutorial.steps.length}</span>
        </div>
        ${this.currentTutorial.settings.skippable ? '<button class="tutorial-close" onclick="TutorialSystem.instance.skipTutorial()">×</button>' : ''}
      </div>
      
      <div class="tutorial-modal-body">
        <h3 class="tutorial-step-title">${step.title}</h3>
        <div class="tutorial-step-content">
          ${step.content}
        </div>
        ${step.tip ? `<div class="tutorial-tip"><strong>Tip:</strong> ${step.tip}</div>` : ''}
      </div>
      
      <div class="tutorial-modal-footer">
        <div class="tutorial-navigation">
          ${this.currentStep > 0 ? '<button class="btn btn-secondary tutorial-btn-previous">Previous</button>' : ''}
          
          <div class="tutorial-actions">
            ${step.interactive ? this.renderStepActions(step) : ''}
          </div>
          
          ${this.currentStep < this.currentTutorial.steps.length - 1 ? 
            '<button class="btn btn-primary tutorial-btn-next">Next</button>' :
            '<button class="btn btn-success tutorial-btn-finish">Finish Tutorial</button>'
          }
        </div>
        
        ${this.currentTutorial.settings.skippable ? '<button class="btn btn-link tutorial-btn-skip">Skip Tutorial</button>' : ''}
      </div>
    `;

    this.modalElement.innerHTML = modalContent;

    // Bind event handlers
    this.bindModalEventHandlers();
  }

  /**
   * Render step-specific actions
   */
  renderStepActions(step) {
    let actionsHtml = '';

    if (step.actions) {
      for (const action of step.actions) {
        switch (action.type) {
          case 'click':
            actionsHtml += `<div class="tutorial-action-instruction">Click on <strong>${action.target}</strong> to continue</div>`;
            break;
          case 'navigate':
            actionsHtml += `<div class="tutorial-action-instruction">Navigate to <strong>${action.target}</strong></div>`;
            break;
          case 'input':
            actionsHtml += `<div class="tutorial-action-instruction">Enter: <strong>${action.value}</strong></div>`;
            break;
        }
      }
    }

    return actionsHtml;
  }

  /**
   * Bind modal event handlers
   */
  bindModalEventHandlers() {
    // Navigation buttons
    const prevBtn = this.modalElement.querySelector('.tutorial-btn-previous');
    const nextBtn = this.modalElement.querySelector('.tutorial-btn-next');
    const finishBtn = this.modalElement.querySelector('.tutorial-btn-finish');
    const skipBtn = this.modalElement.querySelector('.tutorial-btn-skip');

    if (prevBtn) prevBtn.onclick = () => this.previousStep();
    if (nextBtn) nextBtn.onclick = () => this.nextStep();
    if (finishBtn) finishBtn.onclick = () => this.stopTutorial(true);
    if (skipBtn) skipBtn.onclick = () => this.skipTutorial();
  }

  /**
   * Handle step highlighting
   */
  async handleStepHighlighting(step) {
    if (!step.highlight) {
      this.hideHighlight();
      return;
    }

    const targetElement = this.findTargetElement(step.highlight.target);
    if (!targetElement) {
      this.logger.warn(`Highlight target not found: ${step.highlight.target}`);
      this.hideHighlight();
      return;
    }

    // Position and show highlight
    await this.showHighlight(targetElement, step.highlight);
  }

  /**
   * Find target element for highlighting
   */
  findTargetElement(target) {
    if (typeof target === 'string') {
      return document.querySelector(target);
    } else if (target instanceof Element) {
      return target;
    }
    return null;
  }

  /**
   * Show highlight on target element
   */
  async showHighlight(targetElement, highlightConfig) {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Configure highlight element
    this.highlightElement.className = `tutorial-highlight ${highlightConfig.style || 'pulse'}`;
    this.highlightElement.style.top = `${rect.top + scrollTop - 8}px`;
    this.highlightElement.style.left = `${rect.left + scrollLeft - 8}px`;
    this.highlightElement.style.width = `${rect.width + 16}px`;
    this.highlightElement.style.height = `${rect.height + 16}px`;

    // Show highlight with animation
    this.highlightElement.classList.remove('hidden');
    
    // Scroll target into view if needed
    if (highlightConfig.scrollIntoView !== false) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }

  /**
   * Hide highlight
   */
  hideHighlight() {
    this.highlightElement.classList.add('hidden');
  }

  /**
   * Execute step-specific actions
   */
  async executeStepActions(step) {
    if (!step.actions) return;

    for (const action of step.actions) {
      try {
        await this.executeAction(action);
      } catch (error) {
        this.logger.error('Failed to execute step action:', error);
      }
    }
  }

  /**
   * Execute individual action
   */
  async executeAction(action) {
    switch (action.type) {
      case 'wait':
        await this.delay(action.duration || 1000);
        break;
      
      case 'emit':
        this.eventBus.emit(action.event, action.data);
        break;
      
      case 'highlight':
        const element = this.findTargetElement(action.target);
        if (element) {
          await this.showHighlight(element, action.config || {});
        }
        break;
      
      case 'tooltip':
        this.showTooltip(action.target, action.content, action.position);
        break;

      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Navigate to next step
   */
  async nextStep() {
    if (!this.currentTutorial || this.currentStep >= this.currentTutorial.steps.length - 1) {
      await this.stopTutorial(true);
      return;
    }

    await this.showTutorialStep(this.currentStep + 1);
  }

  /**
   * Navigate to previous step
   */
  async previousStep() {
    if (!this.currentTutorial || this.currentStep <= 0) {
      return;
    }

    await this.showTutorialStep(this.currentStep - 1);
  }

  /**
   * Skip current tutorial
   */
  async skipTutorial() {
    if (!this.currentTutorial) return;

    // Show confirmation if tutorial is not easily replayable
    if (!this.currentTutorial.settings.repeatable) {
      const confirmed = await this.showSkipConfirmation();
      if (!confirmed) return;
    }

    this.updateTutorialProgress(this.currentTutorial.id, 'skipped', this.currentStep);
    await this.stopTutorial();
  }

  /**
   * Show skip confirmation
   */
  async showSkipConfirmation() {
    return new Promise((resolve) => {
      // Use the existing notification system for confirmation
      window.NotificationSystem.instance.show(
        'Are you sure you want to skip this tutorial? You can replay it later from the settings menu.',
        {
          title: 'Skip Tutorial',
          type: 'warning',
          autoDismiss: false,
          actions: [
            {
              text: 'Cancel',
              onClick: `TutorialSystem.instance.resolveSkipConfirmation(false, '${Date.now()}')`
            },
            {
              text: 'Skip',
              primary: true,
              onClick: `TutorialSystem.instance.resolveSkipConfirmation(true, '${Date.now()}')`
            }
          ]
        }
      );

      // Store resolver
      this.skipResolver = resolve;
    });
  }

  /**
   * Resolve skip confirmation
   */
  resolveSkipConfirmation(result) {
    if (this.skipResolver) {
      this.skipResolver(result);
      this.skipResolver = null;
    }
  }

  /**
   * Show/Hide tutorial UI
   */
  async showTutorialUI() {
    this.overlayElement.classList.remove('hidden');
    await this.delay(50); // Small delay for smooth animation
    this.overlayElement.classList.add('active');
  }

  async hideTutorialUI() {
    this.overlayElement.classList.remove('active');
    await this.delay(this.animationDuration);
    this.overlayElement.classList.add('hidden');
    this.hideHighlight();
    this.hideTooltip();
  }

  /**
   * Show contextual tooltip
   */
  showTooltip(target, content, position = 'top') {
    const targetElement = this.findTargetElement(target);
    if (!targetElement) return;

    this.tooltipElement.innerHTML = content;
    this.positionTooltip(targetElement, position);
    this.tooltipElement.classList.remove('hidden');
  }

  /**
   * Position tooltip relative to target
   */
  positionTooltip(targetElement, position) {
    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top, left;

    switch (position) {
      case 'top':
        top = rect.top + scrollTop - this.tooltipElement.offsetHeight - 10;
        left = rect.left + scrollLeft + (rect.width / 2) - (this.tooltipElement.offsetWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + scrollTop + 10;
        left = rect.left + scrollLeft + (rect.width / 2) - (this.tooltipElement.offsetWidth / 2);
        break;
      case 'left':
        top = rect.top + scrollTop + (rect.height / 2) - (this.tooltipElement.offsetHeight / 2);
        left = rect.left + scrollLeft - this.tooltipElement.offsetWidth - 10;
        break;
      case 'right':
        top = rect.top + scrollTop + (rect.height / 2) - (this.tooltipElement.offsetHeight / 2);
        left = rect.right + scrollLeft + 10;
        break;
    }

    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }

  /**
   * Hide tooltip
   */
  hideTooltip() {
    this.tooltipElement.classList.add('hidden');
  }

  /**
   * Check tutorial prerequisites
   */
  checkPrerequisites(tutorial) {
    if (!tutorial.prerequisites || tutorial.prerequisites.length === 0) {
      return true;
    }

    return tutorial.prerequisites.every(prereq => 
      this.isTutorialCompleted(prereq)
    );
  }

  /**
   * Check if tutorial is completed
   */
  isTutorialCompleted(tutorialId) {
    const progress = this.tutorialProgress.get(tutorialId);
    return progress && progress.status === 'completed';
  }

  /**
   * Update tutorial progress
   */
  updateTutorialProgress(tutorialId, status, step = null) {
    const progress = {
      status,
      timestamp: Date.now(),
      step: step || 0,
      attempts: (this.tutorialProgress.get(tutorialId)?.attempts || 0) + 1
    };

    this.tutorialProgress.set(tutorialId, progress);

    // Save to game state
    const progressObj = Object.fromEntries(this.tutorialProgress);
    this.gameState.set('tutorialProgress', progressObj);

    this.logger.debug(`Tutorial progress updated: ${tutorialId} - ${status}`);
  }

  /**
   * Handle screen changes
   */
  handleScreenChange({ from, to }) {
    // Check for screen-specific tutorial triggers
    this.checkAutoStartTutorials(to);

    // Adapt current tutorial if needed
    if (this.isActive && this.currentTutorial) {
      this.adaptTutorialToScreen(to);
    }
  }

  /**
   * Check for auto-start tutorials
   */
  checkAutoStartTutorials(screenId) {
    if (!this.settings.enableTutorials) return;

    for (const [tutorialId, tutorial] of this.tutorials) {
      if (tutorial.settings.autoStart && 
          tutorial.settings.requiredScreen === screenId &&
          !this.isTutorialCompleted(tutorialId)) {
        
        // Small delay to let screen settle
        setTimeout(() => this.startTutorial(tutorialId), 1000);
        break; // Only start one auto tutorial at a time
      }
    }
  }

  /**
   * Adapt tutorial to screen change
   */
  adaptTutorialToScreen(screenId) {
    // If tutorial requires a different screen, pause and show guidance
    if (this.currentTutorial.settings.requiredScreen && 
        this.currentTutorial.settings.requiredScreen !== screenId) {
      
      this.showScreenMismatchGuidance();
    }
  }

  /**
   * Show guidance for screen mismatch
   */
  showScreenMismatchGuidance() {
    this.showTooltip(
      'body', 
      `This tutorial is designed for the ${this.currentTutorial.settings.requiredScreen} screen. Please navigate back to continue.`,
      'center'
    );
  }

  /**
   * Track user actions for adaptive hints
   */
  trackUserAction(actionData) {
    if (!this.adaptiveHints) return;

    const key = `${actionData.type}_${actionData.target}`;
    const count = this.userActions.get(key) || 0;
    this.userActions.set(key, count + 1);

    // Add to event history
    this.eventHistory.push({
      ...actionData,
      timestamp: Date.now(),
      tutorialActive: this.isActive
    });

    // Maintain history size
    if (this.eventHistory.length > this.maxEventHistory) {
      this.eventHistory.shift();
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  handleKeyPress(event) {
    if (!this.isActive) return;

    switch (event.key) {
      case 'Escape':
        if (this.currentTutorial.settings.skippable) {
          this.skipTutorial();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.previousStep();
        break;
      case 'ArrowRight':
      case 'Enter':
        event.preventDefault();
        this.nextStep();
        break;
    }
  }

  /**
   * Replay tutorial
   */
  async replayTutorial(tutorialId) {
    await this.startTutorial(tutorialId, { force: true, startStep: 0 });
  }

  /**
   * Update tutorial settings
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.gameState.set('settings.tutorials', this.settings);
  }

  /**
   * Get tutorial status
   */
  getTutorialStatus(tutorialId) {
    return this.tutorialProgress.get(tutorialId) || { status: 'not_started' };
  }

  /**
   * Get all tutorial statuses
   */
  getAllTutorialStatuses() {
    const statuses = {};
    for (const [id, tutorial] of this.tutorials) {
      statuses[id] = {
        ...this.getTutorialStatus(id),
        tutorial: {
          title: tutorial.title,
          description: tutorial.description,
          category: tutorial.category
        }
      };
    }
    return statuses;
  }

  /**
   * Inject tutorial CSS styles
   */
  injectTutorialStyles() {
    if (document.getElementById('tutorial-system-styles')) return;

    const style = document.createElement('style');
    style.id = 'tutorial-system-styles';
    style.textContent = `
      /* Tutorial System Styles */
      .tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(3px);
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
      }

      .tutorial-overlay.active {
        opacity: 1;
      }

      .tutorial-overlay.hidden {
        display: none !important;
      }

      .tutorial-modal {
        background: var(--card-bg, #1e2640);
        border: 2px solid var(--border-accent, #4a90e2);
        border-radius: 12px;
        padding: 0;
        max-width: 500px;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
        transform: scale(0.9) translateY(20px);
        transition: transform 0.3s ease-in-out;
      }

      .tutorial-overlay.active .tutorial-modal {
        transform: scale(1) translateY(0);
      }

      .tutorial-modal-header {
        background: linear-gradient(135deg, var(--accent-bg, #2d3748), var(--accent-text, #4a90e2));
        padding: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color, #333);
      }

      .tutorial-title {
        color: white;
        margin: 0;
        font-size: 1.2em;
        font-weight: 700;
      }

      .tutorial-progress {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.9em;
        font-weight: 600;
      }

      .tutorial-close {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .tutorial-close:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .tutorial-modal-body {
        padding: 25px;
      }

      .tutorial-step-title {
        color: var(--highlight-text, #4a90e2);
        margin: 0 0 15px 0;
        font-size: 1.1em;
        font-weight: 600;
      }

      .tutorial-step-content {
        color: var(--primary-text, #ffffff);
        line-height: 1.6;
        margin-bottom: 15px;
      }

      .tutorial-tip {
        background: rgba(74, 144, 226, 0.1);
        border-left: 4px solid var(--accent-text, #4a90e2);
        padding: 12px 15px;
        margin: 15px 0;
        border-radius: 4px;
        color: var(--secondary-text, #b8c5d6);
        font-size: 0.9em;
      }

      .tutorial-modal-footer {
        background: var(--secondary-bg, #1a1f2e);
        padding: 20px 25px;
        border-top: 1px solid var(--border-color, #333);
      }

      .tutorial-navigation {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      .tutorial-actions {
        flex: 1;
        text-align: center;
      }

      .tutorial-action-instruction {
        color: var(--accent-text, #4a90e2);
        font-size: 0.9em;
        font-weight: 500;
      }

      .tutorial-btn-skip {
        background: none !important;
        border: none !important;
        color: var(--muted-text, #6b7280) !important;
        padding: 5px 10px !important;
        font-size: 0.85em !important;
        text-decoration: underline;
        cursor: pointer;
        margin-top: 10px;
        width: 100%;
        text-align: center;
      }

      .tutorial-btn-skip:hover {
        color: var(--secondary-text, #b8c5d6) !important;
      }

      /* Highlight System */
      .tutorial-highlight {
        position: absolute;
        border: 3px solid var(--accent-text, #4a90e2);
        border-radius: 8px;
        pointer-events: none;
        z-index: 10000;
        transition: all 0.3s ease-in-out;
      }

      .tutorial-highlight.hidden {
        display: none;
      }

      .tutorial-highlight.pulse {
        animation: tutorialPulse 2s infinite;
        box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7);
      }

      @keyframes tutorialPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7);
        }
        50% {
          box-shadow: 0 0 0 15px rgba(74, 144, 226, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
        }
      }

      .tutorial-highlight.glow {
        animation: tutorialGlow 1.5s ease-in-out infinite alternate;
      }

      @keyframes tutorialGlow {
        from {
          box-shadow: 0 0 5px var(--accent-text, #4a90e2);
        }
        to {
          box-shadow: 0 0 20px var(--accent-text, #4a90e2);
        }
      }

      /* Tooltip System */
      .tutorial-tooltip {
        position: absolute;
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-size: 14px;
        max-width: 250px;
        z-index: 10002;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: opacity 0.3s ease-in-out;
      }

      .tutorial-tooltip.hidden {
        display: none;
      }

      .tutorial-tooltip::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border: 6px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.9);
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .tutorial-modal {
          max-width: 90vw;
          margin: 20px;
        }

        .tutorial-modal-header {
          padding: 15px;
        }

        .tutorial-modal-body {
          padding: 20px;
        }

        .tutorial-modal-footer {
          padding: 15px 20px;
        }

        .tutorial-navigation {
          flex-direction: column;
          text-align: center;
        }

        .tutorial-navigation .btn {
          min-width: 120px;
        }

        .tutorial-tooltip {
          max-width: 200px;
          font-size: 13px;
        }
      }

      /* Accessibility */
      @media (prefers-reduced-motion: reduce) {
        .tutorial-overlay,
        .tutorial-modal,
        .tutorial-highlight {
          transition: none;
        }

        .tutorial-highlight.pulse,
        .tutorial-highlight.glow {
          animation: none;
        }
      }

      /* High contrast mode */
      @media (prefers-contrast: high) {
        .tutorial-overlay {
          background: rgba(0, 0, 0, 0.9);
        }

        .tutorial-modal {
          border-width: 3px;
        }

        .tutorial-highlight {
          border-width: 4px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Utility: delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get system status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      isActive: this.isActive,
      currentTutorial: this.currentTutorial?.id || null,
      currentStep: this.currentStep,
      totalTutorials: this.tutorials.size,
      completedTutorials: Array.from(this.tutorialProgress.values())
        .filter(p => p.status === 'completed').length,
      settings: this.settings
    };
  }

  /**
   * Shutdown tutorial system
   */
  async shutdown() {
    try {
      if (this.isActive) {
        await this.stopTutorial();
      }

      // Remove UI elements
      if (this.overlayElement && this.overlayElement.parentNode) {
        this.overlayElement.parentNode.removeChild(this.overlayElement);
      }
      if (this.highlightElement && this.highlightElement.parentNode) {
        this.highlightElement.parentNode.removeChild(this.highlightElement);
      }
      if (this.tooltipElement && this.tooltipElement.parentNode) {
        this.tooltipElement.parentNode.removeChild(this.tooltipElement);
      }

      // Remove styles
      const styleElement = document.getElementById('tutorial-system-styles');
      if (styleElement) {
        styleElement.remove();
      }

      // Clear references
      this.tutorials.clear();
      this.tutorialProgress.clear();
      this.userActions.clear();
      this.eventHistory.length = 0;

      this.isInitialized = false;
      this.logger.info('TutorialSystem shutdown complete');

    } catch (error) {
      this.logger.error('Error during TutorialSystem shutdown:', error);
    }
  }
}

// Create global instance for browser compatibility
if (typeof window !== 'undefined') {
  window.TutorialSystem = window.TutorialSystem || {};
  window.TutorialSystem.instance = null;
}