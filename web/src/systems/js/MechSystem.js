/**
 * Mech System - Manages mech roster, selection, and maintenance
 * Handles all mech-related game mechanics and UI interactions
 */
import { Logger } from '../../utils/Logger.js';

export class MechSystem {
  constructor(eventBus, gameState) {
    this.logger = new Logger('MechSystem');
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.isInitialized = false;
    this.selectedMech = null;
  }

  /**
   * Initialize the mech system
   */
  async initialize() {
    try {
      this.logger.info('Initializing MechSystem...');
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize UI handlers
      this.setupUIHandlers();
      
      this.isInitialized = true;
      this.logger.info('MechSystem initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize MechSystem:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Mech management events
    this.eventBus.on('mech:select', this.selectMech.bind(this));
    this.eventBus.on('mech:repair', this.repairMech.bind(this));
    this.eventBus.on('mech:upgrade', this.upgradeMech.bind(this));
    this.eventBus.on('mech:sell', this.sellMech.bind(this));
    
    // UI update events
    this.eventBus.on('gameState:changed', this.onGameStateChanged.bind(this));
    this.eventBus.on('screen:changed', this.onScreenChanged.bind(this));
    
    this.logger.debug('MechSystem event listeners setup complete');
  }

  /**
   * Setup UI event handlers for direct DOM interaction compatibility
   */
  setupUIHandlers() {
    // Make mech selection function globally available for onclick handlers
    window.selectMech = (index) => {
      this.eventBus.emit('mech:select', { index });
    };
  }

  /**
   * Create default mech roster for new companies
   */
  createDefaultMechs() {
    const defaultMechs = [
      {
        name: 'Atlas AS7-D',
        tonnage: 100,
        status: 'Ready',
        weapons: 'AC/20, LRM-20, SRM-6, Medium Laser x4',
        id: this.generateMechId(),
        pilot: null,
        armor: 100,
        structure: 100,
        heat: 0,
        ammo: {
          'AC/20': 15,
          'LRM-20': 12,
          'SRM-6': 15
        },
        loadout: {
          head: ['Medium Laser'],
          centerTorso: ['AC/20', 'Medium Laser'],
          leftTorso: ['LRM-20'],
          rightTorso: ['SRM-6'],
          leftArm: ['Medium Laser'],
          rightArm: ['Medium Laser'],
          leftLeg: [],
          rightLeg: []
        },
        maintenanceCost: 15000,
        lastMaintenance: Date.now()
      }
    ];
    
    return defaultMechs;
  }

  /**
   * Select a mech by index
   */
  selectMech(data) {
    const { index } = data;
    const mechs = this.gameState.get('mechs') || [];
    
    if (index >= 0 && index < mechs.length) {
      const mech = mechs[index];
      this.selectedMech = mech;
      
      // Update game state
      this.gameState.set('selectedMech', mech.id, { silent: true });
      
      // Update mech details display
      this.updateMechDetails(mech);
      
      this.eventBus.emit('mech:selected', { mech, index });
      this.logger.debug(`Mech selected: ${mech.name}`);
    } else {
      this.logger.warn(`Invalid mech index: ${index}`);
    }
  }

  /**
   * Update mech details display
   */
  updateMechDetails(mech) {
    const detailsElement = document.getElementById('mech-details');
    if (detailsElement) {
      const armorPercent = Math.round((mech.armor / 100) * 100);
      const structurePercent = Math.round((mech.structure / 100) * 100);
      
      detailsElement.innerHTML = `
        <h3>${mech.name}</h3>
        <div class="stat-line"><span>Tonnage:</span><span>${mech.tonnage} tons</span></div>
        <div class="stat-line"><span>Status:</span><span>${mech.status}</span></div>
        <div class="stat-line"><span>Weapons:</span><span>${mech.weapons}</span></div>
        <div class="stat-line"><span>Armor:</span><span>${armorPercent}%</span></div>
        <div class="stat-line"><span>Structure:</span><span>${structurePercent}%</span></div>
        <div class="stat-line"><span>Heat:</span><span>${mech.heat}%</span></div>
        ${mech.pilot ? `<div class="stat-line"><span>Pilot:</span><span>${mech.pilot}</span></div>` : '<div class="stat-line"><span>Pilot:</span><span>Unassigned</span></div>'}
        <div class="stat-line"><span>Monthly Maintenance:</span><span>${mech.maintenanceCost.toLocaleString()} C-Bills</span></div>
      `;
    }
  }

  /**
   * Update mech roster display
   */
  updateMechRoster() {
    const mechs = this.gameState.get('mechs') || [];
    const mechList = document.getElementById('mech-list');
    
    if (mechList) {
      mechList.innerHTML = mechs.map((mech, index) => {
        const statusClass = this.getMechStatusClass(mech);
        return `<div class="mech-entry ${statusClass}" onclick="selectMech(${index})">
          <div class="mech-name">${mech.name}</div>
          <div class="mech-status">${mech.tonnage} tons - ${mech.status}</div>
          <div class="mech-condition">
            Armor: ${Math.round((mech.armor / 100) * 100)}% | 
            Structure: ${Math.round((mech.structure / 100) * 100)}%
          </div>
        </div>`;
      }).join('');
    }
  }

  /**
   * Get CSS class based on mech status
   */
  getMechStatusClass(mech) {
    if (mech.status === 'Destroyed') return 'mech-destroyed';
    if (mech.status === 'Repairing') return 'mech-repairing';
    if (mech.armor < 50 || mech.structure < 50) return 'mech-damaged';
    return 'mech-ready';
  }

  /**
   * Repair a mech
   */
  repairMech(data) {
    const { mechId, repairType } = data;
    const mech = this.getMechById(mechId);
    
    if (!mech) {
      this.logger.warn(`Mech not found: ${mechId}`);
      return;
    }
    
    // Calculate repair cost and time
    const repairInfo = this.calculateRepairCost(mech, repairType);
    const companyFunds = this.gameState.get('company.funds');
    
    if (companyFunds < repairInfo.cost) {
      this.eventBus.emit('mech:repairFailed', { 
        reason: 'insufficient_funds', 
        required: repairInfo.cost, 
        available: companyFunds 
      });
      return;
    }
    
    // Deduct funds
    this.gameState.set('company.funds', companyFunds - repairInfo.cost);
    
    // Update mech status
    this.updateMech({
      mechId,
      updates: {
        status: 'Repairing',
        repairEndTime: Date.now() + repairInfo.time,
        armor: repairType === 'full' ? 100 : Math.min(100, mech.armor + 25),
        structure: repairType === 'full' ? 100 : Math.min(100, mech.structure + 15)
      }
    });
    
    this.eventBus.emit('mech:repairStarted', { mech, repairInfo });
  }

  /**
   * Calculate repair cost for a mech
   */
  calculateRepairCost(mech, repairType = 'partial') {
    const baseCost = mech.tonnage * 1000;
    const armorDamage = (100 - mech.armor) / 100;
    const structureDamage = (100 - mech.structure) / 100;
    
    let cost, time;
    
    if (repairType === 'full') {
      cost = Math.round(baseCost * (armorDamage + structureDamage * 2));
      time = (armorDamage + structureDamage) * 24 * 60 * 60 * 1000; // hours to milliseconds
    } else {
      cost = Math.round(baseCost * 0.5 * (armorDamage + structureDamage));
      time = (armorDamage + structureDamage) * 12 * 60 * 60 * 1000; // half time for partial repair
    }
    
    return { cost: Math.max(cost, 1000), time: Math.max(time, 60 * 60 * 1000) }; // minimum cost and time
  }

  /**
   * Update mech information
   */
  updateMech(data) {
    const { mechId, updates } = data;
    
    // Update mech in game state
    this.gameState.updateArrayItem('mechs', m => m.id === mechId, updates);
    
    // Update selected mech if it's the same one
    if (this.selectedMech && this.selectedMech.id === mechId) {
      this.selectedMech = { ...this.selectedMech, ...updates };
      this.updateMechDetails(this.selectedMech);
    }
    
    this.eventBus.emit('mech:updated', { mechId, updates });
  }

  /**
   * Handle game state changes
   */
  onGameStateChanged(data) {
    const { path } = data;
    
    // Update display if mechs array changed
    if (path === 'mechs' || path.startsWith('mechs.')) {
      this.updateMechRoster();
    }
  }

  /**
   * Handle screen changes
   */
  onScreenChanged(data) {
    const { to } = data;
    
    // Update mech roster when entering mech bay or company overview
    if (to === 'mech-bay' || to === 'company-overview') {
      this.updateMechRoster();
      
      // Clear mech details if no mech selected and we're in mech bay
      if (!this.selectedMech && to === 'mech-bay') {
        const detailsElement = document.getElementById('mech-details');
        if (detailsElement) {
          detailsElement.innerHTML = `
            <h3>Select a Mech</h3>
            <p>Choose a mech from the roster to view details and manage pilot assignments.</p>
          `;
        }
      }
    }
  }

  /**
   * Generate unique mech ID
   */
  generateMechId() {
    return `mech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get mech by ID
   */
  getMechById(mechId) {
    const mechs = this.gameState.get('mechs') || [];
    return mechs.find(mech => mech.id === mechId);
  }

  /**
   * Get available mechs (not assigned to pilots)
   */
  getAvailableMechs() {
    const mechs = this.gameState.get('mechs') || [];
    return mechs.filter(mech => !mech.pilot && mech.status !== 'Destroyed');
  }

  /**
   * Assign pilot to mech
   */
  assignPilotToMech(mechId, pilotId, pilotName) {
    this.updateMech({
      mechId,
      updates: { pilot: pilotName }
    });
    
    this.eventBus.emit('mech:pilotAssigned', { mechId, pilotId, pilotName });
  }

  /**
   * Unassign pilot from mech
   */
  unassignPilotFromMech(mechId) {
    this.updateMech({
      mechId,
      updates: { pilot: null }
    });
    
    this.eventBus.emit('mech:pilotUnassigned', { mechId });
  }

  /**
   * Calculate total maintenance costs
   */
  calculateTotalMaintenance() {
    const mechs = this.gameState.get('mechs') || [];
    return mechs.reduce((total, mech) => total + (mech.maintenanceCost || 0), 0);
  }

  /**
   * Process time-based repairs
   */
  processRepairs() {
    const mechs = this.gameState.get('mechs') || [];
    const now = Date.now();
    let repairsCompleted = [];
    
    mechs.forEach(mech => {
      if (mech.status === 'Repairing' && mech.repairEndTime && now >= mech.repairEndTime) {
        this.updateMech({
          mechId: mech.id,
          updates: {
            status: 'Ready',
            repairEndTime: null
          }
        });
        repairsCompleted.push(mech);
      }
    });
    
    if (repairsCompleted.length > 0) {
      this.eventBus.emit('mech:repairsCompleted', { mechs: repairsCompleted });
    }
  }

  /**
   * System update method (called by game loop)
   */
  update(deltaTime) {
    // Process ongoing repairs
    this.processRepairs();
    
    // Future features might include:
    // - Heat dissipation
    // - Wear and tear simulation
    // - Automatic maintenance scheduling
  }

  /**
   * Handle system start
   */
  async start() {
    this.logger.debug('MechSystem started');
    
    // Initialize mech roster display
    this.updateMechRoster();
  }

  /**
   * Handle system stop
   */
  async stop() {
    this.selectedMech = null;
    this.logger.debug('MechSystem stopped');
  }

  /**
   * Handle state loaded
   */
  onStateLoaded(gameState) {
    this.selectedMech = null;
    
    // Find selected mech if there is one
    const selectedMechId = gameState.selectedMech;
    if (selectedMechId) {
      this.selectedMech = this.getMechById(selectedMechId);
    }
    
    this.updateMechRoster();
    this.logger.debug('MechSystem state loaded');
  }

  /**
   * Shutdown the mech system
   */
  async shutdown() {
    this.selectedMech = null;
    this.isInitialized = false;
    this.logger.info('MechSystem shutdown complete');
  }
}