/**
 * Pilot System - Manages pilot creation, selection, and management
 * Handles all pilot-related game mechanics and UI interactions
 */
import { Logger } from '../../utils/Logger.js';

export class PilotSystem {
  constructor(eventBus, gameState) {
    this.logger = new Logger('PilotSystem');
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.isInitialized = false;
    this.selectedPilot = null;
  }

  /**
   * Initialize the pilot system
   */
  async initialize() {
    try {
      this.logger.info('Initializing PilotSystem...');
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize UI handlers
      this.setupUIHandlers();
      
      this.isInitialized = true;
      this.logger.info('PilotSystem initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize PilotSystem:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Pilot management events
    this.eventBus.on('pilot:select', this.selectPilot.bind(this));
    this.eventBus.on('pilot:hire', this.hirePilot.bind(this));
    this.eventBus.on('pilot:fire', this.firePilot.bind(this));
    this.eventBus.on('pilot:update', this.updatePilot.bind(this));
    
    // UI update events
    this.eventBus.on('gameState:changed', this.onGameStateChanged.bind(this));
    this.eventBus.on('screen:changed', this.onScreenChanged.bind(this));
    
    this.logger.debug('PilotSystem event listeners setup complete');
  }

  /**
   * Setup UI event handlers for direct DOM interaction compatibility
   */
  setupUIHandlers() {
    // Make pilot selection function globally available for onclick handlers
    window.selectPilot = (index) => {
      this.eventBus.emit('pilot:select', { index });
    };
    
    // Make hire pilot function globally available
    window.hirePilot = () => {
      this.eventBus.emit('pilot:hire');
    };
  }

  /**
   * Create default pilot roster for new companies
   */
  createDefaultPilots() {
    const defaultPilots = [
      { 
        name: 'Marcus "Reaper" Kane', 
        gunnery: 2, 
        piloting: 3, 
        experience: 'Elite', 
        salary: 25000,
        id: this.generatePilotId(),
        status: 'Active',
        mechAssignment: null,
        backstory: 'Veteran MechWarrior from the Federated Suns',
        specialties: ['Assault Mechs', 'Urban Combat']
      },
      { 
        name: 'Lisa "Razor" Williams', 
        gunnery: 3, 
        piloting: 4, 
        experience: 'Veteran', 
        salary: 18000,
        id: this.generatePilotId(),
        status: 'Active',
        mechAssignment: null,
        backstory: 'Former House Steiner academy graduate',
        specialties: ['Light Mechs', 'Reconnaissance']
      }
    ];
    
    return defaultPilots;
  }

  /**
   * Select a pilot by index
   */
  selectPilot(data) {
    const { index } = data;
    const pilots = this.gameState.get('pilots') || [];
    
    if (index >= 0 && index < pilots.length) {
      const pilot = pilots[index];
      this.selectedPilot = pilot;
      
      // Update game state
      this.gameState.set('selectedPilot', pilot.id, { silent: true });
      
      // Update pilot details display
      this.updatePilotDetails(pilot);
      
      this.eventBus.emit('pilot:selected', { pilot, index });
      this.logger.debug(`Pilot selected: ${pilot.name}`);
    } else {
      this.logger.warn(`Invalid pilot index: ${index}`);
    }
  }

  /**
   * Update pilot details display
   */
  updatePilotDetails(pilot) {
    const detailsElement = document.getElementById('pilot-details');
    if (detailsElement) {
      detailsElement.innerHTML = `
        <h3>${pilot.name}</h3>
        <div class="stat-line"><span>Experience:</span><span>${pilot.experience}</span></div>
        <div class="stat-line"><span>Gunnery:</span><span>${pilot.gunnery}</span></div>
        <div class="stat-line"><span>Piloting:</span><span>${pilot.piloting}</span></div>
        <div class="stat-line"><span>Salary:</span><span>${pilot.salary.toLocaleString()} C-Bills/month</span></div>
        <div class="stat-line"><span>Status:</span><span>${pilot.status}</span></div>
        ${pilot.mechAssignment ? `<div class="stat-line"><span>Assigned Mech:</span><span>${pilot.mechAssignment}</span></div>` : ''}
        ${pilot.specialties ? `<div class="stat-line"><span>Specialties:</span><span>${pilot.specialties.join(', ')}</span></div>` : ''}
      `;
    }
  }

  /**
   * Update pilot roster display
   */
  updatePilotRoster() {
    const pilots = this.gameState.get('pilots') || [];
    const pilotList = document.getElementById('pilot-list');
    
    if (pilotList) {
      pilotList.innerHTML = pilots.map((pilot, index) => 
        `<div class="pilot-entry" onclick="selectPilot(${index})">
          <div class="pilot-name">${pilot.name}</div>
          <div class="pilot-skills">Gunnery: ${pilot.gunnery}, Piloting: ${pilot.piloting}</div>
          <div class="pilot-traits">${pilot.experience} - ${pilot.salary.toLocaleString()} C-Bills/month</div>
        </div>`
      ).join('');
    }
  }

  /**
   * Hire a new pilot
   */
  hirePilot(data = {}) {
    // For now, show placeholder alert - this will be expanded later
    alert('Hire pilot not implemented - this will open pilot hiring interface');
    
    // Future implementation will include:
    // - Available pilot pool generation
    // - Hiring interface
    // - Contract negotiation
    // - Budget validation
    
    this.eventBus.emit('pilot:hireAttempted', data);
  }

  /**
   * Fire a pilot
   */
  firePilot(data) {
    const { pilotId } = data;
    const pilots = this.gameState.get('pilots') || [];
    const pilotIndex = pilots.findIndex(pilot => pilot.id === pilotId);
    
    if (pilotIndex !== -1) {
      const pilot = pilots[pilotIndex];
      
      // Remove pilot from roster
      this.gameState.removeFromArray('pilots', p => p.id === pilotId);
      
      // Update company expenses
      const currentSalaries = this.gameState.get('company.expenses.salaries') || 0;
      this.gameState.set('company.expenses.salaries', currentSalaries - pilot.salary);
      
      // Clear selection if this pilot was selected
      if (this.selectedPilot && this.selectedPilot.id === pilotId) {
        this.selectedPilot = null;
        this.gameState.set('selectedPilot', null);
      }
      
      this.eventBus.emit('pilot:fired', { pilot });
      this.logger.info(`Pilot fired: ${pilot.name}`);
    }
  }

  /**
   * Update pilot information
   */
  updatePilot(data) {
    const { pilotId, updates } = data;
    const pilots = this.gameState.get('pilots') || [];
    const pilotIndex = pilots.findIndex(pilot => pilot.id === pilotId);
    
    if (pilotIndex !== -1) {
      // Update pilot in game state
      this.gameState.updateArrayItem('pilots', p => p.id === pilotId, updates);
      
      // Update selected pilot if it's the same one
      if (this.selectedPilot && this.selectedPilot.id === pilotId) {
        this.selectedPilot = { ...this.selectedPilot, ...updates };
        this.updatePilotDetails(this.selectedPilot);
      }
      
      this.eventBus.emit('pilot:updated', { pilotId, updates });
    }
  }

  /**
   * Handle game state changes
   */
  onGameStateChanged(data) {
    const { path } = data;
    
    // Update display if pilots array changed
    if (path === 'pilots' || path.startsWith('pilots.')) {
      this.updatePilotRoster();
    }
  }

  /**
   * Handle screen changes
   */
  onScreenChanged(data) {
    const { to } = data;
    
    // Update pilot roster when entering company overview
    if (to === 'company-overview') {
      this.updatePilotRoster();
      
      // Clear pilot details if no pilot selected
      if (!this.selectedPilot) {
        const detailsElement = document.getElementById('pilot-details');
        if (detailsElement) {
          detailsElement.innerHTML = `
            <h3>Select a Pilot</h3>
            <p>Choose a pilot from the roster to view detailed information.</p>
          `;
        }
      }
    }
  }

  /**
   * Generate unique pilot ID
   */
  generatePilotId() {
    return `pilot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get pilot by ID
   */
  getPilotById(pilotId) {
    const pilots = this.gameState.get('pilots') || [];
    return pilots.find(pilot => pilot.id === pilotId);
  }

  /**
   * Get available pilots (not assigned to mechs)
   */
  getAvailablePilots() {
    const pilots = this.gameState.get('pilots') || [];
    return pilots.filter(pilot => !pilot.mechAssignment && pilot.status === 'Active');
  }

  /**
   * Assign pilot to mech
   */
  assignPilotToMech(pilotId, mechId) {
    this.updatePilot({
      pilotId,
      updates: { mechAssignment: mechId }
    });
    
    this.eventBus.emit('pilot:assigned', { pilotId, mechId });
  }

  /**
   * Unassign pilot from mech
   */
  unassignPilotFromMech(pilotId) {
    this.updatePilot({
      pilotId,
      updates: { mechAssignment: null }
    });
    
    this.eventBus.emit('pilot:unassigned', { pilotId });
  }

  /**
   * Calculate total pilot salaries
   */
  calculateTotalSalaries() {
    const pilots = this.gameState.get('pilots') || [];
    return pilots.reduce((total, pilot) => total + pilot.salary, 0);
  }

  /**
   * System update method (called by game loop)
   */
  update(deltaTime) {
    // Currently no time-based pilot updates needed
    // Future features might include:
    // - Experience gain over time
    // - Morale changes
    // - Skill degradation/improvement
  }

  /**
   * Handle system start
   */
  async start() {
    this.logger.debug('PilotSystem started');
    
    // Initialize pilot roster display
    this.updatePilotRoster();
  }

  /**
   * Handle system stop
   */
  async stop() {
    this.selectedPilot = null;
    this.logger.debug('PilotSystem stopped');
  }

  /**
   * Handle state loaded
   */
  onStateLoaded(gameState) {
    this.selectedPilot = null;
    
    // Find selected pilot if there is one
    const selectedPilotId = gameState.selectedPilot;
    if (selectedPilotId) {
      this.selectedPilot = this.getPilotById(selectedPilotId);
    }
    
    this.updatePilotRoster();
    this.logger.debug('PilotSystem state loaded');
  }

  /**
   * Shutdown the pilot system
   */
  async shutdown() {
    this.selectedPilot = null;
    this.isInitialized = false;
    this.logger.info('PilotSystem shutdown complete');
  }
}