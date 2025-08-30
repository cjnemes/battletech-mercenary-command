/**
 * Company System - Manages overall mercenary company operations
 * Handles finances, reputation, time progression, and company management
 */
import { Logger } from '../../utils/Logger.js';

export class CompanySystem {
  constructor(eventBus, gameState) {
    this.logger = new Logger('CompanySystem');
    this.eventBus = eventBus;
    this.gameState = gameState;
    this.isInitialized = false;
    this.monthlyExpensesTimer = 0;
    this.monthlyInterval = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  }

  /**
   * Initialize the company system
   */
  async initialize() {
    try {
      this.logger.info('Initializing CompanySystem...');
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Initialize UI handlers
      this.setupUIHandlers();
      
      this.isInitialized = true;
      this.logger.info('CompanySystem initialized successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize CompanySystem:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Company management events
    this.eventBus.on('company:advanceTime', this.advanceTime.bind(this));
    this.eventBus.on('company:payExpenses', this.payMonthlyExpenses.bind(this));
    this.eventBus.on('company:updateFinances', this.updateFinancialDisplay.bind(this));
    
    // Game events that affect company
    this.eventBus.on('pilot:hired', this.onPilotHired.bind(this));
    this.eventBus.on('pilot:fired', this.onPilotFired.bind(this));
    this.eventBus.on('contract:completed', this.onContractCompleted.bind(this));
    
    // UI update events
    this.eventBus.on('gameState:changed', this.onGameStateChanged.bind(this));
    this.eventBus.on('screen:changed', this.onScreenChanged.bind(this));
    
    this.logger.debug('CompanySystem event listeners setup complete');
  }

  /**
   * Setup UI event handlers for direct DOM interaction compatibility
   */
  setupUIHandlers() {
    // Make time advancement function globally available
    window.advanceTime = () => {
      this.eventBus.emit('company:advanceTime', { days: 7 });
    };
    
    // Make company management functions globally available
    window.showCompanyOverview = () => {
      this.showCompanyOverview();
    };
    
    window.closeCompanyOverview = () => {
      this.closeCompanyOverview();
    };
  }

  /**
   * Initialize new company with default values
   */
  initializeNewCompany() {
    const companyData = {
      name: "Wolf's Dragoons",
      callsign: "Alpha Company",
      established: Date.now(),
      funds: 500000,
      rating: 'Green',
      reputation: {}, // Will be initialized by FactionSystem
      expenses: {
        monthly: 45000,
        salaries: 0,
        maintenance: 0,
        insurance: 25000,
        overhead: 20000,
        miscellaneous: 0
      },
      income: {
        monthly: 0,
        contracts: 0,
        investments: 0,
        salvage: 0
      },
      statistics: {
        contractsCompleted: 0,
        contractsSuccessful: 0,
        unitsDestroyed: 0,
        pilotsLost: 0,
        mechsLost: 0,
        totalEarnings: 0,
        totalExpenses: 0,
        timeInService: 0
      },
      progression: {
        experience: 0,
        nextRatingThreshold: 1000,
        specializations: [],
        achievements: []
      },
      operations: {
        currentLocation: 'Galatea',
        operationalReadiness: 'Ready',
        supplyLevel: 'Adequate',
        moraleLevel: 'Good'
      }
    };
    
    // Initialize time tracking
    const timeData = {
      year: 3025,
      month: 1,
      day: 1,
      gameStartTime: Date.now(),
      lastUpdate: Date.now()
    };
    
    this.gameState.set('time', timeData);
    
    return companyData;
  }

  /**
   * Get company rating requirements and benefits
   */
  getRatingInfo() {
    return {
      'Green': {
        experienceRequired: 0,
        contractMultiplier: 0.8,
        availableContracts: ['Garrison', 'Patrol', 'Escort', 'Training Exercise'],
        description: 'New mercenary unit with basic training and limited experience',
        benefits: ['Basic contract access', 'Standard payment rates']
      },
      'Regular': {
        experienceRequired: 1000,
        contractMultiplier: 1.0,
        availableContracts: ['Garrison', 'Raid', 'Search and Destroy', 'Recon', 'Anti-Piracy'],
        description: 'Competent mercenary unit with proven combat record',
        benefits: ['Expanded contract types', 'Better faction access', 'Standard salvage rights']
      },
      'Veteran': {
        experienceRequired: 3000,
        contractMultiplier: 1.3,
        availableContracts: ['Special Operations', 'Extraction', 'Sabotage', 'Deep Recon'],
        description: 'Experienced unit capable of complex operations',
        benefits: ['Elite contracts', '30% payment bonus', 'Priority contract selection']
      },
      'Elite': {
        experienceRequired: 7500,
        contractMultiplier: 1.6,
        availableContracts: ['Black Ops', 'Assassination', 'Technology Theft', 'Regime Change'],
        description: 'Legendary mercenary unit with unparalleled capabilities',
        benefits: ['All contract types', '60% payment bonus', 'Faction influence', 'Exclusive opportunities']
      }
    };
  }

  /**
   * Check and update company rating based on experience
   */
  updateCompanyRating() {
    const company = this.gameState.get('company');
    if (!company) return;
    
    const currentExperience = company.progression.experience;
    const ratingInfo = this.getRatingInfo();
    
    let newRating = 'Green';
    
    if (currentExperience >= ratingInfo['Elite'].experienceRequired) {
      newRating = 'Elite';
    } else if (currentExperience >= ratingInfo['Veteran'].experienceRequired) {
      newRating = 'Veteran';
    } else if (currentExperience >= ratingInfo['Regular'].experienceRequired) {
      newRating = 'Regular';
    }
    
    if (newRating !== company.rating) {
      const oldRating = company.rating;
      company.rating = newRating;
      company.progression.nextRatingThreshold = this.getNextRatingThreshold(newRating);
      
      this.gameState.set('company', company);
      
      this.eventBus.emit('company:ratingChanged', {
        oldRating,
        newRating,
        experience: currentExperience
      });
      
      this.logger.info(`Company rating upgraded: ${oldRating} -> ${newRating}`);
      
      // Show notification
      const ratingDetails = ratingInfo[newRating];
      alert(`COMPANY RATING UPGRADED!\n\n` +
            `New Rating: ${newRating}\n` +
            `${ratingDetails.description}\n\n` +
            `Benefits:\n${ratingDetails.benefits.join('\n')}\n\n` +
            `Payment Multiplier: ${(ratingDetails.contractMultiplier * 100)}%`);
    }
  }

  /**
   * Get next rating threshold
   */
  getNextRatingThreshold(currentRating) {
    const ratingInfo = this.getRatingInfo();
    const ratings = ['Green', 'Regular', 'Veteran', 'Elite'];
    const currentIndex = ratings.indexOf(currentRating);
    
    if (currentIndex < ratings.length - 1) {
      const nextRating = ratings[currentIndex + 1];
      return ratingInfo[nextRating].experienceRequired;
    }
    
    return null; // Max rating reached
  }

  /**
   * Add experience points to the company
   */
  addExperience(amount, reason = '') {
    const company = this.gameState.get('company');
    if (!company) return;
    
    company.progression.experience += amount;
    this.gameState.set('company', company);
    
    this.logger.info(`Experience gained: +${amount} (${reason})`);
    this.updateCompanyRating();
    
    this.eventBus.emit('company:experienceGained', {
      amount,
      reason,
      totalExperience: company.progression.experience
    });
  }

  /**
   * Calculate and update operational status
   */
  updateOperationalStatus() {
    const company = this.gameState.get('company');
    const pilots = this.gameState.get('pilots') || [];
    const mechs = this.gameState.get('mechs') || [];
    
    if (!company) return;
    
    // Calculate operational readiness
    const activePilots = pilots.filter(p => p.status === 'Active').length;
    const readyMechs = mechs.filter(m => m.status === 'Ready').length;
    const totalMechs = mechs.length;
    
    let readinessLevel = 'Not Ready';
    const operationalUnits = Math.min(activePilots, readyMechs);
    
    if (operationalUnits >= 4) readinessLevel = 'Full Strength';
    else if (operationalUnits >= 2) readinessLevel = 'Ready';
    else if (operationalUnits >= 1) readinessLevel = 'Limited';
    
    // Calculate supply level based on funds
    let supplyLevel = 'Critical';
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const fundRatio = company.funds / monthlyExpenses;
    
    if (fundRatio >= 6) supplyLevel = 'Excellent';
    else if (fundRatio >= 4) supplyLevel = 'Good';
    else if (fundRatio >= 2) supplyLevel = 'Adequate';
    else if (fundRatio >= 1) supplyLevel = 'Poor';
    
    // Calculate morale based on various factors
    let moraleLevel = 'Good';
    const successRate = company.statistics.contractsCompleted > 0 ? 
      company.statistics.contractsSuccessful / company.statistics.contractsCompleted : 1;
    
    if (successRate >= 0.8 && supplyLevel !== 'Critical' && supplyLevel !== 'Poor') {
      moraleLevel = 'Excellent';
    } else if (successRate >= 0.6) {
      moraleLevel = 'Good';
    } else if (successRate >= 0.4) {
      moraleLevel = 'Fair';
    } else {
      moraleLevel = 'Poor';
    }
    
    // Update company status
    company.operations = {
      ...company.operations,
      operationalReadiness: readinessLevel,
      supplyLevel: supplyLevel,
      moraleLevel: moraleLevel,
      availableUnits: operationalUnits
    };
    
    this.gameState.set('company', company);
  }

  /**
   * Show detailed company overview
   */
  showCompanyOverview() {
    const company = this.gameState.get('company');
    const time = this.gameState.get('time');
    const pilots = this.gameState.get('pilots') || [];
    const mechs = this.gameState.get('mechs') || [];
    
    if (!company) return;
    
    const overviewHTML = this.generateCompanyOverviewHTML(company, time, pilots, mechs);
    document.body.insertAdjacentHTML('beforeend', overviewHTML);
  }

  /**
   * Generate comprehensive company overview HTML
   */
  generateCompanyOverviewHTML(company, time, pilots, mechs) {
    const ratingInfo = this.getRatingInfo()[company.rating];
    const monthlyExpenses = this.calculateMonthlyExpenses();
    const monthsOfOperation = Math.floor(company.funds / monthlyExpenses);
    
    return `
      <div id="company-overview-overlay" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; justify-content: center; align-items: center;">
        <div class="company-overview" style="background: #2a2a2a; border: 2px solid #555; border-radius: 8px; max-width: 95%; max-height: 95%; overflow-y: auto; padding: 20px; color: white;">
          <div class="overview-header">
            <h2 style="color: #fff; margin-bottom: 5px;">${company.name}</h2>
            <p style="color: #ccc; margin-bottom: 15px;">${company.callsign} - ${company.rating} Rated Mercenary Unit</p>
            <button onclick="closeCompanyOverview()" style="float: right; background: #666; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-top: -40px;">Close</button>
          </div>
          
          <div class="overview-content" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div class="left-column">
              <div class="financial-status" style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h3 style="color: #4ecdc4; margin-bottom: 10px;">Financial Status</h3>
                <div class="stat-line"><span>Available Funds:</span><span>${company.funds.toLocaleString()} C-Bills</span></div>
                <div class="stat-line"><span>Monthly Expenses:</span><span>${monthlyExpenses.toLocaleString()} C-Bills</span></div>
                <div class="stat-line"><span>Operating Reserve:</span><span>${monthsOfOperation} months</span></div>
                <div class="stat-line"><span>Total Earnings:</span><span>${company.statistics.totalEarnings.toLocaleString()} C-Bills</span></div>
              </div>
              
              <div class="unit-status" style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h3 style="color: #45b7d1; margin-bottom: 10px;">Unit Status</h3>
                <div class="stat-line"><span>Readiness:</span><span>${company.operations.operationalReadiness}</span></div>
                <div class="stat-line"><span>Supply Level:</span><span>${company.operations.supplyLevel}</span></div>
                <div class="stat-line"><span>Morale:</span><span>${company.operations.moraleLevel}</span></div>
                <div class="stat-line"><span>Location:</span><span>${company.operations.currentLocation}</span></div>
                <div class="stat-line"><span>Available Units:</span><span>${company.operations.availableUnits}</span></div>
              </div>
              
              <div class="force-composition" style="background: #333; padding: 15px; border-radius: 5px;">
                <h3 style="color: #f38ba8; margin-bottom: 10px;">Force Composition</h3>
                <div class="stat-line"><span>Total Pilots:</span><span>${pilots.length}</span></div>
                <div class="stat-line"><span>Active Pilots:</span><span>${pilots.filter(p => p.status === 'Active').length}</span></div>
                <div class="stat-line"><span>Total Mechs:</span><span>${mechs.length}</span></div>
                <div class="stat-line"><span>Ready Mechs:</span><span>${mechs.filter(m => m.status === 'Ready').length}</span></div>
                <div class="stat-line"><span>Under Repair:</span><span>${mechs.filter(m => m.status === 'Repairing').length}</span></div>
              </div>
            </div>
            
            <div class="right-column">
              <div class="rating-progress" style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h3 style="color: #ff6b35; margin-bottom: 10px;">Rating & Progression</h3>
                <div class="stat-line"><span>Current Rating:</span><span>${company.rating}</span></div>
                <div class="stat-line"><span>Experience:</span><span>${company.progression.experience.toLocaleString()}</span></div>
                ${company.progression.nextRatingThreshold ? 
                  `<div class="progress-bar" style="margin: 10px 0;">
                    <div style="background: #444; height: 20px; border-radius: 3px; overflow: hidden;">
                      <div style="width: ${Math.min(100, (company.progression.experience / company.progression.nextRatingThreshold) * 100)}%; height: 100%; background: linear-gradient(90deg, #4ecdc4, #45b7d1); transition: width 0.3s;"></div>
                    </div>
                    <div style="font-size: 12px; color: #ccc; margin-top: 5px;">Progress to ${this.getNextRatingName(company.rating)}: ${Math.round((company.progression.experience / company.progression.nextRatingThreshold) * 100)}%</div>
                  </div>` : 
                  '<div style="color: #4ecdc4; margin: 10px 0;">Maximum Rating Achieved</div>'
                }
                <div style="font-size: 12px; color: #ccc; margin-top: 10px;">${ratingInfo.description}</div>
              </div>
              
              <div class="combat-record" style="background: #333; padding: 15px; border-radius: 5px; margin-bottom: 15px;">
                <h3 style="color: #96ceb4; margin-bottom: 10px;">Combat Record</h3>
                <div class="stat-line"><span>Contracts Completed:</span><span>${company.statistics.contractsCompleted}</span></div>
                <div class="stat-line"><span>Success Rate:</span><span>${company.statistics.contractsCompleted > 0 ? Math.round((company.statistics.contractsSuccessful / company.statistics.contractsCompleted) * 100) : 0}%</span></div>
                <div class="stat-line"><span>Units Destroyed:</span><span>${company.statistics.unitsDestroyed}</span></div>
                <div class="stat-line"><span>Pilots Lost:</span><span>${company.statistics.pilotsLost}</span></div>
                <div class="stat-line"><span>Mechs Lost:</span><span>${company.statistics.mechsLost}</span></div>
              </div>
              
              <div class="time-service" style="background: #333; padding: 15px; border-radius: 5px;">
                <h3 style="color: #ffd93d; margin-bottom: 10px;">Service Record</h3>
                <div class="stat-line"><span>Established:</span><span>${new Date(company.established).toLocaleDateString()}</span></div>
                <div class="stat-line"><span>Current Date:</span><span>${time.month}/${time.day}/${time.year}</span></div>
                <div class="stat-line"><span>Time in Service:</span><span>${Math.floor((Date.now() - company.established) / (30 * 24 * 60 * 60 * 1000))} months</span></div>
              </div>
            </div>
          </div>
          
          <div class="management-actions" style="margin-top: 20px; display: flex; gap: 10px; justify-content: center;">
            <button onclick="showPilotHiring()" style="background: #4ecdc4; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 3px;">Hire Pilots</button>
            <button onclick="showMechMarket()" style="background: #45b7d1; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 3px;">Mech Market</button>
            <button onclick="showFactionOverview()" style="background: #f38ba8; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 3px;">Faction Standing</button>
            <button onclick="advanceTime()" style="background: #ff6b35; color: white; border: none; padding: 8px 15px; cursor: pointer; border-radius: 3px;">Advance Time (+1 Week)</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get next rating name
   */
  getNextRatingName(currentRating) {
    const ratings = ['Green', 'Regular', 'Veteran', 'Elite'];
    const currentIndex = ratings.indexOf(currentRating);
    return currentIndex < ratings.length - 1 ? ratings[currentIndex + 1] : 'Elite';
  }

  /**
   * Close company overview
   */
  closeCompanyOverview() {
    const overlay = document.getElementById('company-overview-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  /**
   * Advance game time
   */
  advanceTime(data) {
    const { days = 7 } = data;
    const currentTime = this.gameState.get('time') || { day: 1, month: 1, year: 3025 };
    
    // Calculate new date
    let newDay = currentTime.day + days;
    let newMonth = currentTime.month;
    let newYear = currentTime.year;
    
    // Handle month overflow
    const daysInMonth = this.getDaysInMonth(newMonth, newYear);
    while (newDay > daysInMonth) {
      newDay -= daysInMonth;
      newMonth++;
      
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      }
    }
    
    const newTime = { day: newDay, month: newMonth, year: newYear };
    
    // Update game state
    this.gameState.set('time', newTime);
    
    // Process time-based events
    this.processTimeAdvancement(days);
    
    // Update display
    this.updateTimeDisplay();
    
    this.eventBus.emit('company:timeAdvanced', { 
      previousTime: currentTime, 
      newTime, 
      daysAdvanced: days 
    });
    
    this.logger.info(`Time advanced by ${days} days to ${this.formatDate(newTime)}`);
  }

  /**
   * Process events that occur when time advances
   */
  processTimeAdvancement(days) {
    // Check if a month has passed for monthly expenses
    this.monthlyExpensesTimer += days * 24 * 60 * 60 * 1000; // Convert to milliseconds
    
    if (this.monthlyExpensesTimer >= this.monthlyInterval) {
      this.payMonthlyExpenses();
      this.monthlyExpensesTimer = 0;
    }
    
    // Process contract time limits
    this.processContractTimeouts(days);
    
    // Update pilot/mech maintenance
    this.processMaintenanceEvents(days);
    
    // Generate random events
    this.processRandomEvents(days);
  }

  /**
   * Pay monthly expenses
   */
  payMonthlyExpenses() {
    const company = this.gameState.get('company');
    const totalExpenses = this.calculateTotalExpenses();
    
    if (company.funds >= totalExpenses) {
      this.gameState.set('company.funds', company.funds - totalExpenses);
      
      this.eventBus.emit('company:expensesPaid', { 
        amount: totalExpenses, 
        remainingFunds: company.funds - totalExpenses 
      });
      
      this.logger.info(`Monthly expenses paid: ${totalExpenses.toLocaleString()} C-Bills`);
    } else {
      // Handle insufficient funds
      this.handleInsufficientFunds(totalExpenses, company.funds);
    }
    
    this.updateFinancialDisplay();
  }

  /**
   * Calculate total monthly expenses
   */
  calculateTotalExpenses() {
    const company = this.gameState.get('company');
    const pilots = this.gameState.get('pilots') || [];
    const mechs = this.gameState.get('mechs') || [];
    
    // Calculate pilot salaries
    const totalSalaries = pilots.reduce((total, pilot) => total + (pilot.salary || 0), 0);
    
    // Calculate mech maintenance
    const totalMaintenance = mechs.reduce((total, mech) => total + (mech.maintenanceCost || 0), 0);
    
    // Update expenses in game state
    this.gameState.update({
      'company.expenses.salaries': totalSalaries,
      'company.expenses.maintenance': totalMaintenance
    });
    
    return totalSalaries + totalMaintenance + company.expenses.insurance + company.expenses.overhead;
  }

  /**
   * Handle insufficient funds for expenses
   */
  handleInsufficientFunds(required, available) {
    const deficit = required - available;
    
    this.logger.warn(`Insufficient funds for expenses. Required: ${required}, Available: ${available}`);
    
    // Deduct all available funds
    this.gameState.set('company.funds', 0);
    
    // Apply penalties for unpaid expenses
    this.applyFinancialPenalties(deficit);
    
    this.eventBus.emit('company:financialCrisis', { deficit, required, available });
    
    // Show warning to player
    alert(`WARNING: Insufficient funds to pay monthly expenses!\nDeficit: ${deficit.toLocaleString()} C-Bills\nCompany reputation and pilot morale will suffer.`);
  }

  /**
   * Apply penalties for financial difficulties
   */
  applyFinancialPenalties(deficit) {
    const company = this.gameState.get('company');
    
    // Reduce reputation with all factions
    const reputationLoss = Math.min(Math.floor(deficit / 10000), 20); // Max 20 rep loss
    
    Object.keys(company.reputation).forEach(faction => {
      const currentRep = company.reputation[faction];
      this.gameState.set(`company.reputation.${faction}`, Math.max(currentRep - reputationLoss, -100));
    });
    
    // Reduce company rating if reputation gets too low
    if (company.reputation.Mercenary < -50 && company.rating !== 'Green') {
      this.gameState.set('company.rating', 'Green');
      this.logger.warn('Company rating reduced to Green due to poor financial management');
    }
  }

  /**
   * Process contract timeouts
   */
  processContractTimeouts(days) {
    // This will be expanded when active contract system is implemented
    const contracts = this.gameState.get('contracts') || [];
    const now = Date.now();
    
    contracts.forEach(contract => {
      if (contract.timeLimit && now > contract.timeLimit) {
        this.logger.debug(`Contract expired: ${contract.name}`);
      }
    });
  }

  /**
   * Process maintenance events
   */
  processMaintenanceEvents(days) {
    // Check for mechs needing maintenance
    const mechs = this.gameState.get('mechs') || [];
    
    mechs.forEach(mech => {
      if (mech.lastMaintenance) {
        const daysSinceMaintenance = (Date.now() - mech.lastMaintenance) / (24 * 60 * 60 * 1000);
        
        if (daysSinceMaintenance > 30) { // Monthly maintenance required
          this.logger.info(`Mech ${mech.name} requires maintenance`);
          // Future: Generate maintenance reminders/requirements
        }
      }
    });
  }

  /**
   * Process random events
   */
  processRandomEvents(days) {
    // Small chance of random events each week
    if (days >= 7 && Math.random() < 0.1) {
      this.generateRandomEvent();
    }
  }

  /**
   * Generate a random company event
   */
  generateRandomEvent() {
    const events = [
      {
        name: 'Generous Benefactor',
        description: 'A wealthy patron impressed by your recent work has made a donation to your company.',
        effect: () => {
          const bonus = 50000 + Math.floor(Math.random() * 100000);
          const currentFunds = this.gameState.get('company.funds');
          this.gameState.set('company.funds', currentFunds + bonus);
          return `Received ${bonus.toLocaleString()} C-Bills bonus!`;
        }
      },
      {
        name: 'Equipment Malfunction',
        description: 'A major equipment failure has occurred, requiring emergency repairs.',
        effect: () => {
          const cost = 20000 + Math.floor(Math.random() * 50000);
          const currentFunds = this.gameState.get('company.funds');
          this.gameState.set('company.funds', Math.max(0, currentFunds - cost));
          return `Emergency repair costs: ${cost.toLocaleString()} C-Bills`;
        }
      },
      {
        name: 'Reputation Boost',
        description: 'Word of your professionalism has spread, improving your standing.',
        effect: () => {
          const repBonus = 5 + Math.floor(Math.random() * 10);
          const reputation = this.gameState.get('company.reputation');
          this.gameState.set('company.reputation.Mercenary', reputation.Mercenary + repBonus);
          return `Mercenary reputation increased by ${repBonus}!`;
        }
      }
    ];
    
    const event = events[Math.floor(Math.random() * events.length)];
    const result = event.effect();
    
    this.eventBus.emit('company:randomEvent', { event, result });
    
    // Show event to player (in a real implementation, this would be a proper UI popup)
    alert(`${event.name}\n\n${event.description}\n\n${result}`);
    
    this.logger.info(`Random event occurred: ${event.name}`);
  }

  /**
   * Handle pilot hired
   */
  onPilotHired(data) {
    const { pilot, cost } = data;
    
    // Deduct hiring cost
    const currentFunds = this.gameState.get('company.funds');
    this.gameState.set('company.funds', currentFunds - cost);
    
    // Update statistics
    const stats = this.gameState.get('statistics');
    this.gameState.update({
      'statistics.pilotHires': stats.pilotHires + 1,
      'statistics.totalSpending': stats.totalSpending + cost
    });
    
    this.updateFinancialDisplay();
    this.logger.info(`Pilot hired: ${pilot.name} for ${cost.toLocaleString()} C-Bills`);
  }

  /**
   * Handle pilot fired
   */
  onPilotFired(data) {
    const { pilot } = data;
    
    // Calculate severance pay (typically 1 month salary)
    const severancePay = pilot.salary;
    const currentFunds = this.gameState.get('company.funds');
    this.gameState.set('company.funds', Math.max(0, currentFunds - severancePay));
    
    this.updateFinancialDisplay();
    this.logger.info(`Pilot fired: ${pilot.name}, severance: ${severancePay.toLocaleString()} C-Bills`);
  }

  /**
   * Handle contract completion
   */
  onContractCompleted(data) {
    const { contract, success, payment, bonuses } = data;
    
    if (success) {
      // Add payment to company funds
      const totalPayment = payment + (bonuses || 0);
      const currentFunds = this.gameState.get('company.funds');
      this.gameState.set('company.funds', currentFunds + totalPayment);
      
      // Apply reputation bonuses
      if (contract.rewards && contract.rewards.reputation) {
        Object.entries(contract.rewards.reputation).forEach(([faction, repGain]) => {
          const currentRep = this.gameState.get(`company.reputation.${faction}`) || 0;
          this.gameState.set(`company.reputation.${faction}`, currentRep + repGain);
        });
      }
      
      // Update statistics
      const stats = this.gameState.get('statistics');
      this.gameState.update({
        'statistics.contractsCompleted': stats.contractsCompleted + 1,
        'statistics.totalEarnings': stats.totalEarnings + totalPayment
      });
      
      this.logger.info(`Contract completed: ${contract.name}, payment: ${totalPayment.toLocaleString()} C-Bills`);
    } else {
      // Handle failed contract
      const stats = this.gameState.get('statistics');
      this.gameState.set('statistics.contractsFailed', stats.contractsFailed + 1);
      
      // Apply reputation penalties
      Object.keys(this.gameState.get('company.reputation')).forEach(faction => {
        const currentRep = this.gameState.get(`company.reputation.${faction}`) || 0;
        this.gameState.set(`company.reputation.${faction}`, currentRep - 5);
      });
      
      this.logger.warn(`Contract failed: ${contract.name}`);
    }
    
    this.updateFinancialDisplay();
    this.updateCompanyRating();
  }

  /**
   * Update company rating based on reputation and performance
   */
  updateCompanyRating() {
    const reputation = this.gameState.get('company.reputation');
    const stats = this.gameState.get('statistics');
    
    const averageReputation = Object.values(reputation).reduce((sum, rep) => sum + rep, 0) / Object.keys(reputation).length;
    const successRate = stats.contractsCompleted / Math.max(1, stats.contractsCompleted + stats.contractsFailed);
    
    let newRating = 'Green';
    
    if (averageReputation > 75 && successRate > 0.9 && stats.contractsCompleted > 20) {
      newRating = 'Elite';
    } else if (averageReputation > 50 && successRate > 0.8 && stats.contractsCompleted > 10) {
      newRating = 'Veteran';
    } else if (averageReputation > 25 && successRate > 0.7 && stats.contractsCompleted > 5) {
      newRating = 'Regular';
    }
    
    const currentRating = this.gameState.get('company.rating');
    if (newRating !== currentRating) {
      this.gameState.set('company.rating', newRating);
      this.eventBus.emit('company:ratingChanged', { oldRating: currentRating, newRating });
      this.logger.info(`Company rating updated: ${currentRating} -> ${newRating}`);
    }
  }

  /**
   * Update financial display
   */
  updateFinancialDisplay() {
    const company = this.gameState.get('company');
    
    // Update company funds display
    const fundsElement = document.getElementById('company-funds');
    if (fundsElement) {
      fundsElement.textContent = `${company.funds.toLocaleString()} C-Bills`;
      fundsElement.className = company.funds < 50000 ? 'funds low-funds' : 'funds';
    }
    
    // Update monthly expenses
    const totalExpenses = this.calculateTotalExpenses();
    const expensesElement = document.getElementById('monthly-expenses');
    if (expensesElement) {
      expensesElement.textContent = `${totalExpenses.toLocaleString()} C-Bills`;
    }
    
    // Update monthly income (from active contracts)
    const incomeElement = document.getElementById('monthly-income');
    if (incomeElement) {
      incomeElement.textContent = `${company.income.monthly.toLocaleString()} C-Bills`;
    }
    
    // Update company rating
    const ratingElement = document.getElementById('company-rating');
    if (ratingElement) {
      ratingElement.textContent = company.rating;
    }
  }

  /**
   * Update time display
   */
  updateTimeDisplay() {
    const time = this.gameState.get('time');
    const dateElement = document.getElementById('current-date');
    
    if (dateElement && time) {
      dateElement.textContent = this.formatDate(time);
    }
  }

  /**
   * Format date for display
   */
  formatDate(time) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return `${months[time.month - 1]} ${time.day}, ${time.year}`;
  }

  /**
   * Get days in month
   */
  getDaysInMonth(month, year) {
    // BattleTech uses standard Earth calendar
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // Handle leap years
    if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
      return 29;
    }
    
    return daysInMonth[month - 1];
  }

  /**
   * Handle game state changes
   */
  onGameStateChanged(data) {
    const { path } = data;
    
    // Update financial display if company data changed
    if (path.startsWith('company.')) {
      this.updateFinancialDisplay();
    }
    
    // Update time display if time changed
    if (path === 'time') {
      this.updateTimeDisplay();
    }
  }

  /**
   * Handle screen changes
   */
  onScreenChanged(data) {
    const { to } = data;
    
    // Update displays when entering company overview
    if (to === 'company-overview') {
      this.updateFinancialDisplay();
      this.updateTimeDisplay();
    }
  }

  /**
   * System update method (called by game loop)
   */
  update(deltaTime) {
    // Currently no real-time updates needed
    // Future features might include:
    // - Real-time financial calculations
    // - Contract countdown timers
    // - Maintenance scheduling
  }

  /**
   * Handle system start
   */
  async start() {
    this.logger.debug('CompanySystem started');
    
    // Initialize displays
    this.updateFinancialDisplay();
    this.updateTimeDisplay();
  }

  /**
   * Handle system stop
   */
  async stop() {
    this.logger.debug('CompanySystem stopped');
  }

  /**
   * Handle state loaded
   */
  onStateLoaded(gameState) {
    // Reset timers
    this.monthlyExpensesTimer = 0;
    
    // Update displays
    this.updateFinancialDisplay();
    this.updateTimeDisplay();
    
    this.logger.debug('CompanySystem state loaded');
  }

  /**
   * Shutdown the company system
   */
  async shutdown() {
    this.monthlyExpensesTimer = 0;
    this.isInitialized = false;
    this.logger.info('CompanySystem shutdown complete');
  }
}