/**
 * Professional Battletech Game - Main Application Entry Point
 * Integrates all working functionality from game_minimal.js with new professional architecture
 * Preserves all existing behavior while using modern systems underneath
 */

// Import utilities and core systems
import { EventBus } from './src/utils/EventBus.js';
import { Logger } from './src/utils/Logger.js';
import { GameEngine } from './src/systems/js/GameEngine.js';
import { GameState } from './src/systems/js/GameState.js';
import { ScreenManager } from './src/systems/js/ScreenManager.js';
import { DataManager } from './src/systems/js/DataManager.js';

// Import game systems
import { PilotSystem } from './src/systems/js/PilotSystem.js';
import { MechSystem } from './src/systems/js/MechSystem.js';
import { ContractSystem } from './src/systems/js/ContractSystem.js';
import { CompanySystem } from './src/systems/js/CompanySystem.js';
import { CombatSystem } from './src/systems/js/CombatSystem.js';

// Global application instance
let gameApp = null;

/**
 * Main Game Application Class
 * Coordinates all systems and maintains backward compatibility
 */
class BattletechGame {
  constructor() {
    this.logger = new Logger('BattletechGame');
    this.eventBus = new EventBus();
    this.gameEngine = null;
    this.isInitialized = false;
    
    // Backwards compatibility - maintain these for existing onclick handlers
    this.gameState = null;
  }

  /**
   * Initialize the game application
   */
  async initialize() {
    try {
      console.log('Loading professional Battletech game...');
      this.logger.info('Initializing professional Battletech game...');
      
      // Initialize game engine with all systems
      this.gameEngine = new GameEngine(this.eventBus);
      await this.gameEngine.initialize();
      
      // Get references to core systems for backward compatibility
      this.gameState = this.gameEngine.gameState;
      this.screenManager = this.gameEngine.screenManager;
      this.dataManager = this.gameEngine.dataManager;
      
      // Get references to game systems
      this.pilotSystem = this.gameEngine.getSystem('pilot');
      this.mechSystem = this.gameEngine.getSystem('mech');
      this.contractSystem = this.gameEngine.getSystem('contract');
      this.companySystem = this.gameEngine.getSystem('company');
      this.combatSystem = this.gameEngine.getSystem('combat');
      
      // Setup backward compatibility functions
      this.setupBackwardCompatibility();
      
      // Setup main menu handlers
      this.setupMainMenuHandlers();
      
      // Initialize with main menu
      await this.screenManager.showScreen('main-menu');
      
      this.isInitialized = true;
      this.logger.info('Professional Battletech game initialized successfully');
      
      // Start the game engine
      await this.gameEngine.startGame();
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
      this.logger.error('Failed to initialize game:', error);
      throw error;
    }
  }

  /**
   * Setup backward compatibility functions for existing HTML onclick handlers
   */
  setupBackwardCompatibility() {
    // Main menu functions - exact same behavior as original
    window.startNewGame = () => {
      this.startNewGame();
    };
    
    window.loadGame = () => {
      this.loadGame();
    };
    
    window.showSettings = () => {
      this.showSettings();
    };
    
    window.quitGame = () => {
      this.quitGame();
    };
    
    // Screen navigation functions - now use ScreenManager
    window.showScreen = (screenId) => {
      this.eventBus.emit('screen:show', screenId);
    };
    
    window.showMainMenu = () => {
      this.eventBus.emit('screen:show', 'main-menu');
    };
    
    window.showCompanyOverview = () => {
      this.eventBus.emit('screen:show', 'company-overview');
    };
    
    window.showMechBay = () => {
      this.eventBus.emit('screen:show', 'mech-bay');
    };
    
    window.showStarMap = () => {
      this.eventBus.emit('screen:show', 'star-map');
    };
    
    // Update function for backward compatibility
    window.updateAll = () => {
      this.updateAll();
    };
    
    this.logger.debug('Backward compatibility functions setup complete');
  }

  /**
   * Setup main menu event handlers
   */
  setupMainMenuHandlers() {
    // Listen for game state changes to update UI
    this.eventBus.on('gameState:changed', (data) => {
      this.updateAll();
    });
    
    this.eventBus.on('gameState:updated', (data) => {
      this.updateAll();
    });
    
    // Listen for significant events to trigger auto-saves
    this.eventBus.on('company:timeAdvanced', async (data) => {
      await this.saveGame('Auto-Save - Time Advanced');
    });
    
    this.eventBus.on('contract:accepted', async (data) => {
      await this.saveGame('Auto-Save - Contract Accepted');
    });
    
    this.eventBus.on('pilot:hired', async (data) => {
      await this.saveGame('Auto-Save - Pilot Hired');
    });
    
    // Listen for screen changes
    this.eventBus.on('screen:changed', (data) => {
      this.logger.debug(`Screen changed: ${data.from} -> ${data.to}`);
    });
  }

  /**
   * Start new game - preserves exact original behavior
   */
  async startNewGame() {
    console.log('New Company button clicked - WORKING!');
    this.logger.info('Starting new company...');
    
    try {
      // Initialize default company data using systems
      const companyData = this.companySystem.initializeNewCompany();
      const defaultPilots = this.pilotSystem.createDefaultPilots();
      const defaultMechs = this.mechSystem.createDefaultMechs();
      const defaultContracts = this.contractSystem.createDefaultContracts();
      
      // Update game state with all initial data
      this.gameState.update({
        'company': companyData,
        'pilots': defaultPilots,
        'mechs': defaultMechs,
        'contracts': defaultContracts
      });
      
      // Mark as in-game
      this.gameState.set('inGame', true);
      
      // Update all displays
      this.updateAll();
      
      // Navigate to company overview
      await this.screenManager.showScreen('company-overview');
      
      // Auto-save the new company
      await this.saveGame('New Company - Auto-Save');
      
      this.logger.info('New company started successfully');
      
    } catch (error) {
      this.logger.error('Failed to start new game:', error);
      alert('Failed to start new game. Please try again.');
    }
  }

