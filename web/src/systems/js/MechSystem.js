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
   * Get available mechs for purchase based on market conditions
   */
  generateMechMarket() {
    const database = this.getMechDatabase();
    const allMechs = [...database.light, ...database.medium, ...database.heavy, ...database.assault];
    const companyRating = this.gameState.get('company.rating') || 'Green';
    const reputation = this.gameState.get('company.reputation') || {};
    
    // Filter mechs based on company rating and market availability
    let availableMechs = allMechs.filter(mechData => {
      const availability = this.getMechAvailability(mechData, companyRating, reputation);
      return Math.random() < availability;
    });

    // Limit market size (5-10 mechs available at any time)
    availableMechs = availableMechs.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 6) + 5);
    
    // Add market-specific data
    availableMechs.forEach(mechData => {
      mechData.id = this.generateMechId();
      mechData.status = 'For Sale';
      mechData.pilot = null;
      mechData.armor = Math.floor(Math.random() * 40) + 60; // 60-100% armor
      mechData.structure = Math.floor(Math.random() * 20) + 80; // 80-100% structure
      mechData.heat = 0;
      mechData.condition = this.determineMechCondition(mechData.armor, mechData.structure);
      mechData.marketPrice = this.calculateMarketPrice(mechData);
      mechData.lastMaintenance = Date.now() - (Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000); // 0-90 days ago
      mechData.marketDeadline = Date.now() + (Math.floor(Math.random() * 21 + 7) * 24 * 60 * 60 * 1000); // 7-28 days
      
      // Initialize ammo based on weapons
      mechData.ammo = this.generateAmmoLoadout(mechData.weapons);
    });

    return availableMechs;
  }

  /**
   * Determine mech availability based on company status
   */
  getMechAvailability(mechData, companyRating, reputation) {
    const baseAvailability = {
      'Light': 0.8,
      'Medium': 0.6,
      'Heavy': 0.4,
      'Assault': 0.2
    };

    let availability = baseAvailability[mechData.mechClass] || 0.5;
    
    // Higher rated companies have better access to rare mechs
    if (companyRating === 'Elite') availability *= 1.5;
    else if (companyRating === 'Veteran') availability *= 1.2;
    else if (companyRating === 'Green') availability *= 0.8;
    
    return Math.min(availability, 0.9); // Cap at 90%
  }

  /**
   * Determine mech condition based on armor and structure
   */
  determineMechCondition(armor, structure) {
    const avgCondition = (armor + structure) / 2;
    
    if (avgCondition >= 95) return 'Excellent';
    if (avgCondition >= 85) return 'Good';
    if (avgCondition >= 70) return 'Fair';
    if (avgCondition >= 50) return 'Poor';
    return 'Salvage';
  }

  /**
   * Calculate market price based on condition and demand
   */
  calculateMarketPrice(mechData) {
    let basePrice = mechData.purchaseCost;
    const avgCondition = (mechData.armor + mechData.structure) / 2;
    
    // Condition modifier
    const conditionModifier = avgCondition / 100;
    
    // Market variance
    const marketVariance = 0.8 + Math.random() * 0.4; // ±20%
    
    // Weight class demand modifier
    const demandModifier = {
      'Light': 0.9,    // Less demand
      'Medium': 1.0,   // Standard demand
      'Heavy': 1.1,    // Higher demand
      'Assault': 1.2   // Premium demand
    }[mechData.mechClass] || 1.0;
    
    return Math.round(basePrice * conditionModifier * marketVariance * demandModifier);
  }

  /**
   * Generate ammo loadout based on weapons
   */
  generateAmmoLoadout(weaponsString) {
    const ammo = {};
    
    // Parse weapons string to determine ammo needs
    if (weaponsString.includes('AC/20')) ammo['AC/20'] = Math.floor(Math.random() * 10) + 10;
    if (weaponsString.includes('AC/10')) ammo['AC/10'] = Math.floor(Math.random() * 15) + 15;
    if (weaponsString.includes('AC/5')) ammo['AC/5'] = Math.floor(Math.random() * 15) + 15;
    if (weaponsString.includes('AC/2')) ammo['AC/2'] = Math.floor(Math.random() * 20) + 25;
    if (weaponsString.includes('LRM-20')) ammo['LRM-20'] = Math.floor(Math.random() * 8) + 8;
    if (weaponsString.includes('LRM-15')) ammo['LRM-15'] = Math.floor(Math.random() * 12) + 12;
    if (weaponsString.includes('LRM-10')) ammo['LRM-10'] = Math.floor(Math.random() * 15) + 15;
    if (weaponsString.includes('LRM-5')) ammo['LRM-5'] = Math.floor(Math.random() * 20) + 20;
    if (weaponsString.includes('SRM-6')) ammo['SRM-6'] = Math.floor(Math.random() * 10) + 10;
    if (weaponsString.includes('SRM-4')) ammo['SRM-4'] = Math.floor(Math.random() * 15) + 15;
    if (weaponsString.includes('SRM-2')) ammo['SRM-2'] = Math.floor(Math.random() * 25) + 25;
    if (weaponsString.includes('Machine Gun')) ammo['Machine Gun'] = Math.floor(Math.random() * 100) + 100;
    
    return ammo;
  }

  /**
   * Show mech market interface
   */
  showMechMarket() {
    const availableMechs = this.generateMechMarket();
    this.displayMechMarket(availableMechs);
    this.eventBus.emit('mech:marketShown', { mechs: availableMechs });
  }

  /**
   * Display the mech market interface
   */
  displayMechMarket(mechs) {
    const marketHTML = `
      <div id="mech-market-overlay" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; justify-content: center; align-items: center;">
        <div class="market-interface" style="background: #2a2a2a; border: 2px solid #555; border-radius: 8px; max-width: 90%; max-height: 90%; overflow-y: auto; padding: 20px; color: white;">
          <div class="market-header">
            <h2 style="color: #fff; margin-bottom: 10px;">Mech Market - Available Units</h2>
            <p style="color: #ccc; margin-bottom: 20px;">Company Funds: ${this.gameState.get('company.funds', 0).toLocaleString()} C-Bills</p>
            <button onclick="closeMechMarket()" style="float: right; background: #666; color: white; border: none; padding: 5px 10px; cursor: pointer;">Close</button>
          </div>
          <div class="mech-market-list">
            ${mechs.map(mech => this.generateMechMarketCard(mech)).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', marketHTML);
  }

  /**
   * Generate HTML card for mech market
   */
  generateMechMarketCard(mech) {
    const companyFunds = this.gameState.get('company.funds') || 0;
    const canAfford = companyFunds >= mech.marketPrice;
    const daysRemaining = Math.ceil((mech.marketDeadline - Date.now()) / (24 * 60 * 60 * 1000));
    
    return `
      <div class="mech-market-card" style="border: 1px solid #555; margin-bottom: 15px; padding: 15px; background: #333; border-radius: 5px;">
        <div class="mech-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="color: #fff; margin: 0;">${mech.name}</h3>
          <span class="weight-badge ${mech.mechClass.toLowerCase()}" style="padding: 3px 8px; border-radius: 3px; font-size: 12px; background: ${this.getWeightClassColor(mech.mechClass)};">${mech.mechClass}</span>
        </div>
        
        <div class="mech-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div style="color: #ccc;">Tonnage: ${mech.tonnage}</div>
          <div style="color: #ccc;">BV: ${mech.battleValue}</div>
          <div style="color: #ccc;">Speed: ${mech.speed} kph</div>
          <div style="color: #ccc;">Jump Jets: ${mech.jumpJets ? 'Yes' : 'No'}</div>
          <div style="color: #ccc;">Condition: ${mech.condition}</div>
          <div style="color: #ccc;">Monthly Maintenance: ${mech.maintenanceCost.toLocaleString()}</div>
        </div>
        
        <div class="mech-details" style="margin-bottom: 10px;">
          <div class="condition-bars" style="margin-bottom: 5px;">
            <div style="display: flex; align-items: center; margin-bottom: 3px;">
              <span style="width: 60px; font-size: 12px;">Armor:</span>
              <div style="flex: 1; background: #444; height: 15px; border-radius: 3px; overflow: hidden;">
                <div style="width: ${mech.armor}%; height: 100%; background: linear-gradient(90deg, #4a4, #aa4, #a44); transition: width 0.3s;"></div>
              </div>
              <span style="margin-left: 5px; font-size: 12px; width: 30px;">${mech.armor}%</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="width: 60px; font-size: 12px;">Structure:</span>
              <div style="flex: 1; background: #444; height: 15px; border-radius: 3px; overflow: hidden;">
                <div style="width: ${mech.structure}%; height: 100%; background: linear-gradient(90deg, #44a, #a4a, #a44); transition: width 0.3s;"></div>
              </div>
              <span style="margin-left: 5px; font-size: 12px; width: 30px;">${mech.structure}%</span>
            </div>
          </div>
          <p style="color: #ddd; font-size: 14px; margin: 5px 0;"><strong>Weapons:</strong> ${mech.weapons}</p>
          <p style="color: #ddd; font-size: 14px; margin: 5px 0;"><strong>Manufacturer:</strong> ${mech.manufacturer}</p>
          <p style="color: #ddd; font-size: 13px; margin: 5px 0; font-style: italic;">${mech.description}</p>
        </div>
        
        <div class="mech-purchase-actions" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="purchase-info">
            <div style="color: #${canAfford ? 'fff' : 'f44'}; font-weight: bold; font-size: 16px;">Price: ${mech.marketPrice.toLocaleString()} C-Bills</div>
            <div style="color: #ccc; font-size: 12px;">Available for ${daysRemaining} more days</div>
            <div style="color: #999; font-size: 11px;">Base Value: ${mech.purchaseCost.toLocaleString()} C-Bills</div>
          </div>
          <button 
            onclick="purchaseMech('${mech.id}', ${mech.marketPrice})" 
            style="background: ${canAfford ? '#4a4' : '#666'}; color: white; border: none; padding: 10px 20px; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; border-radius: 3px; font-size: 14px;"
            ${!canAfford ? 'disabled' : ''}
          >
            ${canAfford ? 'Purchase' : 'Insufficient Funds'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get color for weight class
   */
  getWeightClassColor(weightClass) {
    switch (weightClass) {
      case 'Light': return '#4ecdc4';
      case 'Medium': return '#45b7d1';
      case 'Heavy': return '#f38ba8';
      case 'Assault': return '#ff6b35';
      default: return '#999';
    }
  }

  /**
   * Purchase a mech
   */
  purchaseMech(mechId, price) {
    const companyFunds = this.gameState.get('company.funds') || 0;
    
    if (companyFunds < price) {
      alert('Insufficient funds to purchase this mech.');
      return;
    }

    // Find mech in market (this would normally be stored somewhere)
    const availableMechs = this.generateMechMarket();
    const mech = availableMechs.find(m => m.id === mechId);
    
    if (!mech) {
      alert('Mech no longer available.');
      return;
    }

    // Deduct purchase cost
    this.gameState.set('company.funds', companyFunds - price);
    
    // Add mech to roster
    const currentMechs = this.gameState.get('mechs') || [];
    const newMech = {
      ...mech,
      id: this.generateMechId(),
      status: mech.condition === 'Excellent' || mech.condition === 'Good' ? 'Ready' : 'Repair Needed',
      pilot: null,
      datePurchased: Date.now()
    };
    
    currentMechs.push(newMech);
    this.gameState.set('mechs', currentMechs);
    
    // Close market interface
    this.closeMechMarket();
    
    this.eventBus.emit('mech:purchased', { mech: newMech, price });
    this.logger.info(`Mech purchased: ${newMech.name} for ${price.toLocaleString()} C-Bills`);
    
    alert(`${newMech.name} has been purchased and added to your mech bay!\nCondition: ${newMech.condition}\nStatus: ${newMech.status}`);
  }

  /**
   * Sell a mech
   */
  sellMech(mechId) {
    const mech = this.getMechById(mechId);
    if (!mech) {
      alert('Mech not found.');
      return;
    }

    if (mech.pilot) {
      alert('Cannot sell mech while assigned to a pilot. Unassign pilot first.');
      return;
    }

    const sellPrice = Math.round(mech.salvageValue * 0.8); // 80% of salvage value
    
    const confirmed = confirm(`Sell ${mech.name}?\n\nSale Price: ${sellPrice.toLocaleString()} C-Bills\n\nThis action cannot be undone.`);
    
    if (!confirmed) return;

    // Add funds
    const currentFunds = this.gameState.get('company.funds') || 0;
    this.gameState.set('company.funds', currentFunds + sellPrice);
    
    // Remove mech from roster
    this.gameState.removeFromArray('mechs', m => m.id === mechId);
    
    this.eventBus.emit('mech:sold', { mech, sellPrice });
    this.logger.info(`Mech sold: ${mech.name} for ${sellPrice.toLocaleString()} C-Bills`);
    
    alert(`${mech.name} sold for ${sellPrice.toLocaleString()} C-Bills.`);
  }

  /**
   * Close mech market interface
   */
  closeMechMarket() {
    const overlay = document.getElementById('mech-market-overlay');
    if (overlay) {
      overlay.remove();
    }
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