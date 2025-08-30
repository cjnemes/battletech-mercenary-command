/**
 * Contract System - Manages contract generation, selection, and execution
 * Handles all contract-related game mechanics and UI interactions
 */
import { Logger } from '../../utils/Logger.js';

export class ContractSystem {
  constructor(eventBus, gameState) {
    this.logger = new Logger('ContractSystem');
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.isInitialized = false;
    this.selectedContract = null;
  }

  /**
   * Initialize the contract system
   */
  async initialize() {
    try {
      this.logger.info('Initializing ContractSystem...');
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize UI handlers
      this.setupUIHandlers();
      
      this.isInitialized = true;
      this.logger.info('ContractSystem initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize ContractSystem:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Contract management events
    this.eventBus.on('contract:select', this.selectContract.bind(this));
    this.eventBus.on('contract:accept', this.acceptContract.bind(this));
    this.eventBus.on('contract:complete', this.completeContract.bind(this));
    this.eventBus.on('contract:refresh', this.refreshContracts.bind(this));
    
    // UI update events
    this.eventBus.on('gameState:changed', this.onGameStateChanged.bind(this));
    this.eventBus.on('screen:changed', this.onScreenChanged.bind(this));
    
    this.logger.debug('ContractSystem event listeners setup complete');
  }

  /**
   * Setup UI event handlers for direct DOM interaction compatibility
   */
  setupUIHandlers() {
    // Make contract functions globally available for onclick handlers
    window.refreshContracts = () => {
      this.eventBus.emit('contract:refresh');
    };
    
    window.selectContract = (index) => {
      this.eventBus.emit('contract:select', { index });
    };
    
    // Make contract action functions globally available
    window.acceptContract = (contractId) => {
      this.acceptContract(contractId);
    };
    
    window.negotiateContract = (contractId) => {
      alert('Contract negotiation system not yet implemented. This will allow you to negotiate terms and conditions.');
    };
  }

  /**
   * Create default contracts for new companies
   */
  createDefaultContracts() {
    const defaultContracts = [
      {
        id: this.generateContractId(),
        name: 'Garrison Duty',
        employer: 'Federated Suns',
        type: 'Garrison',
        payment: 85000,
        difficulty: 'Easy',
        duration: 30, // days
        description: 'Guard a supply depot on the frontier. Low risk assignment suitable for new mercenary units.',
        requirements: {
          minMechs: 1,
          maxMechs: 4,
          weightLimit: 400 // tons
        },
        risks: ['Minimal combat expected', 'Pirate raids possible'],
        rewards: {
          payment: 85000,
          salvage: 0.1,
          reputation: { 'Federated Suns': 5 }
        },
        location: 'Broken Wheel',
        timeLimit: Date.now() + (7 * 24 * 60 * 60 * 1000) // Available for 7 days
      },
      {
        id: this.generateContractId(),
        name: 'Pirate Hunt',
        employer: 'Local Government',
        type: 'Search and Destroy',
        payment: 120000,
        difficulty: 'Moderate',
        duration: 21, // days
        description: 'Track down and eliminate pirate raiders threatening local trade routes. Expected resistance includes light to medium mechs.',
        requirements: {
          minMechs: 2,
          maxMechs: 6,
          weightLimit: 300 // tons
        },
        risks: ['Medium combat expected', 'Ambush tactics likely', 'Unfamiliar terrain'],
        rewards: {
          payment: 120000,
          salvage: 0.3,
          reputation: { 'Local Government': 10, 'Mercenary': 5 }
        },
        location: 'Sheratan',
        timeLimit: Date.now() + (10 * 24 * 60 * 60 * 1000) // Available for 10 days
      }
    ];
    
    return defaultContracts;
  }

  /**
   * Select a contract by index
   */
  selectContract(data) {
    const { index } = data;
    const contracts = this.gameState.get('contracts') || [];
    
    if (index >= 0 && index < contracts.length) {
      const contract = contracts[index];
      this.selectedContract = contract;
      
      // Update game state
      this.gameState.set('selectedContract', contract.id, { silent: true });
      
      // Update contract details display
      this.updateContractDetails(contract);
      
      this.eventBus.emit('contract:selected', { contract, index });
      this.logger.debug(`Contract selected: ${contract.name}`);
    } else {
      this.logger.warn(`Invalid contract index: ${index}`);
    }
  }

  /**
   * Update contract details display
   */
  updateContractDetails(contract) {
    const detailsElement = document.getElementById('contract-details');
    if (detailsElement) {
      const daysRemaining = Math.ceil((contract.timeLimit - Date.now()) / (24 * 60 * 60 * 1000));
      
      detailsElement.innerHTML = `
        <h3>${contract.name}</h3>
        <div class="contract-header">
          <div class="stat-line"><span>Employer:</span><span>${contract.employer}</span></div>
          <div class="stat-line"><span>Type:</span><span>${contract.type}</span></div>
          <div class="stat-line"><span>Payment:</span><span>${contract.payment.toLocaleString()} C-Bills</span></div>
          <div class="stat-line"><span>Difficulty:</span><span>${contract.difficulty}</span></div>
          <div class="stat-line"><span>Duration:</span><span>${contract.duration} days</span></div>
          <div class="stat-line"><span>Location:</span><span>${contract.location}</span></div>
          <div class="stat-line"><span>Available:</span><span>${daysRemaining} days remaining</span></div>
        </div>
        
        <div class="contract-description">
          <h4>Mission Brief</h4>
          <p>${contract.description}</p>
        </div>
        
        <div class="contract-requirements">
          <h4>Requirements</h4>
          <div class="stat-line"><span>Mechs:</span><span>${contract.requirements.minMechs}-${contract.requirements.maxMechs} units</span></div>
          <div class="stat-line"><span>Weight Limit:</span><span>${contract.requirements.weightLimit} tons</span></div>
        </div>
        
        <div class="contract-risks">
          <h4>Risk Assessment</h4>
          <ul>
            ${contract.risks.map(risk => `<li>${risk}</li>`).join('')}
          </ul>
        </div>
        
        <div class="contract-rewards">
          <h4>Compensation</h4>
          <div class="stat-line"><span>Base Payment:</span><span>${contract.rewards.payment.toLocaleString()} C-Bills</span></div>
          <div class="stat-line"><span>Salvage Rights:</span><span>${(contract.rewards.salvage * 100)}%</span></div>
          ${Object.entries(contract.rewards.reputation).map(([faction, rep]) => 
            `<div class="stat-line"><span>${faction}:</span><span>+${rep} reputation</span></div>`
          ).join('')}
        </div>
        
        <div class="contract-actions">
          <button class="btn btn-primary" onclick="acceptContract('${contract.id}')">Accept Contract</button>
          <button class="btn btn-secondary" onclick="negotiateContract('${contract.id}')">Negotiate Terms</button>
        </div>
      `;
    }
  }

  /**
   * Update contracts list display
   */
  updateContractsList() {
    const contracts = this.gameState.get('contracts') || [];
    const contractList = document.getElementById('contract-list');
    
    if (contractList) {
      contractList.innerHTML = contracts.map((contract, index) => {
        const daysRemaining = Math.ceil((contract.timeLimit - Date.now()) / (24 * 60 * 60 * 1000));
        const difficultyClass = this.getDifficultyClass(contract.difficulty);
        
        return `<div class="contract-entry ${difficultyClass}" onclick="selectContract(${index})">
          <div class="contract-header">
            <div class="contract-name">${contract.name}</div>
            <div class="contract-payment">${contract.payment.toLocaleString()} C-Bills</div>
          </div>
          <div class="contract-summary">
            <span class="contract-employer">${contract.employer}</span> | 
            <span class="contract-difficulty">${contract.difficulty}</span> | 
            <span class="contract-duration">${contract.duration} days</span>
          </div>
          <div class="contract-location">${contract.location}</div>
          <div class="contract-expiry">Expires in ${daysRemaining} days</div>
        </div>`;
      }).join('');
    }
  }

  /**
   * Get CSS class based on contract difficulty
   */
  getDifficultyClass(difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'difficulty-easy';
      case 'moderate': return 'difficulty-moderate';
      case 'hard': return 'difficulty-hard';
      case 'extreme': return 'difficulty-extreme';
      default: return 'difficulty-unknown';
    }
  }

  /**
   * Refresh available contracts
   */
  refreshContracts(data = {}) {
    this.logger.info('Refreshing available contracts...');
    
    // Generate new contracts based on company reputation and current date
    const newContracts = this.generateContracts();
    
    // Update game state
    this.gameState.set('contracts', newContracts);
    
    // Clear current selection
    this.selectedContract = null;
    this.gameState.set('selectedContract', null);
    
    this.eventBus.emit('contract:refreshed', { contracts: newContracts });
    this.logger.info(`Generated ${newContracts.length} new contracts`);
  }

  /**
   * Generate new contracts based on current game state
   */
  generateContracts() {
    const companyRating = this.gameState.get('company.rating') || 'Green';
    const reputation = this.gameState.get('company.reputation') || {};
    const currentDate = this.gameState.get('time') || { year: 3025, month: 1, day: 1 };
    
    const contractTypes = this.getAvailableContractTypes(companyRating, reputation);
    const numContracts = Math.floor(Math.random() * 4) + 2; // 2-5 contracts
    
    const contracts = [];
    
    for (let i = 0; i < numContracts; i++) {
      const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
      const contract = this.generateContract(contractType, companyRating, reputation);
      contracts.push(contract);
    }
    
    return contracts;
  }

  /**
   * Get available contract types based on company status
   */
  getAvailableContractTypes(rating, reputation) {
    const contractTypes = {
      'Green': [
        'Garrison', 'Patrol', 'Escort', 'Training Exercise',
        'Cargo Protection', 'Base Security', 'Equipment Testing'
      ],
      'Regular': [
        'Garrison', 'Patrol', 'Escort', 'Raid', 'Search and Destroy',
        'Recon', 'Objective Raid', 'Anti-Piracy', 'Border Patrol',
        'Facility Defense', 'VIP Protection', 'Supply Line Security'
      ],
      'Veteran': [
        'Garrison', 'Raid', 'Search and Destroy', 'Objective Raid', 'Recon',
        'Extraction', 'Sabotage', 'Planetary Assault', 'Special Operations',
        'Deep Recon', 'Strike Mission', 'Interdiction', 'Counter-Intelligence',
        'Battlefield Salvage', 'Technology Recovery'
      ],
      'Elite': [
        'Planetary Assault', 'Special Operations', 'Deep Strike', 'Extraction',
        'Sabotage', 'Assassination', 'Technology Theft', 'Strategic Strike',
        'Counter-Offensive', 'Covert Operations', 'Black Ops', 'Regime Change',
        'Experimental Weapons Testing', 'Classified Missions'
      ]
    };
    
    // Get base types for rating
    let availableTypes = contractTypes[rating] || contractTypes['Regular'];
    
    // Add reputation-based bonus types
    if (reputation) {
      Object.keys(reputation).forEach(faction => {
        const rep = reputation[faction] || 0;
        if (rep > 50 && rating === 'Green') {
          availableTypes.push('Search and Destroy', 'Anti-Piracy');
        }
        if (rep > 75 && (rating === 'Regular' || rating === 'Green')) {
          availableTypes.push('Objective Raid', 'Special Operations');
        }
      });
    }
    
    return [...new Set(availableTypes)]; // Remove duplicates
  }

  /**
   * Generate a single contract
   */
  generateContract(type, companyRating, reputation) {
    const employers = this.getEmployers();
    const locations = this.getLocations();
    
    const employer = employers[Math.floor(Math.random() * employers.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    const basePayment = this.calculateBasePayment(type, companyRating);
    const difficulty = this.determineDifficulty(type, companyRating);
    
    return {
      id: this.generateContractId(),
      name: this.generateContractName(type, location),
      employer,
      type,
      payment: basePayment,
      difficulty,
      duration: this.calculateDuration(type),
      description: this.generateDescription(type, location, employer),
      requirements: this.generateRequirements(type, difficulty),
      risks: this.generateRisks(type, difficulty),
      rewards: this.generateRewards(basePayment, type, employer),
      location,
      timeLimit: Date.now() + (Math.floor(Math.random() * 14 + 7) * 24 * 60 * 60 * 1000), // 7-21 days
      objectives: this.generateObjectives(type, difficulty),
      opposition: this.generateOpposition(type, difficulty),
      terrain: this.generateTerrain(location),
      specialConditions: this.generateSpecialConditions(type, difficulty)
    };
  }

  /**
   * Get comprehensive list of employers
   */
  getEmployers() {
    return [
      // Great Houses
      'Federated Suns', 'Lyran Commonwealth', 'Capellan Confederation', 
      'Free Worlds League', 'Draconis Combine',
      
      // Major Mercenary Units
      'Wolf\'s Dragoons', 'Gray Death Legion', 'Northwind Highlanders',
      'Eridani Light Horse', 'Blackwidow Company',
      
      // Corporate Clients
      'Federated-Boeing Interstellar', 'General Motors', 'Defiance Industries',
      'StarCorps Industries', 'Coventry Metal Works', 'Kali Yama Weapons',
      
      // Local Governments
      'Planetary Government', 'Colonial Authority', 'Trade Consortium',
      'Mining Guild', 'Agricultural Collective', 'Merchant Alliance',
      
      // Specialized
      'ComStar', 'Mercenary Review Board', 'Intelligence Agency',
      'Noble House', 'Religious Order', 'Academic Institution'
    ];
  }

  /**
   * Get comprehensive list of locations
   */
  getLocations() {
    return [
      // Federated Suns Worlds
      'New Avalon', 'Davion Guard', 'Robinson', 'Broken Wheel', 'Galtor',
      'Sheratan', 'Klathandu', 'Panpour', 'Kentares', 'New Syrtis',
      
      // Lyran Commonwealth Worlds
      'Tharkad', 'Steiner', 'Arc-Royal', 'Solaris VII', 'Hesperus II',
      'Gallery', 'Alarion', 'Freedom', 'Furillo', 'Winterfall',
      
      // Capellan Confederation Worlds
      'Sian', 'Capella', 'Liao', 'St. Ives', 'Menke',
      'Tikonov', 'Grand Base', 'Hunan', 'Epsilon Indi', 'Wei',
      
      // Free Worlds League Worlds
      'Atreus', 'Marik', 'Oriente', 'Regulus', 'Andurien',
      'Ohrensen', 'Wyatt', 'Shuen Wan', 'Lopez', 'Procyon',
      
      // Draconis Combine Worlds
      'Luthien', 'Kurita', 'Pesht', 'Dieron', 'Kimura',
      'Buckminster', 'Tok Do', 'New Samarkand', 'Kagoshima', 'Yamarovka',
      
      // Periphery and Independent
      'Outreach', 'Galatea', 'Northwind', 'Astrokaszy', 'Circinus',
      'Tortuga Prime', 'Antallos', 'Santander', 'Pirate\'s Haven', 'Rockwellawan'
    ];
  }

  /**
   * Calculate base payment for contract
   */
  calculateBasePayment(type, rating) {
    const baseRates = {
      // Low-risk contracts
      'Garrison': 75000,
      'Patrol': 60000,
      'Escort': 65000,
      'Training Exercise': 45000,
      'Cargo Protection': 55000,
      'Base Security': 70000,
      'Equipment Testing': 50000,
      
      // Medium-risk contracts
      'Raid': 95000,
      'Search and Destroy': 110000,
      'Anti-Piracy': 85000,
      'Border Patrol': 75000,
      'Facility Defense': 90000,
      'VIP Protection': 120000,
      'Supply Line Security': 80000,
      
      // High-risk contracts
      'Objective Raid': 140000,
      'Recon': 100000,
      'Deep Recon': 130000,
      'Strike Mission': 160000,
      'Interdiction': 145000,
      'Counter-Intelligence': 170000,
      'Battlefield Salvage': 125000,
      'Technology Recovery': 200000,
      
      // Elite contracts
      'Extraction': 180000,
      'Sabotage': 220000,
      'Planetary Assault': 300000,
      'Special Operations': 250000,
      'Deep Strike': 280000,
      'Assassination': 350000,
      'Technology Theft': 400000,
      'Strategic Strike': 320000,
      'Counter-Offensive': 380000,
      'Covert Operations': 450000,
      'Black Ops': 500000,
      'Regime Change': 750000,
      'Experimental Weapons Testing': 300000,
      'Classified Missions': 600000
    };
    
    const ratingMultiplier = {
      'Green': 0.7,
      'Regular': 1.0,
      'Veteran': 1.4,
      'Elite': 1.8
    };
    
    const base = baseRates[type] || 100000;
    const multiplier = ratingMultiplier[rating] || 1.0;
    const variance = 0.8 + Math.random() * 0.4; // ±20% variance
    
    return Math.round(base * multiplier * variance);
  }

  /**
   * Determine contract difficulty
   */
  determineDifficulty(type, rating) {
    const difficulties = ['Easy', 'Moderate', 'Hard', 'Extreme'];
    
    // Green companies get easier contracts
    if (rating === 'Green') {
      return difficulties[Math.floor(Math.random() * 2)]; // Easy or Moderate
    }
    
    // Higher rated companies get access to harder contracts
    const maxDifficulty = rating === 'Elite' ? 4 : rating === 'Veteran' ? 3 : 2;
    return difficulties[Math.floor(Math.random() * maxDifficulty)];
  }

  /**
   * Generate contract requirements
   */
  generateRequirements(type, difficulty) {
    const difficultyMods = {
      'Easy': { minMechs: 1, maxMechs: 4, weightLimit: 300 },
      'Moderate': { minMechs: 2, maxMechs: 6, weightLimit: 400 },
      'Hard': { minMechs: 4, maxMechs: 8, weightLimit: 500 },
      'Extreme': { minMechs: 6, maxMechs: 12, weightLimit: 600 }
    };
    
    return difficultyMods[difficulty] || difficultyMods['Moderate'];
  }

  /**
   * Generate contract risks
   */
  generateRisks(type, difficulty) {
    const riskPools = {
      'Easy': ['Minimal combat expected', 'Light resistance', 'Good intel available'],
      'Moderate': ['Medium combat expected', 'Moderate resistance', 'Some intel gaps'],
      'Hard': ['Heavy combat expected', 'Strong resistance', 'Limited intel'],
      'Extreme': ['Extreme combat expected', 'Elite opposition', 'Minimal intel', 'High casualty risk']
    };
    
    const risks = riskPools[difficulty] || riskPools['Moderate'];
    const numRisks = Math.floor(Math.random() * 3) + 1; // 1-3 risks
    
    return risks.slice(0, numRisks);
  }

  /**
   * Generate contract rewards
   */
  generateRewards(basePayment, type, employer) {
    const salvageRates = {
      // Low salvage contracts
      'Garrison': 0.05,
      'Patrol': 0.1,
      'Escort': 0.1,
      'Training Exercise': 0.0,
      'VIP Protection': 0.0,
      
      // Standard salvage contracts
      'Raid': 0.25,
      'Search and Destroy': 0.3,
      'Anti-Piracy': 0.35,
      'Facility Defense': 0.15,
      'Border Patrol': 0.2,
      
      // High salvage contracts
      'Objective Raid': 0.3,
      'Strike Mission': 0.35,
      'Planetary Assault': 0.45,
      'Battlefield Salvage': 0.6,
      'Technology Recovery': 0.4,
      
      // Variable salvage contracts
      'Recon': 0.15,
      'Deep Recon': 0.2,
      'Extraction': 0.25,
      'Sabotage': 0.2,
      'Special Operations': 0.3,
      'Counter-Intelligence': 0.25,
      
      // Minimal salvage contracts (high pay, low salvage)
      'Assassination': 0.1,
      'Black Ops': 0.15,
      'Covert Operations': 0.1,
      'Technology Theft': 0.2
    };
    
    // Calculate reputation gain based on contract type and difficulty
    let baseRepGain = 5;
    
    if (['Special Operations', 'Black Ops', 'Assassination'].includes(type)) {
      baseRepGain = 15; // High-risk contracts give more reputation
    } else if (['Planetary Assault', 'Extraction', 'Sabotage'].includes(type)) {
      baseRepGain = 12;
    } else if (['Objective Raid', 'Deep Recon', 'Technology Recovery'].includes(type)) {
      baseRepGain = 10;
    } else if (['Raid', 'Search and Destroy', 'Anti-Piracy'].includes(type)) {
      baseRepGain = 8;
    }
    
    const repVariance = Math.floor(Math.random() * 6) - 2; // -2 to +3 variance
    const finalRep = Math.max(1, baseRepGain + repVariance);
    
    // Some contracts offer bonus rewards
    const bonusRewards = {};
    
    if (type === 'Technology Recovery') {
      bonusRewards.techBonus = Math.floor(Math.random() * 50000) + 25000;
    }
    
    if (type === 'Training Exercise') {
      bonusRewards.pilotXP = Math.floor(Math.random() * 500) + 200;
    }
    
    if (['VIP Protection', 'Assassination'].includes(type)) {
      bonusRewards.discretionBonus = Math.floor(basePayment * 0.1);
    }
    
    return {
      payment: basePayment,
      salvage: salvageRates[type] || 0.2,
      reputation: { [employer]: finalRep },
      ...bonusRewards
    };
  }

  /**
   * Generate contract name
   */
  generateContractName(type, location) {
    const nameTemplates = {
      'Garrison': [`${location} Defense Contract`, `Garrison Duty - ${location}`, `${location} Security Detail`],
      'Raid': [`Raid on ${location}`, `${location} Strike Mission`, `Assault - ${location}`],
      'Search and Destroy': [`Pirate Hunt - ${location}`, `Clear ${location}`, `${location} Sweep Operation`],
      'Objective Raid': [`${location} Facility Raid`, `Strike ${location} Base`, `${location} Asset Denial`],
      'Recon': [`${location} Reconnaissance`, `Scout ${location}`, `${location} Intel Gathering`],
      'Extraction': [`${location} Extraction`, `Rescue Operation - ${location}`, `${location} Recovery Mission`],
      'Planetary Assault': [`Invasion of ${location}`, `${location} Campaign`, `Battle for ${location}`]
    };
    
    const templates = nameTemplates[type] || [`${type} - ${location}`];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate contract description
   */
  generateDescription(type, location, employer) {
    const descriptions = {
      'Garrison': `${employer} requires a reliable mercenary unit to provide long-term security for critical facilities on ${location}. Duties include perimeter defense, patrol operations, and rapid response to security breaches.`,
      
      'Patrol': `${employer} needs experienced pilots to conduct regular patrol sweeps in the ${location} system. Mission involves reconnaissance, early warning, and engagement of minor threats.`,
      
      'Escort': `${employer} requires professional escort services for valuable cargo shipments through the ${location} region. Potential threats include pirate raids and industrial sabotage.`,
      
      'Training Exercise': `${employer} seeks mercenary units to participate in large-scale military training exercises on ${location}. Live-fire exercises will test combat readiness and tactical coordination.`,
      
      'Raid': `${employer} has authorized a precision strike against enemy installations on ${location}. Primary objectives include facility destruction, data recovery, and strategic disruption.`,
      
      'Search and Destroy': `Hostile forces have been identified operating in the ${location} region. ${employer} requires immediate elimination of these threats to restore regional security and trade stability.`,
      
      'Anti-Piracy': `${employer} contracts mercenary forces to eliminate pirate operations threatening trade routes near ${location}. Intelligence suggests organized raider groups with significant military hardware.`,
      
      'Objective Raid': `${employer} requires surgical strike capabilities against a high-value target on ${location}. Mission success depends on precise execution and rapid extraction.`,
      
      'Recon': `${employer} needs detailed intelligence on enemy positions and capabilities in the ${location} sector. Stealth and information gathering are paramount to mission success.`,
      
      'Deep Recon': `${employer} requires deep penetration reconnaissance behind enemy lines on ${location}. Extended operation with limited support and extreme operational security requirements.`,
      
      'Extraction': `${employer} needs immediate extraction of high-value personnel from hostile territory on ${location}. Time-sensitive operation with significant enemy opposition expected.`,
      
      'Sabotage': `${employer} contracts covert operations to disrupt enemy infrastructure on ${location}. Mission requires stealth insertion, precise targeting, and clean extraction.`,
      
      'Planetary Assault': `${employer} launches major offensive operations against enemy-held positions on ${location}. Large-scale combat with combined arms support and strategic objectives.`,
      
      'Special Operations': `${employer} requires elite mercenary capabilities for classified operations on ${location}. Mission details available only upon security clearance and contract signing.`,
      
      'VIP Protection': `${employer} seeks professional bodyguard services for high-ranking officials visiting ${location}. Credible assassination threats require maximum security protocols.`,
      
      'Technology Recovery': `${employer} contracts recovery operations for advanced technology lost on ${location}. Hostile forces actively contest the recovery site with significant military presence.`,
      
      'Counter-Intelligence': `${employer} requires counter-espionage operations to neutralize enemy intelligence networks on ${location}. Mission involves surveillance, infiltration, and targeted elimination.`,
      
      'Assassination': `${employer} contracts elimination of high-value target on ${location}. Maximum discretion required with plausible deniability for all parties involved.`,
      
      'Black Ops': `${employer} seeks deniable assets for highly classified operations on ${location}. All records will be expunged upon mission completion. Extreme secrecy protocols in effect.`
    };
    
    return descriptions[type] || `${employer} has contracted mercenary services for specialized operations on ${location}. Detailed mission briefing will be provided upon contract acceptance and security clearance.`;
  }

  /**
   * Calculate contract duration
   */
  calculateDuration(type) {
    const durations = {
      // Short-term contracts (1-10 days)
      'Extraction': 1 + Math.floor(Math.random() * 4), // 1-5 days
      'Assassination': 1 + Math.floor(Math.random() * 3), // 1-4 days
      'Sabotage': 2 + Math.floor(Math.random() * 5), // 2-7 days
      'Strike Mission': 1 + Math.floor(Math.random() * 6), // 1-7 days
      'Objective Raid': 2 + Math.floor(Math.random() * 6), // 2-8 days
      'Technology Theft': 3 + Math.floor(Math.random() * 5), // 3-8 days
      'Black Ops': 1 + Math.floor(Math.random() * 7), // 1-8 days
      
      // Medium-term contracts (7-30 days)
      'Raid': 5 + Math.floor(Math.random() * 10), // 5-15 days
      'Search and Destroy': 10 + Math.floor(Math.random() * 15), // 10-25 days
      'Anti-Piracy': 14 + Math.floor(Math.random() * 14), // 14-28 days
      'Recon': 7 + Math.floor(Math.random() * 16), // 7-23 days
      'Deep Recon': 14 + Math.floor(Math.random() * 21), // 14-35 days
      'VIP Protection': 3 + Math.floor(Math.random() * 25), // 3-28 days
      'Escort': 5 + Math.floor(Math.random() * 20), // 5-25 days
      'Counter-Intelligence': 10 + Math.floor(Math.random() * 25), // 10-35 days
      'Special Operations': 7 + Math.floor(Math.random() * 18), // 7-25 days
      'Technology Recovery': 5 + Math.floor(Math.random() * 15), // 5-20 days
      'Covert Operations': 10 + Math.floor(Math.random() * 20), // 10-30 days
      
      // Long-term contracts (30-180 days)
      'Garrison': 30 + Math.floor(Math.random() * 60), // 30-90 days
      'Patrol': 21 + Math.floor(Math.random() * 30), // 21-51 days
      'Border Patrol': 45 + Math.floor(Math.random() * 45), // 45-90 days
      'Facility Defense': 30 + Math.floor(Math.random() * 90), // 30-120 days
      'Base Security': 60 + Math.floor(Math.random() * 60), // 60-120 days
      'Supply Line Security': 30 + Math.floor(Math.random() * 60), // 30-90 days
      'Training Exercise': 14 + Math.floor(Math.random() * 21), // 14-35 days
      'Equipment Testing': 21 + Math.floor(Math.random() * 30), // 21-51 days
      
      // Campaign-length contracts (60-300 days)
      'Planetary Assault': 60 + Math.floor(Math.random() * 120), // 60-180 days
      'Counter-Offensive': 45 + Math.floor(Math.random() * 90), // 45-135 days
      'Strategic Strike': 30 + Math.floor(Math.random() * 60), // 30-90 days
      'Regime Change': 120 + Math.floor(Math.random() * 180), // 120-300 days
      'Interdiction': 45 + Math.floor(Math.random() * 75), // 45-120 days
      'Experimental Weapons Testing': 90 + Math.floor(Math.random() * 90), // 90-180 days
      'Classified Missions': 30 + Math.floor(Math.random() * 150) // 30-180 days
    };
    
    return durations[type] || 21;
  }

  /**
   * Generate contract objectives
   */
  generateObjectives(type, difficulty) {
    const objectiveTemplates = {
      'Garrison': [
        'Maintain base security perimeter',
        'Respond to security alerts within 5 minutes',
        'Conduct daily patrol sweeps',
        'Protect key personnel and facilities'
      ],
      'Raid': [
        'Destroy primary target facility',
        'Eliminate enemy mobile forces',
        'Secure designated salvage materials',
        'Extract within time limit'
      ],
      'Search and Destroy': [
        'Locate and eliminate all hostile forces',
        'Secure the operational area',
        'Identify enemy command structure',
        'Prevent enemy retreat and regrouping'
      ],
      'Extraction': [
        'Locate and secure target personnel',
        'Maintain extraction zone security',
        'Neutralize pursuit forces',
        'Complete extraction within time window'
      ],
      'Recon': [
        'Gather intelligence on enemy positions',
        'Identify key military installations',
        'Map enemy patrol routes and schedules',
        'Remain undetected throughout mission'
      ],
      'Assassination': [
        'Eliminate designated target',
        'Minimize civilian casualties',
        'Leave no evidence of mercenary involvement',
        'Extract cleanly from operational area'
      ],
      'Sabotage': [
        'Destroy critical infrastructure targets',
        'Disrupt enemy supply lines',
        'Plant surveillance devices if possible',
        'Avoid detection during infiltration'
      ]
    };
    
    const baseObjectives = objectiveTemplates[type] || [
      'Complete primary mission objectives',
      'Minimize unit casualties',
      'Maintain operational security',
      'Return to base safely'
    ];
    
    // Add difficulty-based bonus objectives
    if (difficulty === 'Hard' || difficulty === 'Extreme') {
      baseObjectives.push('Gather additional intelligence');
      baseObjectives.push('Secure valuable salvage');
    }
    
    return baseObjectives;
  }

  /**
   * Generate opposition information
   */
  generateOpposition(type, difficulty) {
    const oppositionTypes = {
      'Easy': [
        'Light security forces',
        'Militia units with basic training',
        'Outdated equipment and tactics',
        'Poor coordination between units'
      ],
      'Moderate': [
        'Regular army units',
        'Mixed light and medium mech forces',
        'Standard military equipment',
        'Competent but predictable tactics'
      ],
      'Hard': [
        'Elite military formations',
        'Heavy mech support',
        'Advanced weapons systems',
        'Sophisticated tactical coordination'
      ],
      'Extreme': [
        'Special forces units',
        'Assault mech formations',
        'Cutting-edge military technology',
        'Expert tactical commanders',
        'Air and artillery support'
      ]
    };
    
    const baseOpposition = oppositionTypes[difficulty] || oppositionTypes['Moderate'];
    
    // Add contract-specific opposition details
    if (type === 'Anti-Piracy') {
      baseOpposition.push('Irregular raider tactics', 'Salvaged military equipment');
    } else if (type === 'Planetary Assault') {
      baseOpposition.push('Fortified defensive positions', 'Combined arms warfare');
    } else if (type === 'Black Ops') {
      baseOpposition.push('Counter-intelligence operations', 'Unknown enemy capabilities');
    }
    
    return baseOpposition;
  }

  /**
   * Generate terrain information
   */
  generateTerrain(location) {
    const terrainTypes = [
      'Urban environment with tall buildings',
      'Dense forest with limited visibility',
      'Desert terrain with extreme temperatures',
      'Mountainous region with difficult access',
      'Industrial complex with hazardous materials',
      'Coastal area with amphibious challenges',
      'Arctic conditions with weather hazards',
      'Jungle environment with dense vegetation',
      'Badlands with unstable ground',
      'Agricultural plains with open terrain'
    ];
    
    const selectedTerrain = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
    
    // Add location-specific terrain details
    const terrainModifiers = [
      'Limited mech mobility in certain areas',
      'Reduced sensor effectiveness',
      'Environmental hazards present',
      'Civilian population considerations',
      'Strategic chokepoints available',
      'Natural cover and concealment',
      'Extreme weather conditions possible'
    ];
    
    const modifier = terrainModifiers[Math.floor(Math.random() * terrainModifiers.length)];
    
    return [selectedTerrain, modifier];
  }

  /**
   * Generate special mission conditions
   */
  generateSpecialConditions(type, difficulty) {
    const conditions = [];
    
    // Add random special conditions based on contract type
    const possibleConditions = [
      'Night operations required',
      'Electronic warfare environment',
      'Limited ammunition resupply',
      'Strict rules of engagement',
      'Civilian evacuation in progress',
      'Communications jamming expected',
      'Hostile air support possible',
      'Time-sensitive objectives',
      'Chemical/biological hazards',
      'Extreme weather conditions',
      'Multiple extraction points',
      'Enemy reinforcements inbound',
      'Captured personnel to rescue',
      'Critical infrastructure to protect',
      'Media attention and scrutiny'
    ];
    
    // Select 1-3 conditions based on difficulty
    const numConditions = difficulty === 'Extreme' ? 3 : 
                         difficulty === 'Hard' ? 2 : 
                         Math.random() < 0.6 ? 1 : 0;
    
    for (let i = 0; i < numConditions; i++) {
      const condition = possibleConditions[Math.floor(Math.random() * possibleConditions.length)];
      if (!conditions.includes(condition)) {
        conditions.push(condition);
      }
    }
    
    return conditions;
  }

  /**
   * Accept a contract
   */
  acceptContract(contractId) {
    const contract = this.getContractById(contractId);
    if (!contract) {
      this.logger.warn(`Contract not found: ${contractId}`);
      return;
    }
    
    // Validate company can fulfill contract requirements
    const mechs = this.gameState.get('mechs') || [];
    const availableMechs = mechs.filter(mech => mech.status === 'Ready');
    const pilots = this.gameState.get('pilots') || [];
    const availablePilots = pilots.filter(pilot => pilot.status === 'Active' && !pilot.mechAssignment);
    
    // Check mech requirements
    if (availableMechs.length < contract.requirements.minMechs) {
      alert(`Insufficient mechs available.\nRequired: ${contract.requirements.minMechs}\nAvailable: ${availableMechs.length}\n\nPurchase additional mechs or repair damaged units.`);
      return;
    }
    
    // Check pilot requirements
    if (availablePilots.length < contract.requirements.minMechs) {
      alert(`Insufficient pilots available.\nRequired: ${contract.requirements.minMechs}\nAvailable: ${availablePilots.length}\n\nHire additional pilots or wait for injured pilots to recover.`);
      return;
    }
    
    // Check weight limit
    const totalTonnage = availableMechs.slice(0, contract.requirements.maxMechs).reduce((total, mech) => total + mech.tonnage, 0);
    if (totalTonnage > contract.requirements.weightLimit) {
      alert(`Force exceeds weight limit.\nLimit: ${contract.requirements.weightLimit} tons\nCurrent: ${totalTonnage} tons\n\nAdjust your force composition.`);
      return;
    }
    
    // Move contract to active contracts
    const activeContracts = this.gameState.get('activeContracts') || [];
    activeContracts.push({
      ...contract,
      status: 'Active',
      startDate: Date.now(),
      endDate: Date.now() + (contract.duration * 24 * 60 * 60 * 1000),
      deployedForce: {
        mechs: availableMechs.slice(0, Math.min(contract.requirements.maxMechs, availableMechs.length)).map(m => m.id),
        pilots: availablePilots.slice(0, Math.min(contract.requirements.maxMechs, availablePilots.length)).map(p => p.id)
      }
    });
    
    // Remove from available contracts
    this.gameState.removeFromArray('contracts', c => c.id === contractId);
    this.gameState.set('activeContracts', activeContracts);
    
    // Update company reputation and advance time slightly
    const currentRep = this.gameState.get('company.reputation') || {};
    const contractRep = contract.rewards.reputation || {};
    Object.keys(contractRep).forEach(faction => {
      currentRep[faction] = (currentRep[faction] || 0) + Math.floor(contractRep[faction] * 0.1); // Small advance payment in reputation
    });
    this.gameState.set('company.reputation', currentRep);
    
    this.eventBus.emit('contract:accepted', { contract });
    this.logger.info(`Contract accepted: ${contract.name}`);
    
    const deploymentInfo = `
Contract: ${contract.name}
Employer: ${contract.employer}
Location: ${contract.location}
Duration: ${contract.duration} days
Payment: ${contract.payment.toLocaleString()} C-Bills
Salvage Rights: ${(contract.rewards.salvage * 100)}%

Your unit will deploy in 24 hours.

Objectives:
${contract.objectives.map(obj => '• ' + obj).join('\n')}`;
    
    alert(deploymentInfo);
  }

  /**
   * Handle game state changes
   */
  onGameStateChanged(data) {
    const { path } = data;
    
    // Update display if contracts array changed
    if (path === 'contracts' || path.startsWith('contracts.')) {
      this.updateContractsList();
    }
  }

  /**
   * Handle screen changes
   */
  onScreenChanged(data) {
    const { to } = data;
    
    // Update contracts when entering star map
    if (to === 'star-map') {
      this.updateContractsList();
      
      // Clear contract details if no contract selected
      if (!this.selectedContract) {
        const detailsElement = document.getElementById('contract-details');
        if (detailsElement) {
          detailsElement.innerHTML = `
            <h3>Select a Contract</h3>
            <p>Choose a contract from the list to view mission details and requirements.</p>
          `;
        }
      }
    }
  }

  /**
   * Generate unique contract ID
   */
  generateContractId() {
    return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get contract by ID
   */
  getContractById(contractId) {
    const contracts = this.gameState.get('contracts') || [];
    return contracts.find(contract => contract.id === contractId);
  }

  /**
   * Remove expired contracts
   */
  removeExpiredContracts() {
    const now = Date.now();
    const contracts = this.gameState.get('contracts') || [];
    const validContracts = contracts.filter(contract => contract.timeLimit > now);
    
    if (validContracts.length !== contracts.length) {
      this.gameState.set('contracts', validContracts);
      this.logger.info(`Removed ${contracts.length - validContracts.length} expired contracts`);
    }
  }

  /**
   * System update method (called by game loop)
   */
  update(deltaTime) {
    // Remove expired contracts
    this.removeExpiredContracts();
    
    // Process active contracts
    // Future implementation will handle contract progression
  }

  /**
   * Handle system start
   */
  async start() {
    this.logger.debug('ContractSystem started');
    
    // Initialize contracts display
    this.updateContractsList();
  }

  /**
   * Handle system stop
   */
  async stop() {
    this.selectedContract = null;
    this.logger.debug('ContractSystem stopped');
  }

  /**
   * Handle state loaded
   */
  onStateLoaded(gameState) {
    this.selectedContract = null;
    
    // Find selected contract if there is one
    const selectedContractId = gameState.selectedContract;
    if (selectedContractId) {
      this.selectedContract = this.getContractById(selectedContractId);
    }
    
    this.updateContractsList();
    this.logger.debug('ContractSystem state loaded');
  }

  /**
   * Shutdown the contract system
   */
  async shutdown() {
    this.selectedContract = null;
    this.isInitialized = false;
    this.logger.info('ContractSystem shutdown complete');
  }
}