  /**
   * Load game - now using professional DataManager
   */
  async loadGame() {
    this.logger.info('Load game requested');
    
    try {
      // Get all available saves
      const saves = await this.dataManager.getAllSaves();
      
      if (saves.length === 0) {
        alert('No saved games found. Start a new company first.');
        return;
      }
      
      // For now, load the most recent save
      // TODO: In future, show a proper load game UI
      const mostRecent = saves[0];
      const gameState = await this.dataManager.loadGame(mostRecent.id);
      
      // Load the state into the game
      await this.gameState.loadState(gameState);
      
      // Update all displays
      this.updateAll();
      
      // Navigate to company overview
      await this.screenManager.showScreen('company-overview');
      
      alert(`Game loaded: ${mostRecent.name}\nCompany: ${gameState.company?.name}\nDate: ${gameState.time?.month}/${gameState.time?.day}/${gameState.time?.year}`);
      
      this.logger.info(`Game loaded successfully: ${mostRecent.name}`);
      
    } catch (error) {
      this.logger.error('Failed to load game:', error);
      alert('Failed to load game. Please try again.');
    }
  }

  /**
   * Save current game state
   */
  async saveGame(saveName = null) {
    try {
      const currentState = this.gameState.getCurrentState();
      
      if (!currentState.inGame) {
        this.logger.warn('Cannot save game - not currently in game');
        return false;
      }
      
      const saveId = await this.dataManager.saveGame(currentState, saveName);
      this.logger.info(`Game saved with ID: ${saveId}`);
      return saveId;
      
    } catch (error) {
      this.logger.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Show settings - placeholder for future implementation
   */
  showSettings() {
    this.logger.info('Settings requested');
    alert('Settings not implemented yet');
  }

  /**
   * Quit game
   */
  quitGame() {
    this.logger.info('Quit game requested');
    alert('Thanks for playing!');
  }

  /**
   * Update all UI displays - maintains exact original behavior
   */
  updateAll() {
    const currentState = this.gameState.getCurrentState();
    
    this.updatePilotDisplay(currentState.pilots || []);
    this.updateMechDisplay(currentState.mechs || []);
    this.updateContractDisplay(currentState.contracts || []);
    this.updateCompanyDisplay(currentState.company);
  }

  /**
   * Update pilot display - exact same as original
   */
  updatePilotDisplay(pilots) {
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
   * Update mech display - exact same as original
   */
  updateMechDisplay(mechs) {
    const mechList = document.getElementById('mech-list');
    if (mechList) {
      mechList.innerHTML = mechs.map((mech, index) => 
        `<div class="mech-entry" onclick="selectMech(${index})">
          <div class="mech-name">${mech.name}</div>
          <div class="mech-status">${mech.tonnage} tons - ${mech.status}</div>
        </div>`
      ).join('');
    }
  }

  /**
   * Update contract display - exact same as original
   */
  updateContractDisplay(contracts) {
    const contractList = document.getElementById('contract-list');
    if (contractList) {
      contractList.innerHTML = contracts.map(contract => 
        `<div class="contract-entry">
          <div class="contract-name">${contract.name}</div>
          <div class="contract-summary">Payment: ${contract.payment.toLocaleString()} C-Bills - ${contract.difficulty}</div>
        </div>`
      ).join('');
    }
  }

  /**
   * Update company display
   */
  updateCompanyDisplay(company) {
    if (!company) return;
    
    // Update company name
    const companyNameElement = document.getElementById('company-name');
    if (companyNameElement) {
      companyNameElement.textContent = company.name;
    }
    
    // Update company funds
    const companyFundsElement = document.getElementById('company-funds');
    if (companyFundsElement) {
      companyFundsElement.textContent = `${company.funds.toLocaleString()} C-Bills`;
    }
    
    // Update company rating
    const companyRatingElement = document.getElementById('company-rating');
    if (companyRatingElement) {
      companyRatingElement.textContent = company.rating;
    }
  }

  /**
   * Get current game state for debugging
   */
  getCurrentState() {
    return this.gameState ? this.gameState.getCurrentState() : null;
  }

  /**
   * Shutdown the application
   */
  async shutdown() {
    try {
      if (this.gameEngine) {
        await this.gameEngine.shutdown();
      }
      
      this.isInitialized = false;
      this.logger.info('Game application shutdown complete');
      
    } catch (error) {
      this.logger.error('Error during shutdown:', error);
    }
  }
}

/**
 * Initialize the game when the page loads
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    gameApp = new BattletechGame();
    await gameApp.initialize();
    
    // Make game app available globally for debugging
    window.gameApp = gameApp;
    
  } catch (error) {
    console.error('Failed to start game application:', error);
    
    // Fallback error display
    document.body.innerHTML = `
      <div style="padding: 20px; color: red; font-family: monospace;">
        <h2>Game Initialization Error</h2>
        <p>Failed to initialize the professional game system.</p>
        <p>Error: ${error.message}</p>
        <p>Please check the browser console for more details.</p>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
});

// Handle page unload
window.addEventListener('beforeunload', async (e) => {
  if (gameApp && gameApp.isInitialized) {
    // Quick shutdown
    await gameApp.shutdown();
  }
});

// Export for module systems
export { BattletechGame, gameApp };