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
    const baseTypes = ['Garrison', 'Raid', 'Search and Destroy'];
    
    if (rating === 'Regular' || rating === 'Veteran' || rating === 'Elite') {
      baseTypes.push('Objective Raid', 'Recon');
    }
    
    if (rating === 'Veteran' || rating === 'Elite') {
      baseTypes.push('Extraction', 'Planetary Assault');
    }
    
    return baseTypes;
  }

  /**
   * Generate a single contract
   */
  generateContract(type, companyRating, reputation) {
    const employers = ['Federated Suns', 'Lyran Commonwealth', 'Capellan Confederation', 'Free Worlds League', 'Draconis Combine', 'Local Government', 'Corporate Client'];
    const locations = ['Broken Wheel', 'Sheratan', 'New Avalon', 'Tharkad', 'Sian', 'Atreus', 'Luthien'];
    
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
      timeLimit: Date.now() + (Math.floor(Math.random() * 14 + 7) * 24 * 60 * 60 * 1000) // 7-21 days
    };
  }

  /**
   * Calculate base payment for contract
   */
  calculateBasePayment(type, rating) {
    const baseRates = {
      'Garrison': 80000,
      'Raid': 100000,
      'Search and Destroy': 120000,
      'Objective Raid': 150000,
      'Recon': 90000,
      'Extraction': 180000,
      'Planetary Assault': 250000
    };
    
    const ratingMultiplier = {
      'Green': 0.8,
      'Regular': 1.0,
      'Veteran': 1.3,
      'Elite': 1.6
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
      'Garrison': 0.1,
      'Raid': 0.2,
      'Search and Destroy': 0.3,
      'Objective Raid': 0.25,
      'Recon': 0.15,
      'Extraction': 0.2,
      'Planetary Assault': 0.4
    };
    
    const repGain = Math.floor(Math.random() * 10) + 5; // 5-15 reputation
    
    return {
      payment: basePayment,
      salvage: salvageRates[type] || 0.2,
      reputation: { [employer]: repGain }
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
      'Garrison': `${employer} requires a reliable mercenary unit to provide security for facilities on ${location}. Standard garrison duties include perimeter patrols and response to minor incidents.`,
      'Raid': `${employer} has authorized a strike against enemy positions on ${location}. Primary objectives include disrupting enemy operations and eliminating key targets.`,
      'Search and Destroy': `Hostile forces have been identified in the ${location} region. ${employer} requests immediate action to locate and eliminate these threats to ensure regional stability.`
    };
    
    return descriptions[type] || `${employer} has contracted mercenary services for operations on ${location}. Mission details will be provided upon contract acceptance.`;
  }

  /**
   * Calculate contract duration
   */
  calculateDuration(type) {
    const durations = {
      'Garrison': 30 + Math.floor(Math.random() * 60), // 30-90 days
      'Raid': 7 + Math.floor(Math.random() * 14), // 7-21 days
      'Search and Destroy': 14 + Math.floor(Math.random() * 21), // 14-35 days
      'Objective Raid': 3 + Math.floor(Math.random() * 7), // 3-10 days
      'Recon': 10 + Math.floor(Math.random() * 20), // 10-30 days
      'Extraction': 1 + Math.floor(Math.random() * 5), // 1-5 days
      'Planetary Assault': 60 + Math.floor(Math.random() * 120) // 60-180 days
    };
    
    return durations[type] || 21;
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
    
    if (availableMechs.length < contract.requirements.minMechs) {
      alert(`Insufficient mechs available. Required: ${contract.requirements.minMechs}, Available: ${availableMechs.length}`);
      return;
    }
    
    // Move contract to active contracts
    const activeContracts = this.gameState.get('activeContracts') || [];
    activeContracts.push({
      ...contract,
      status: 'Active',
      startDate: Date.now(),
      endDate: Date.now() + (contract.duration * 24 * 60 * 60 * 1000)
    });
    
    // Remove from available contracts
    this.gameState.removeFromArray('contracts', c => c.id === contractId);
    this.gameState.set('activeContracts', activeContracts);
    
    this.eventBus.emit('contract:accepted', { contract });
    this.logger.info(`Contract accepted: ${contract.name}`);
    
    alert(`Contract "${contract.name}" accepted! Your unit will deploy in 24 hours.`);
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