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
    
    // Make hire pilot functions globally available
    window.showPilotHiring = () => {
      this.showPilotHiring();
    };
    
    window.hirePilot = (pilotId, hireCost, monthlySalary) => {
      this.hirePilot(pilotId, hireCost, monthlySalary);
    };
    
    window.closePilotHiring = () => {
      this.closePilotHiring();
    };
    
    // Negotiation functions (placeholder for future implementation)
    window.negotiateWithPilot = (pilotId) => {
      alert('Pilot negotiation system not yet implemented. This will allow you to negotiate salary and contract terms.');
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
        specialties: ['Assault Mechs', 'Urban Combat'],
        origin: 'Federated Suns',
        traits: ['Natural Leader', 'Steady Nerves'],
        age: 35,
        combatMissions: 87
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
        specialties: ['Light Mechs', 'Reconnaissance'],
        origin: 'Lyran Commonwealth',
        traits: ['Eagle Eye', 'Fast Learner'],
        age: 28,
        combatMissions: 42
      },
      { 
        name: 'Chen "Thunderbolt" Liu', 
        gunnery: 3, 
        piloting: 3, 
        experience: 'Veteran', 
        salary: 20000,
        id: this.generatePilotId(),
        status: 'Active',
        mechAssignment: null,
        backstory: 'Former Capellan Confederation warrior turned mercenary',
        specialties: ['Heavy Mechs', 'Close Combat'],
        origin: 'Capellan Confederation',
        traits: ['Aggressive', 'Weapon Specialist'],
        age: 32,
        combatMissions: 58
      },
      { 
        name: 'Sarah "Phoenix" Martinez', 
        gunnery: 4, 
        piloting: 3, 
        experience: 'Regular', 
        salary: 15000,
        id: this.generatePilotId(),
        status: 'Active',
        mechAssignment: null,
        backstory: 'Free Worlds League militia officer seeking adventure',
        specialties: ['Medium Mechs', 'Support'],
        origin: 'Free Worlds League',
        traits: ['Cautious', 'Team Player'],
        age: 26,
        combatMissions: 23
      }
    ];
    
    return defaultPilots;
  }

  /**
   * Generate comprehensive pilot pool for hiring
   */
  generatePilotPool() {
    const pilotPool = [
      // Elite Pilots (3 total)
      {
        name: 'Colonel James "Iron Wolf" Harrison',
        gunnery: 1,
        piloting: 2,
        experience: 'Elite',
        salary: 45000,
        backstory: 'Legendary former Davion Guards commander with over 100 successful missions',
        specialties: ['Command', 'Assault Mechs', 'Tactical Planning'],
        origin: 'Federated Suns',
        traits: ['Natural Leader', 'Inspiring', 'Combat Veteran'],
        age: 45,
        combatMissions: 127,
        hireCost: 50000,
        availability: 'Rare'
      },
      {
        name: 'Kommandant Greta "Steel Fist" Zimmerman',
        gunnery: 2,
        piloting: 1,
        experience: 'Elite',
        salary: 42000,
        backstory: 'Former Lyran Commonwealth elite pilot known for precision strikes',
        specialties: ['Assault Mechs', 'Marksmanship', 'Urban Combat'],
        origin: 'Lyran Commonwealth',
        traits: ['Marksman', 'Steady Nerves', 'Technical Aptitude'],
        age: 38,
        combatMissions: 95,
        hireCost: 45000,
        availability: 'Rare'
      },
      {
        name: 'Sao-shao Kenji "Ghost Walker" Nakamura',
        gunnery: 2,
        piloting: 2,
        experience: 'Elite',
        salary: 40000,
        backstory: 'Ex-Sword of Light regiment member, master of stealth tactics',
        specialties: ['Light Mechs', 'Stealth Operations', 'Night Combat'],
        origin: 'Draconis Combine',
        traits: ['Stealthy', 'Honor Bound', 'Disciplined'],
        age: 41,
        combatMissions: 89,
        hireCost: 40000,
        availability: 'Rare'
      },

      // Veteran Pilots (8 total)
      {
        name: 'Captain Rex "Bulldog" Morrison',
        gunnery: 3,
        piloting: 2,
        experience: 'Veteran',
        salary: 28000,
        backstory: 'Former Davion regular army officer with extensive combat experience',
        specialties: ['Heavy Mechs', 'Direct Assault', 'Leadership'],
        origin: 'Federated Suns',
        traits: ['Brave', 'Natural Leader', 'Determined'],
        age: 34,
        combatMissions: 71,
        hireCost: 25000,
        availability: 'Uncommon'
      },
      {
        name: 'Lieutenant Maya "Viper" Singh',
        gunnery: 2,
        piloting: 4,
        experience: 'Veteran',
        salary: 24000,
        backstory: 'Skilled light mech pilot from the Capellan Confederation',
        specialties: ['Light Mechs', 'Hit and Run', 'Reconnaissance'],
        origin: 'Capellan Confederation',
        traits: ['Fast Reflexes', 'Lucky', 'Eagle Eye'],
        age: 29,
        combatMissions: 56,
        hireCost: 20000,
        availability: 'Uncommon'
      },
      {
        name: 'Sergeant Klaus "Hammer" Weber',
        gunnery: 3,
        piloting: 3,
        experience: 'Veteran',
        salary: 26000,
        backstory: 'Lyran Commonwealth veteran specializing in fire support',
        specialties: ['Heavy Mechs', 'Long Range Combat', 'Fire Support'],
        origin: 'Lyran Commonwealth',
        traits: ['Marksman', 'Patient', 'Technical Aptitude'],
        age: 36,
        combatMissions: 63,
        hireCost: 22000,
        availability: 'Uncommon'
      },
      {
        name: 'Senior Tech Elena "Wrench" Volkov',
        gunnery: 4,
        piloting: 3,
        experience: 'Veteran',
        salary: 22000,
        backstory: 'Free Worlds League tech turned pilot with deep mechanical knowledge',
        specialties: ['Medium Mechs', 'Maintenance', 'Salvage Operations'],
        origin: 'Free Worlds League',
        traits: ['Technical Genius', 'Careful', 'Resourceful'],
        age: 31,
        combatMissions: 38,
        hireCost: 18000,
        availability: 'Common'
      },
      {
        name: 'Chu-i Yuki "Snow Fox" Tanaka',
        gunnery: 3,
        piloting: 3,
        experience: 'Veteran',
        salary: 25000,
        backstory: 'Former DCMS regular seeking honor in mercenary service',
        specialties: ['Medium Mechs', 'Honor Combat', 'Discipline'],
        origin: 'Draconis Combine',
        traits: ['Honor Bound', 'Disciplined', 'Steady Under Fire'],
        age: 33,
        combatMissions: 52,
        hireCost: 21000,
        availability: 'Uncommon'
      },
      {
        name: 'Captain Diana "Wildfire" Cross',
        gunnery: 2,
        piloting: 4,
        experience: 'Veteran',
        salary: 27000,
        backstory: 'Mercenary veteran with a reputation for daring tactics',
        specialties: ['Light Mechs', 'Flanking', 'Pursuit'],
        origin: 'Mercenary',
        traits: ['Daredevil', 'Quick Thinking', 'Aggressive'],
        age: 30,
        combatMissions: 67,
        hireCost: 23000,
        availability: 'Common'
      },
      {
        name: 'Major Viktor "Stone Wall" Petrov',
        gunnery: 4,
        piloting: 2,
        experience: 'Veteran',
        salary: 29000,
        backstory: 'Former Lyran assault pilot known for defensive expertise',
        specialties: ['Assault Mechs', 'Defensive Operations', 'Endurance'],
        origin: 'Lyran Commonwealth',
        traits: ['Stubborn', 'Defensive Expert', 'Endurance'],
        age: 37,
        combatMissions: 74,
        hireCost: 26000,
        availability: 'Uncommon'
      },
      {
        name: 'Lieutenant Jake "Longshot" Miller',
        gunnery: 2,
        piloting: 4,
        experience: 'Veteran',
        salary: 23000,
        backstory: 'Federated Suns sniper specialist with exceptional marksmanship',
        specialties: ['Long Range Combat', 'Precision Strikes', 'Patience'],
        origin: 'Federated Suns',
        traits: ['Eagle Eye', 'Patient', 'Marksman'],
        age: 32,
        combatMissions: 49,
        hireCost: 20000,
        availability: 'Common'
      },

      // Regular Pilots (10 total)
      {
        name: 'Sergeant Tim "Steady" Brooks',
        gunnery: 4,
        piloting: 3,
        experience: 'Regular',
        salary: 16000,
        backstory: 'Reliable Davion army sergeant with solid fundamentals',
        specialties: ['Medium Mechs', 'Standard Operations', 'Teamwork'],
        origin: 'Federated Suns',
        traits: ['Reliable', 'Team Player', 'Steady Nerves'],
        age: 28,
        combatMissions: 31,
        hireCost: 12000,
        availability: 'Common'
      },
      {
        name: 'Corporal Lisa "Bolt" Henderson',
        gunnery: 3,
        piloting: 4,
        experience: 'Regular',
        salary: 17000,
        backstory: 'Fast-moving scout from the Lyran Commonwealth',
        specialties: ['Light Mechs', 'Scouting', 'Communications'],
        origin: 'Lyran Commonwealth',
        traits: ['Fast Reflexes', 'Alert', 'Good Communication'],
        age: 25,
        combatMissions: 28,
        hireCost: 13000,
        availability: 'Common'
      },
      {
        name: 'Private Alex "Tank" Rodriguez',
        gunnery: 4,
        piloting: 4,
        experience: 'Regular',
        salary: 15000,
        backstory: 'Capellan militia member seeking better opportunities',
        specialties: ['Heavy Mechs', 'Endurance', 'Basic Tactics'],
        origin: 'Capellan Confederation',
        traits: ['Tough', 'Endurance', 'Determined'],
        age: 27,
        combatMissions: 19,
        hireCost: 11000,
        availability: 'Common'
      },
      {
        name: 'Technician Maria "Sparks" Gutierrez',
        gunnery: 5,
        piloting: 3,
        experience: 'Regular',
        salary: 14000,
        backstory: 'Former tech learning to pilot with mechanical expertise',
        specialties: ['Medium Mechs', 'Technical Knowledge', 'Maintenance'],
        origin: 'Free Worlds League',
        traits: ['Technical Knowledge', 'Careful', 'Learning'],
        age: 24,
        combatMissions: 12,
        hireCost: 10000,
        availability: 'Common'
      },
      {
        name: 'Lance Corporal David "Scout" Kim',
        gunnery: 4,
        piloting: 3,
        experience: 'Regular',
        salary: 16000,
        backstory: 'Draconis Combine regular army reconnaissance specialist',
        specialties: ['Light Mechs', 'Information Gathering', 'Stealth'],
        origin: 'Draconis Combine',
        traits: ['Observant', 'Quiet', 'Detail Oriented'],
        age: 26,
        combatMissions: 24,
        hireCost: 12000,
        availability: 'Common'
      },
      {
        name: 'Corporal Jenny "Firebrand" O\'Connor',
        gunnery: 3,
        piloting: 4,
        experience: 'Regular',
        salary: 17500,
        backstory: 'Aggressive young pilot from the Federated Suns periphery',
        specialties: ['Medium Mechs', 'Close Combat', 'Aggression'],
        origin: 'Federated Suns',
        traits: ['Aggressive', 'Hot Headed', 'Brave'],
        age: 23,
        combatMissions: 18,
        hireCost: 13000,
        availability: 'Common'
      },
      {
        name: 'Sergeant Paul "Fortress" Anderson',
        gunnery: 4,
        piloting: 3,
        experience: 'Regular',
        salary: 18000,
        backstory: 'Lyran defensive specialist with methodical approach',
        specialties: ['Heavy Mechs', 'Defensive Tactics', 'Patience'],
        origin: 'Lyran Commonwealth',
        traits: ['Defensive Minded', 'Patient', 'Methodical'],
        age: 30,
        combatMissions: 35,
        hireCost: 14000,
        availability: 'Common'
      },
      {
        name: 'Private Rosa "Quickdraw" Silva',
        gunnery: 3,
        piloting: 4,
        experience: 'Regular',
        salary: 16500,
        backstory: 'Capellan fast-attack specialist with natural reflexes',
        specialties: ['Light Mechs', 'Quick Strike', 'Evasion'],
        origin: 'Capellan Confederation',
        traits: ['Quick Draw', 'Fast Reflexes', 'Nimble'],
        age: 22,
        combatMissions: 16,
        hireCost: 12500,
        availability: 'Common'
      },
      {
        name: 'Corporal Mike "Steady Hand" Thompson',
        gunnery: 3,
        piloting: 4,
        experience: 'Regular',
        salary: 17000,
        backstory: 'Free Worlds League veteran with solid fundamentals',
        specialties: ['Medium Mechs', 'Gunnery', 'Reliability'],
        origin: 'Free Worlds League',
        traits: ['Steady Hands', 'Reliable', 'Good Instincts'],
        age: 29,
        combatMissions: 33,
        hireCost: 13000,
        availability: 'Common'
      },
      {
        name: 'Lance Corporal Aki "Precision" Sato',
        gunnery: 3,
        piloting: 4,
        experience: 'Regular',
        salary: 16000,
        backstory: 'Draconis Combine precision-focused pilot',
        specialties: ['Medium Mechs', 'Accuracy', 'Discipline'],
        origin: 'Draconis Combine',
        traits: ['Precise', 'Disciplined', 'Focused'],
        age: 25,
        combatMissions: 21,
        hireCost: 12000,
        availability: 'Common'
      },

      // Green Pilots (8 total)
      {
        name: 'Cadet Tommy "Greenhorn" Wilson',
        gunnery: 5,
        piloting: 4,
        experience: 'Green',
        salary: 8000,
        backstory: 'Fresh Davion academy graduate eager to prove himself',
        specialties: ['Basic Operations', 'Enthusiasm', 'Learning'],
        origin: 'Federated Suns',
        traits: ['Eager', 'Book Smart', 'Nervous'],
        age: 20,
        combatMissions: 2,
        hireCost: 5000,
        availability: 'Common'
      },
      {
        name: 'Recruit Sarah "Newbie" Clark',
        gunnery: 4,
        piloting: 5,
        experience: 'Green',
        salary: 9000,
        backstory: 'Young Lyran pilot with good reflexes but little experience',
        specialties: ['Light Mechs', 'Basic Piloting', 'Quick Learning'],
        origin: 'Lyran Commonwealth',
        traits: ['Quick Learner', 'Nervous Energy', 'Potential'],
        age: 19,
        combatMissions: 1,
        hireCost: 4000,
        availability: 'Common'
      },
      {
        name: 'Private Danny "Rookie" Martinez',
        gunnery: 5,
        piloting: 5,
        experience: 'Green',
        salary: 7500,
        backstory: 'Capellan militia recruit with basic training only',
        specialties: ['Basic Operations', 'Following Orders', 'Potential'],
        origin: 'Capellan Confederation',
        traits: ['Follows Orders', 'Cautious', 'Inexperienced'],
        age: 21,
        combatMissions: 0,
        hireCost: 3000,
        availability: 'Common'
      },
      {
        name: 'Cadet Emma "Fresh" Johnson',
        gunnery: 4,
        piloting: 5,
        experience: 'Green',
        salary: 8500,
        backstory: 'Free Worlds League academy graduate with theoretical knowledge',
        specialties: ['Theory', 'Basic Tactics', 'Study'],
        origin: 'Free Worlds League',
        traits: ['Studious', 'Theoretical Knowledge', 'Lacks Experience'],
        age: 20,
        combatMissions: 1,
        hireCost: 4500,
        availability: 'Common'
      },
      {
        name: 'Recruit Hiro "Student" Yamamoto',
        gunnery: 5,
        piloting: 4,
        experience: 'Green',
        salary: 9000,
        backstory: 'Draconis Combine student pilot with disciplined training',
        specialties: ['Discipline', 'Basic Combat', 'Honor'],
        origin: 'Draconis Combine',
        traits: ['Disciplined', 'Honor Bound', 'Inexperienced'],
        age: 19,
        combatMissions: 1,
        hireCost: 4000,
        availability: 'Common'
      },
      {
        name: 'Noble heir Lady Catherine "Silver Spoon" Steiner',
        gunnery: 4,
        piloting: 4,
        experience: 'Green',
        salary: 12000,
        backstory: 'Wealthy Lyran noble seeking adventure and glory',
        specialties: ['Resources', 'Social Connections', 'Potential'],
        origin: 'Lyran Commonwealth',
        traits: ['Wealthy', 'Connected', 'Privileged'],
        age: 22,
        combatMissions: 0,
        hireCost: 8000,
        availability: 'Rare'
      },
      {
        name: 'Tech Apprentice Ben "Grease Monkey" Porter',
        gunnery: 5,
        piloting: 5,
        experience: 'Green',
        salary: 7000,
        backstory: 'Former tech apprentice transitioning to pilot training',
        specialties: ['Technical Knowledge', 'Maintenance', 'Learning'],
        origin: 'Mercenary',
        traits: ['Technical Minded', 'Hands-On Learner', 'Inexperienced Pilot'],
        age: 18,
        combatMissions: 0,
        hireCost: 3500,
        availability: 'Common'
      },
      {
        name: 'Washout Eddie "Second Chance" Baker',
        gunnery: 5,
        piloting: 5,
        experience: 'Green',
        salary: 6500,
        backstory: 'Failed military academy student seeking redemption',
        specialties: ['Determination', 'Second Chances', 'Motivation'],
        origin: 'Federated Suns',
        traits: ['Determined', 'Chip on Shoulder', 'Motivated to Prove'],
        age: 24,
        combatMissions: 3,
        hireCost: 2500,
        availability: 'Common'
      }
    ];

    return pilotPool;
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
   * Show pilot hiring interface
   */
  showPilotHiring() {
    const availablePilots = this.generateAvailablePilots();
    this.displayHiringInterface(availablePilots);
    this.eventBus.emit('pilot:hiringInterfaceShown', { pilots: availablePilots });
  }

  /**
   * Generate available pilots for hiring based on company reputation and location
   */
  generateAvailablePilots() {
    const pilotPool = this.generatePilotPool();
    const companyRating = this.gameState.get('company.rating') || 'Green';
    const companyFunds = this.gameState.get('company.funds') || 0;
    
    // Filter pilots based on availability and company rating
    let availablePilots = pilotPool.filter(pilot => {
      // Elite companies attract more elite pilots
      if (companyRating === 'Elite' && Math.random() < 0.8) return true;
      if (companyRating === 'Veteran' && pilot.experience !== 'Elite' && Math.random() < 0.9) return true;
      if (companyRating === 'Regular' && pilot.experience === 'Green' || pilot.experience === 'Regular' && Math.random() < 0.8) return true;
      if (companyRating === 'Green' && (pilot.experience === 'Green' || (pilot.experience === 'Regular' && Math.random() < 0.3))) return true;
      
      return false;
    });

    // Limit to 5-8 available pilots at any time
    availablePilots = availablePilots.sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4) + 5);
    
    // Add status and current availability
    availablePilots.forEach(pilot => {
      pilot.id = this.generatePilotId();
      pilot.status = 'Available';
      pilot.mechAssignment = null;
      pilot.hiringDeadline = Date.now() + (Math.floor(Math.random() * 14 + 7) * 24 * 60 * 60 * 1000); // 7-21 days
    });

    return availablePilots;
  }

  /**
   * Display the pilot hiring interface
   */
  displayHiringInterface(pilots) {
    // Create hiring interface HTML
    const hiringHTML = `
      <div id="pilot-hiring-overlay" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; justify-content: center; align-items: center;">
        <div class="hiring-interface" style="background: #2a2a2a; border: 2px solid #555; border-radius: 8px; max-width: 90%; max-height: 90%; overflow-y: auto; padding: 20px;">
          <div class="hiring-header">
            <h2 style="color: #fff; margin-bottom: 10px;">Available Pilots for Hire</h2>
            <p style="color: #ccc; margin-bottom: 20px;">Company Funds: ${this.gameState.get('company.funds', 0).toLocaleString()} C-Bills</p>
            <button onclick="closePilotHiring()" style="float: right; background: #666; color: white; border: none; padding: 5px 10px; cursor: pointer;">Close</button>
          </div>
          <div class="pilot-hiring-list">
            ${pilots.map(pilot => this.generatePilotHiringCard(pilot)).join('')}
          </div>
        </div>
      </div>
    `;

    // Add to DOM
    document.body.insertAdjacentHTML('beforeend', hiringHTML);
  }

  /**
   * Generate HTML card for pilot hiring
   */
  generatePilotHiringCard(pilot) {
    const companyFunds = this.gameState.get('company.funds') || 0;
    const canAfford = companyFunds >= pilot.hireCost;
    const daysRemaining = Math.ceil((pilot.hiringDeadline - Date.now()) / (24 * 60 * 60 * 1000));
    
    return `
      <div class="pilot-hiring-card" style="border: 1px solid #555; margin-bottom: 15px; padding: 15px; background: #333; border-radius: 5px;">
        <div class="pilot-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="color: #fff; margin: 0;">${pilot.name}</h3>
          <span class="experience-badge ${pilot.experience.toLowerCase()}" style="padding: 3px 8px; border-radius: 3px; font-size: 12px; background: ${this.getExperienceColor(pilot.experience)};">${pilot.experience}</span>
        </div>
        
        <div class="pilot-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
          <div style="color: #ccc;">Gunnery: ${pilot.gunnery}</div>
          <div style="color: #ccc;">Piloting: ${pilot.piloting}</div>
          <div style="color: #ccc;">Origin: ${pilot.origin}</div>
          <div style="color: #ccc;">Age: ${pilot.age}</div>
          <div style="color: #ccc;">Missions: ${pilot.combatMissions}</div>
          <div style="color: #ccc;">Monthly Salary: ${pilot.salary.toLocaleString()} C-Bills</div>
        </div>
        
        <div class="pilot-details" style="margin-bottom: 10px;">
          <p style="color: #ddd; font-size: 14px; margin: 5px 0;"><strong>Background:</strong> ${pilot.backstory}</p>
          <p style="color: #ddd; font-size: 14px; margin: 5px 0;"><strong>Specialties:</strong> ${pilot.specialties.join(', ')}</p>
          <p style="color: #ddd; font-size: 14px; margin: 5px 0;"><strong>Traits:</strong> ${pilot.traits.join(', ')}</p>
        </div>
        
        <div class="pilot-hiring-actions" style="display: flex; justify-content: space-between; align-items: center;">
          <div class="hiring-info">
            <div style="color: #${canAfford ? 'fff' : 'f44'}; font-weight: bold;">Hiring Fee: ${pilot.hireCost.toLocaleString()} C-Bills</div>
            <div style="color: #ccc; font-size: 12px;">Available for ${daysRemaining} more days</div>
          </div>
          <button 
            onclick="hirePilot('${pilot.id}', ${pilot.hireCost}, ${pilot.salary})" 
            style="background: ${canAfford ? '#4a4' : '#666'}; color: white; border: none; padding: 8px 15px; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; border-radius: 3px;"
            ${!canAfford ? 'disabled' : ''}
          >
            ${canAfford ? 'Hire Pilot' : 'Insufficient Funds'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Get color for experience level
   */
  getExperienceColor(experience) {
    switch (experience) {
      case 'Elite': return '#ff6b35';
      case 'Veteran': return '#4ecdc4';
      case 'Regular': return '#45b7d1';
      case 'Green': return '#96ceb4';
      default: return '#999';
    }
  }

  /**
   * Hire a pilot
   */
  hirePilot(pilotId, hireCost, monthlySalary) {
    const companyFunds = this.gameState.get('company.funds') || 0;
    
    if (companyFunds < hireCost) {
      alert('Insufficient funds to hire this pilot.');
      return;
    }

    // Find pilot in available pool (this would normally be stored somewhere)
    const pilotPool = this.generatePilotPool();
    const pilot = pilotPool.find(p => p.id === pilotId || p.name === pilotId); // Fallback for name matching
    
    if (!pilot) {
      alert('Pilot no longer available.');
      return;
    }

    // Deduct hiring cost
    this.gameState.set('company.funds', companyFunds - hireCost);
    
    // Add pilot to roster
    const currentPilots = this.gameState.get('pilots') || [];
    const newPilot = {
      ...pilot,
      id: this.generatePilotId(),
      status: 'Active',
      mechAssignment: null,
      dateHired: Date.now()
    };
    
    currentPilots.push(newPilot);
    this.gameState.set('pilots', currentPilots);
    
    // Update company expenses
    const currentSalaries = this.gameState.get('company.expenses.salaries') || 0;
    this.gameState.set('company.expenses.salaries', currentSalaries + monthlySalary);
    
    // Close hiring interface
    this.closePilotHiring();
    
    this.eventBus.emit('pilot:hired', { pilot: newPilot, hireCost, monthlySalary });
    this.logger.info(`Pilot hired: ${newPilot.name} for ${hireCost.toLocaleString()} C-Bills`);
    
    alert(`${newPilot.name} has been hired! Welcome to the unit, ${newPilot.experience} pilot.`);
  }

  /**
   * Close pilot hiring interface
   */
  closePilotHiring() {
    const overlay = document.getElementById('pilot-hiring-overlay');
    if (overlay) {
      overlay.remove();
    }
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