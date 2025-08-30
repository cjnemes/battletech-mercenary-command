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
  }

  /**
   * Initialize new company with default values
   */
  initializeNewCompany() {
    const companyData = {
      name: "Wolf's Dragoons",
      funds: 500000,
      rating: 'Green',
      reputation: {
        'Steiner': 0,
        'Davion': 0,
        'Liao': 0,
        'Marik': 0,
        'Kurita': 0,
        'Mercenary': 25
      },
      expenses: {
        monthly: 45000,
        salaries: 0,
        maintenance: 0,
        insurance: 25000,
        overhead: 20000
      },
      income: {
        monthly: 0,
        contracts: 0
      }
    };
    
    return companyData;
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