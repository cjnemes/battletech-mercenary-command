/**
 * Faction System - Manages Great House relationships, reputation, and political dynamics
 * Handles faction standings, contract availability, and diplomatic consequences
 */
import { Logger } from '../../utils/Logger.js';

export class FactionSystem {
  constructor(eventBus, gameState) {
    this.logger = new Logger('FactionSystem');
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.isInitialized = false;
  }

  /**
   * Initialize the faction system
   */
  async initialize() {
    try {
      this.logger.info('Initializing FactionSystem...');
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize faction data
      this.initializeFactions();
      
      this.isInitialized = true;
      this.logger.info('FactionSystem initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize FactionSystem:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Contract completion affects reputation
    this.eventBus.on('contract:completed', this.onContractCompleted.bind(this));
    
    // Combat actions can affect faction relationships
    this.eventBus.on('combat:enemyDestroyed', this.onEnemyDestroyed.bind(this));
    
    // Time passage affects faction relationships
    this.eventBus.on('time:monthPassed', this.onMonthPassed.bind(this));
    
    this.logger.debug('FactionSystem event listeners setup complete');
  }

  /**
   * Initialize faction data if not present
   */
  initializeFactions() {
    let factionData = this.gameState.get('factions');
    
    if (!factionData) {
      factionData = this.createDefaultFactionData();
      this.gameState.set('factions', factionData);
    }
    
    // Ensure reputation object exists
    let reputation = this.gameState.get('company.reputation');
    if (!reputation) {
      reputation = {};
      Object.keys(factionData).forEach(faction => {
        reputation[faction] = 0; // Neutral starting reputation
      });
      this.gameState.set('company.reputation', reputation);
    }
  }

  /**
   * Create default faction data with comprehensive Great Houses information
   */
  createDefaultFactionData() {
    return {
      // The Great Houses
      'Federated Suns': {
        fullName: 'Federated Suns',
        leader: 'Prince Hanse Davion',
        capital: 'New Avalon',
        color: '#FFD700', // Gold
        symbol: '🦅',
        description: 'The Federated Suns values military excellence and technological advancement. Known for their elite Davion Guards and NAIS research.',
        traits: ['Military Focus', 'Technology Advancement', 'Honor'],
        allies: ['Lyran Commonwealth'],
        enemies: ['Capellan Confederation', 'Draconis Combine'],
        neutral: ['Free Worlds League'],
        contractTypes: ['Garrison', 'Raid', 'Anti-Piracy', 'Training Exercise'],
        militaryUnits: ['Davion Guards', 'Federated Suns Armored Cavalry', 'New Avalon Institute of Science'],
        territory: ['New Avalon', 'Robinson', 'Davion Guard', 'Broken Wheel', 'Galtor'],
        economicPower: 85,
        militaryStrength: 90,
        politicalStability: 80
      },

      'Lyran Commonwealth': {
        fullName: 'Lyran Commonwealth',
        leader: 'Archon Katrina Steiner',
        capital: 'Tharkad',
        color: '#4169E1', // Royal Blue
        symbol: '👑',
        description: 'The Lyran Commonwealth is the wealthiest of the Great Houses, known for their advanced industry and heavy mechs.',
        traits: ['Industrial Might', 'Heavy Mechs', 'Wealth'],
        allies: ['Federated Suns'],
        enemies: ['Free Worlds League', 'Draconis Combine'],
        neutral: ['Capellan Confederation'],
        contractTypes: ['Garrison', 'Facility Defense', 'VIP Protection', 'Industrial Security'],
        militaryUnits: ['Lyran Guards', 'Steiner Regulars', 'Lyran Reserves'],
        territory: ['Tharkad', 'Steiner', 'Arc-Royal', 'Solaris VII', 'Hesperus II'],
        economicPower: 95,
        militaryStrength: 75,
        politicalStability: 70
      },

      'Capellan Confederation': {
        fullName: 'Capellan Confederation',
        leader: 'Chancellor Maximilian Liao',
        capital: 'Sian',
        color: '#228B22', // Forest Green
        symbol: '🐉',
        description: 'The Capellan Confederation relies on espionage, political maneuvering, and unconventional warfare tactics.',
        traits: ['Espionage', 'Political Intrigue', 'Unconventional Warfare'],
        allies: [],
        enemies: ['Federated Suns', 'Free Worlds League'],
        neutral: ['Lyran Commonwealth', 'Draconis Combine'],
        contractTypes: ['Counter-Intelligence', 'Sabotage', 'Special Operations', 'Recon'],
        militaryUnits: ['Capellan Guards', 'Warrior Lodges', 'St. Ives Lancers'],
        territory: ['Sian', 'Capella', 'Liao', 'St. Ives', 'Menke'],
        economicPower: 60,
        militaryStrength: 65,
        politicalStability: 55
      },

      'Free Worlds League': {
        fullName: 'Free Worlds League',
        leader: 'Captain-General Janos Marik',
        capital: 'Atreus',
        color: '#800080', // Purple
        symbol: '🏛️',
        description: 'The Free Worlds League is a loose confederation of member states with varying loyalties and internal conflicts.',
        traits: ['Political Fragmentation', 'Independence', 'Mercenary Friendly'],
        allies: [],
        enemies: ['Lyran Commonwealth', 'Capellan Confederation'],
        neutral: ['Federated Suns', 'Draconis Combine'],
        contractTypes: ['Garrison', 'Patrol', 'Border Security', 'Internal Security'],
        militaryUnits: ['Marik Guards', 'Free Worlds Legionnaires', 'Knights of the Inner Sphere'],
        territory: ['Atreus', 'Marik', 'Oriente', 'Regulus', 'Andurien'],
        economicPower: 70,
        militaryStrength: 70,
        politicalStability: 45
      },

      'Draconis Combine': {
        fullName: 'Draconis Combine',
        leader: 'Coordinator Takashi Kurita',
        capital: 'Luthien',
        color: '#DC143C', // Crimson
        symbol: '⚔️',
        description: 'The Draconis Combine follows the ancient traditions of Bushido and maintains strict military discipline.',
        traits: ['Honor', 'Military Discipline', 'Ancient Traditions'],
        allies: [],
        enemies: ['Federated Suns', 'Lyran Commonwealth'],
        neutral: ['Capellan Confederation', 'Free Worlds League'],
        contractTypes: ['Honor Combat', 'Raid', 'Border Patrol', 'Training'],
        militaryUnits: ['Sword of Light', 'Ghost Regiments', 'Ryuken Regiments'],
        territory: ['Luthien', 'Kurita', 'Pesht', 'Dieron', 'Kimura'],
        economicPower: 75,
        militaryStrength: 85,
        politicalStability: 75
      },

      // Major Mercenary Organizations
      'Mercenary Review Board': {
        fullName: 'Mercenary Review and Bonding Commission',
        leader: 'Director General Sarah Mitchell',
        capital: 'Galatea',
        color: '#808080', // Gray
        symbol: '⚖️',
        description: 'The MRBC regulates mercenary activities and maintains the bonding system for contract security.',
        traits: ['Regulation', 'Contract Enforcement', 'Neutral Arbiter'],
        allies: [],
        enemies: [],
        neutral: ['All Great Houses'],
        contractTypes: ['Arbitration', 'Investigation', 'Regulatory Compliance'],
        militaryUnits: ['MRBC Security Forces'],
        territory: ['Galatea', 'Outreach'],
        economicPower: 50,
        militaryStrength: 30,
        politicalStability: 90
      },

      'ComStar': {
        fullName: 'ComStar',
        leader: 'Primus Julian Tiepolo',
        capital: 'Terra',
        color: '#FFA500', // Orange
        symbol: '📡',
        description: 'ComStar maintains interstellar communications and holds significant political influence behind the scenes.',
        traits: ['Communication Control', 'Mysticism', 'Hidden Agenda'],
        allies: [],
        enemies: [],
        neutral: ['All Great Houses'],
        contractTypes: ['Communication Security', 'Technology Recovery', 'Special Operations'],
        militaryUnits: ['ComStar Guards', 'ROM (Research and Operations)'],
        territory: ['Terra', 'HPG Stations'],
        economicPower: 80,
        militaryStrength: 40,
        politicalStability: 85
      },

      // Pirate Organizations
      'Pirate Kingdoms': {
        fullName: 'Various Pirate Organizations',
        leader: 'Multiple Pirate Lords',
        capital: 'Various',
        color: '#8B0000', // Dark Red
        symbol: '☠️',
        description: 'Organized pirate groups that prey on trade routes and raid planetary settlements.',
        traits: ['Raiding', 'Lawlessness', 'Opportunistic'],
        allies: [],
        enemies: ['All Great Houses', 'Mercenary Organizations'],
        neutral: [],
        contractTypes: [],
        militaryUnits: ['Pirate Bands', 'Raider Groups'],
        territory: ['Periphery Worlds', 'Asteroid Bases'],
        economicPower: 30,
        militaryStrength: 50,
        politicalStability: 20
      }
    };
  }

  /**
   * Get reputation with a specific faction
   */
  getReputation(factionName) {
    const reputation = this.gameState.get('company.reputation') || {};
    return reputation[factionName] || 0;
  }

  /**
   * Modify reputation with a faction
   */
  modifyReputation(factionName, change, reason = '') {
    const currentRep = this.getReputation(factionName);
    const newRep = Math.max(-100, Math.min(100, currentRep + change));
    
    // Update reputation
    const reputation = this.gameState.get('company.reputation') || {};
    reputation[factionName] = newRep;
    this.gameState.set('company.reputation', reputation);
    
    // Log the change
    this.logger.info(`Reputation with ${factionName}: ${currentRep} -> ${newRep} (${change > 0 ? '+' : ''}${change}) ${reason}`);
    
    // Check for allied/enemy faction effects
    this.processReputationEffects(factionName, change);
    
    this.eventBus.emit('faction:reputationChanged', {
      faction: factionName,
      oldReputation: currentRep,
      newReputation: newRep,
      change: change,
      reason: reason
    });
    
    return newRep;
  }

  /**
   * Process secondary effects of reputation changes
   */
  processReputationEffects(factionName, change) {
    const factionData = this.gameState.get('factions') || {};
    const faction = factionData[factionName];
    
    if (!faction) return;
    
    // Positive reputation with a faction affects their allies positively (but less)
    if (change > 0) {
      faction.allies?.forEach(ally => {
        const allyEffect = Math.floor(change * 0.3); // 30% of original effect
        if (allyEffect > 0) {
          this.modifyReputation(ally, allyEffect, `(Allied with ${factionName})`);
        }
      });
      
      // Negative effect on enemies (but smaller)
      faction.enemies?.forEach(enemy => {
        const enemyEffect = Math.floor(change * -0.2); // 20% negative effect
        if (enemyEffect < 0) {
          this.modifyReputation(enemy, enemyEffect, `(Enemy of ${factionName})`);
        }
      });
    }
    
    // Negative reputation effects
    if (change < 0) {
      faction.allies?.forEach(ally => {
        const allyEffect = Math.floor(change * 0.2); // 20% of original effect
        if (allyEffect < 0) {
          this.modifyReputation(ally, allyEffect, `(Allied with ${factionName})`);
        }
      });
      
      // Small positive effect on enemies (enemy of my enemy)
      faction.enemies?.forEach(enemy => {
        const enemyEffect = Math.floor(Math.abs(change) * 0.1); // 10% positive effect
        if (enemyEffect > 0) {
          this.modifyReputation(enemy, enemyEffect, `(Enemy of ${factionName})`);
        }
      });
    }
  }

  /**
   * Get reputation level description
   */
  getReputationLevel(reputation) {
    if (reputation >= 80) return 'Allied';
    if (reputation >= 60) return 'Trusted';
    if (reputation >= 40) return 'Friendly';
    if (reputation >= 20) return 'Favorable';
    if (reputation >= -20) return 'Neutral';
    if (reputation >= -40) return 'Unfavorable';
    if (reputation >= -60) return 'Hostile';
    if (reputation >= -80) return 'Enemy';
    return 'Hated';
  }

  /**
   * Get faction information
   */
  getFactionInfo(factionName) {
    const factionData = this.gameState.get('factions') || {};
    const faction = factionData[factionName];
    
    if (!faction) return null;
    
    const reputation = this.getReputation(factionName);
    const reputationLevel = this.getReputationLevel(reputation);
    
    return {
      ...faction,
      currentReputation: reputation,
      reputationLevel: reputationLevel,
      contractAvailability: this.calculateContractAvailability(factionName, reputation)
    };
  }

  /**
   * Calculate contract availability based on reputation
   */
  calculateContractAvailability(factionName, reputation) {
    // Base availability
    let availability = 0.5; // 50% base
    
    // Reputation modifies availability
    if (reputation >= 60) availability = 0.9;      // Trusted: 90%
    else if (reputation >= 40) availability = 0.8; // Friendly: 80%
    else if (reputation >= 20) availability = 0.7; // Favorable: 70%
    else if (reputation >= 0) availability = 0.6;  // Neutral+: 60%
    else if (reputation >= -20) availability = 0.4; // Neutral-: 40%
    else if (reputation >= -40) availability = 0.2; // Unfavorable: 20%
    else availability = 0.1; // Hostile: 10%
    
    return availability;
  }

  /**
   * Get all faction summaries for display
   */
  getAllFactionSummaries() {
    const factionData = this.gameState.get('factions') || {};
    const summaries = [];
    
    Object.keys(factionData).forEach(factionName => {
      const info = this.getFactionInfo(factionName);
      if (info) {
        summaries.push({
          name: factionName,
          reputation: info.currentReputation,
          level: info.reputationLevel,
          color: info.color,
          symbol: info.symbol,
          availability: info.contractAvailability
        });
      }
    });
    
    return summaries.sort((a, b) => b.reputation - a.reputation);
  }

  /**
   * Handle contract completion effects
   */
  onContractCompleted(data) {
    const { contract, success, performance } = data;
    
    if (!contract) return;
    
    let baseRepGain = contract.rewards.reputation[contract.employer] || 10;
    
    // Modify based on performance
    if (performance === 'excellent') baseRepGain = Math.floor(baseRepGain * 1.5);
    else if (performance === 'poor') baseRepGain = Math.floor(baseRepGain * 0.5);
    else if (!success) baseRepGain = Math.floor(baseRepGain * -0.5); // Failed contracts hurt reputation
    
    this.modifyReputation(contract.employer, baseRepGain, `Contract: ${contract.name}`);
    
    this.logger.info(`Contract completed: ${contract.name} for ${contract.employer} - Rep gain: ${baseRepGain}`);
  }

  /**
   * Handle enemy destruction in combat
   */
  onEnemyDestroyed(data) {
    const { enemyFaction, location, circumstances } = data;
    
    if (enemyFaction && enemyFaction !== 'Pirate Kingdoms') {
      // Destroying faction units hurts reputation
      const repLoss = -5;
      this.modifyReputation(enemyFaction, repLoss, `Combat loss at ${location}`);
    }
  }

  /**
   * Handle monthly reputation decay/changes
   */
  onMonthPassed(data) {
    // Small decay toward neutral over time
    const reputation = this.gameState.get('company.reputation') || {};
    
    Object.keys(reputation).forEach(faction => {
      const currentRep = reputation[faction];
      
      // Decay toward zero (neutral) - very slow
      if (currentRep > 0) {
        reputation[faction] = Math.max(0, currentRep - 0.5);
      } else if (currentRep < 0) {
        reputation[faction] = Math.min(0, currentRep + 0.5);
      }
    });
    
    this.gameState.set('company.reputation', reputation);
  }

  /**
   * Display faction overview interface
   */
  showFactionOverview() {
    const summaries = this.getAllFactionSummaries();
    const overviewHTML = this.generateFactionOverviewHTML(summaries);
    
    // Add to DOM
    document.body.insertAdjacentHTML('beforeend', overviewHTML);
  }

  /**
   * Generate HTML for faction overview
   */
  generateFactionOverviewHTML(summaries) {
    return `
      <div id="faction-overview-overlay" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; justify-content: center; align-items: center;">
        <div class="faction-interface" style="background: #2a2a2a; border: 2px solid #555; border-radius: 8px; max-width: 90%; max-height: 90%; overflow-y: auto; padding: 20px; color: white;">
          <div class="faction-header">
            <h2 style="color: #fff; margin-bottom: 10px;">Faction Standing Report - 3025</h2>
            <p style="color: #ccc; margin-bottom: 20px;">Your mercenary unit's reputation across the Inner Sphere</p>
            <button onclick="closeFactionOverview()" style="float: right; background: #666; color: white; border: none; padding: 5px 10px; cursor: pointer;">Close</button>
          </div>
          <div class="faction-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
            ${summaries.map(faction => this.generateFactionCard(faction)).join('')}
          </div>
          <div class="faction-legend" style="margin-top: 20px; padding: 15px; background: #333; border-radius: 5px;">
            <h4>Reputation Levels:</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-top: 10px;">
              <span style="color: #0f0;">Allied (80+)</span>
              <span style="color: #4f4;">Trusted (60+)</span>
              <span style="color: #8f8;">Friendly (40+)</span>
              <span style="color: #ff8;">Favorable (20+)</span>
              <span style="color: #ccc;">Neutral (±20)</span>
              <span style="color: #f88;">Unfavorable (-20-)</span>
              <span style="color: #f44;">Hostile (-40-)</span>
              <span style="color: #f00;">Enemy (-60-)</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate faction card HTML
   */
  generateFactionCard(faction) {
    const repColor = this.getReputationColor(faction.reputation);
    const availabilityPercent = Math.round(faction.availability * 100);
    
    return `
      <div class="faction-card" style="border: 1px solid #555; padding: 15px; background: #333; border-radius: 5px;">
        <div class="faction-header" style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 24px; margin-right: 10px;">${faction.symbol}</span>
          <div>
            <h3 style="margin: 0; color: ${faction.color};">${faction.name}</h3>
            <span class="rep-level" style="color: ${repColor}; font-weight: bold;">${faction.level}</span>
          </div>
        </div>
        
        <div class="reputation-bar" style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
            <span style="font-size: 12px;">Reputation</span>
            <span style="font-size: 12px; color: ${repColor};">${faction.reputation}</span>
          </div>
          <div style="background: #444; height: 15px; border-radius: 3px; overflow: hidden;">
            <div style="width: ${Math.abs(faction.reputation)}%; height: 100%; background: ${repColor}; transition: width 0.3s;"></div>
          </div>
        </div>
        
        <div class="faction-stats" style="font-size: 12px; color: #ccc;">
          <div>Contract Availability: ${availabilityPercent}%</div>
        </div>
      </div>
    `;
  }

  /**
   * Get color for reputation value
   */
  getReputationColor(reputation) {
    if (reputation >= 60) return '#0f0';      // Green - Trusted/Allied
    if (reputation >= 40) return '#4f4';      // Light Green - Friendly
    if (reputation >= 20) return '#8f8';      // Pale Green - Favorable
    if (reputation >= -20) return '#ccc';     // Gray - Neutral
    if (reputation >= -40) return '#f88';     // Light Red - Unfavorable
    if (reputation >= -60) return '#f44';     // Red - Hostile
    return '#f00';                            // Dark Red - Enemy/Hated
  }

  /**
   * Close faction overview
   */
  closeFactionOverview() {
    const overlay = document.getElementById('faction-overview-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Setup UI handlers
   */
  setupUIHandlers() {
    window.showFactionOverview = () => {
      this.showFactionOverview();
    };
    
    window.closeFactionOverview = () => {
      this.closeFactionOverview();
    };
  }

  /**
   * System update method (called by game loop)
   */
  update(deltaTime) {
    // Currently no time-based updates needed beyond monthly processing
  }

  /**
   * Handle system start
   */
  async start() {
    this.logger.debug('FactionSystem started');
    this.setupUIHandlers();
  }

  /**
   * Handle system stop
   */
  async stop() {
    this.logger.debug('FactionSystem stopped');
  }

  /**
   * Handle state loaded
   */
  onStateLoaded(gameState) {
    this.initializeFactions();
    this.logger.debug('FactionSystem state loaded');
  }

  /**
   * Shutdown the faction system
   */
  async shutdown() {
    this.isInitialized = false;
    this.logger.info('FactionSystem shutdown complete');
  }
}