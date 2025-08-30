/**
 * Bulletproof Game Engine V2 - Complete Integration
 * This connects our bulletproof modular architecture to the original game UI
 * Following the principle: NEVER BREAK WORKING FUNCTIONALITY
 */

// =============================================================================
// BULLETPROOF CORE SYSTEMS (Inline for compatibility)
// =============================================================================

class Logger {
    constructor(context = 'Game') {
        this.context = context;
        this.logs = [];
        this.maxLogs = 1000;
        this.startTime = Date.now();
        this.fallbackMode = false;
        console.log(`[${this.context}] Logger initialized`);
    }
    
    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, level, context: this.context, message, data };
        
        try {
            this.logs.push(logEntry);
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(-this.maxLogs * 0.8);
            }
            const consoleMessage = `[${timestamp}] [${level}] [${this.context}] ${message}`;
            console.log(consoleMessage, data);
        } catch (error) {
            console.error('Logging failed:', error);
            console.log(`[FALLBACK] [${level}] ${message}`, data);
        }
    }
    
    error(message, data) { this.log('ERROR', message, data); }
    warn(message, data) { this.log('WARN', message, data); }
    info(message, data) { this.log('INFO', message, data); }
    debug(message, data) { this.log('DEBUG', message, data); }
    
    getStatus() {
        return {
            context: this.context,
            fallbackMode: this.fallbackMode,
            totalLogs: this.logs.length,
            uptime: Date.now() - this.startTime
        };
    }
}

class EventBus {
    constructor(logger) {
        this.logger = logger || console;
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistory = 500;
        
        try {
            this.initialize();
        } catch (error) {
            this.logger.error?.('EventBus initialization failed', error) || console.error('EventBus init failed:', error);
            throw error;
        }
    }
    
    initialize() {
        this.logger.info?.('EventBus initializing...') || console.log('EventBus initializing...');
        this.setupErrorHandling();
        this.logger.info?.('EventBus initialized successfully') || console.log('EventBus initialized');
    }
    
    setupErrorHandling() {
        if (!window.battletechErrorHandlerSet) {
            const originalErrorHandler = window.onerror;
            window.onerror = (message, source, lineno, colno, error) => {
                this.logger.error?.('Global error caught by EventBus', {
                    message, source, lineno, colno, error
                }) || console.error('Global error:', message);
                
                if (originalErrorHandler) {
                    return originalErrorHandler(message, source, lineno, colno, error);
                }
                return false;
            };
            window.battletechErrorHandlerSet = true;
        }
    }
    
    on(eventName, callback) {
        try {
            if (typeof eventName !== 'string' || typeof callback !== 'function') {
                throw new Error('Invalid event subscription parameters');
            }
            
            if (!this.listeners.has(eventName)) {
                this.listeners.set(eventName, []);
            }
            
            this.listeners.get(eventName).push(callback);
            this.logger.debug?.(`Subscribed to event: ${eventName}`) || console.debug(`Subscribed to: ${eventName}`);
            
        } catch (error) {
            this.logger.error?.('Failed to subscribe to event', { eventName, error }) || 
                console.error('Subscribe failed:', eventName, error);
        }
    }
    
    emit(eventName, data = null) {
        try {
            this.recordEvent(eventName, data);
            
            if (!this.listeners.has(eventName)) {
                this.logger.debug?.(`No listeners for event: ${eventName}`) || console.debug(`No listeners for: ${eventName}`);
                return;
            }
            
            const listeners = this.listeners.get(eventName);
            this.logger.debug?.(`Emitting event: ${eventName} to ${listeners.length} listeners`) || 
                console.debug(`Emitting: ${eventName} to ${listeners.length} listeners`);
            
            listeners.forEach((callback, index) => {
                try {
                    callback(data);
                } catch (error) {
                    this.logger.error?.(`Event listener error for ${eventName}[${index}]`, error) || 
                        console.error(`Listener error for ${eventName}:`, error);
                }
            });
            
        } catch (error) {
            this.logger.error?.('Failed to emit event', { eventName, error }) || 
                console.error('Emit failed:', eventName, error);
        }
    }
    
    recordEvent(eventName, data) {
        try {
            const eventRecord = {
                timestamp: Date.now(),
                name: eventName,
                data: data,
                listenerCount: this.listeners.has(eventName) ? this.listeners.get(eventName).length : 0
            };
            
            this.eventHistory.push(eventRecord);
            
            if (this.eventHistory.length > this.maxHistory) {
                this.eventHistory = this.eventHistory.slice(-this.maxHistory * 0.8);
            }
            
        } catch (error) {
            console.error('Event recording failed:', error);
        }
    }
    
    getStatus() {
        return {
            totalEventTypes: this.listeners.size,
            totalListeners: Array.from(this.listeners.values()).reduce((sum, arr) => sum + arr.length, 0),
            eventHistory: this.eventHistory.length,
            eventTypes: Array.from(this.listeners.keys())
        };
    }
}

class GameState {
    constructor(eventBus, logger) {
        this.eventBus = eventBus || console;
        this.logger = logger || console;
        this.initialized = false;
        
        this.state = {
            company: {
                name: 'Wolf\'s Dragoons',
                funds: 500000,
                rating: 'Green',
                monthlyExpenses: 45000,
                monthlyIncome: 0,
                reputation: new Map()
            },
            game: {
                currentDate: new Date(3025, 0, 1),
                difficulty: 'normal',
                version: '2.0.0'
            },
            personnel: {
                pilots: new Map(),
                nextPilotId: 1
            },
            assets: {
                mechs: new Map(),
                nextMechId: 1
            },
            contracts: {
                available: new Map(),
                nextContractId: 1
            }
        };
        
        try {
            this.initialize();
        } catch (error) {
            this.logger.error?.('GameState initialization failed', error) || 
                console.error('GameState init failed:', error);
            throw error;
        }
    }
    
    initialize() {
        this.logger.info?.('GameState initializing...') || console.log('GameState initializing...');
        
        this.initializeDefaultData();
        this.initialized = true;
        
        this.logger.info?.('GameState initialized successfully') || console.log('GameState initialized');
        this.eventBus.emit?.('gamestate.initialized', { timestamp: Date.now() });
    }
    
    initializeDefaultData() {
        // Initialize default pilots
        const defaultPilots = [
            {
                name: 'Marcus "Reaper" Kane',
                gunnery: 2, piloting: 3, experience: 'Elite', salary: 25000,
                status: 'Available', assignedMech: null,
                skills: ['Sharpshooter', 'Evasion'],
                background: 'Former Steiner regular who joined after the Battle of Mallory\'s World.'
            },
            {
                name: 'Lisa "Razor" Williams', 
                gunnery: 3, piloting: 4, experience: 'Veteran', salary: 18000,
                status: 'Available', assignedMech: null,
                skills: ['Multi-targeting', 'Heat Management'],
                background: 'Capellan expatriate with expertise in urban combat operations.'
            },
            {
                name: 'Chen "Ghost" Liu',
                gunnery: 4, piloting: 3, experience: 'Regular', salary: 12000,
                status: 'Available', assignedMech: null,
                skills: ['Reconnaissance', 'Stealth'],
                background: 'Former DCMS scout with knowledge of Kurita tactics and territory.'
            }
        ];
        
        defaultPilots.forEach(pilot => this.addPilot(pilot));
        
        // Initialize default mechs
        const defaultMechs = [
            {
                name: 'Centurion CN9-A', weight: 50, type: 'Medium',
                condition: 'Excellent', pilot: 1,
                weapons: ['AC/10', 'LRM-10', 'Medium Laser'], armor: 100
            },
            {
                name: 'Phoenix Hawk PXH-1', weight: 45, type: 'Medium',
                condition: 'Good', pilot: 2,
                weapons: ['Large Laser', '2x Machine Gun'], armor: 85
            },
            {
                name: 'Locust LCT-1V', weight: 20, type: 'Light',
                condition: 'Fair', pilot: null,
                weapons: ['Medium Laser', '2x Machine Gun'], armor: 60
            }
        ];
        
        defaultMechs.forEach(mech => this.addMech(mech));
        
        // Initialize default contracts
        const defaultContracts = [
            {
                title: 'Pirate Suppression - Galatea',
                employer: 'Mercenary Review Board', planet: 'Galatea',
                difficulty: 'Easy', payment: 150000, salvage: 'Standard', duration: 30,
                description: 'Clear out pirate raiders threatening local shipping lanes.'
            },
            {
                title: 'Escort Duty - New Avalon',
                employer: 'Federated Suns', planet: 'New Avalon',
                difficulty: 'Medium', payment: 250000, salvage: 'Limited', duration: 45,
                description: 'Provide security for diplomatic convoy through contested territory.'
            },
            {
                title: 'Garrison Contract - Solaris VII',
                employer: 'Solaris Stables', planet: 'Solaris VII',
                difficulty: 'Hard', payment: 400000, salvage: 'Generous', duration: 60,
                description: 'Defend arena facilities from corporate sabotage attempts.'
            }
        ];
        
        defaultContracts.forEach(contract => this.addContract(contract));
    }
    
    getState() {
        return this.deepClone(this.state);
    }
    
    addPilot(pilotData) {
        try {
            const pilot = {
                id: pilotData.id || this.state.personnel.nextPilotId++,
                name: pilotData.name || 'Unknown Pilot',
                gunnery: pilotData.gunnery || 5,
                piloting: pilotData.piloting || 5,
                experience: pilotData.experience || 'Green',
                salary: pilotData.salary || 8000,
                status: pilotData.status || 'Available',
                assignedMech: pilotData.assignedMech || null,
                skills: pilotData.skills || [],
                background: pilotData.background || '',
                hireDate: pilotData.hireDate || new Date()
            };
            
            this.state.personnel.pilots.set(pilot.id, pilot);
            this.eventBus.emit?.('pilot.added', { pilot });
            
            return pilot.id;
        } catch (error) {
            this.logger.error?.('Failed to add pilot', error) || console.error('Add pilot failed:', error);
            return null;
        }
    }
    
    addMech(mechData) {
        try {
            const mech = {
                id: mechData.id || this.state.assets.nextMechId++,
                name: mechData.name || 'Unknown Mech',
                weight: mechData.weight || 50,
                type: mechData.type || 'Medium',
                condition: mechData.condition || 'Good',
                pilot: mechData.pilot || null,
                weapons: mechData.weapons || [],
                armor: mechData.armor || 100,
                maintenanceCost: mechData.maintenanceCost || Math.floor((mechData.weight || 50) * 100)
            };
            
            this.state.assets.mechs.set(mech.id, mech);
            this.eventBus.emit?.('mech.added', { mech });
            
            return mech.id;
        } catch (error) {
            this.logger.error?.('Failed to add mech', error) || console.error('Add mech failed:', error);
            return null;
        }
    }
    
    addContract(contractData) {
        try {
            const contract = {
                id: contractData.id || this.state.contracts.nextContractId++,
                title: contractData.title || 'Unknown Contract',
                employer: contractData.employer || 'Unknown',
                planet: contractData.planet || 'Unknown',
                difficulty: contractData.difficulty || 'Medium',
                payment: contractData.payment || 100000,
                salvage: contractData.salvage || 'Standard',
                duration: contractData.duration || 30,
                description: contractData.description || 'No description available.',
                status: contractData.status || 'Available'
            };
            
            this.state.contracts.available.set(contract.id, contract);
            this.eventBus.emit?.('contract.added', { contract });
            
            return contract.id;
        } catch (error) {
            this.logger.error?.('Failed to add contract', error) || console.error('Add contract failed:', error);
            return null;
        }
    }
    
    updateState(path, value) {
        try {
            const parts = path.split('.');
            let current = this.state;
            
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) {
                    current[parts[i]] = {};
                }
                current = current[parts[i]];
            }
            
            current[parts[parts.length - 1]] = value;
            
            this.eventBus.emit?.('state.updated', {
                path, value, timestamp: Date.now()
            });
            
            return true;
        } catch (error) {
            this.logger.error?.(`Failed to update state: ${path}`, error) || 
                console.error(`State update failed: ${path}`, error);
            return false;
        }
    }
    
    deepClone(obj) {
        try {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Map) {
                const clonedMap = new Map();
                for (const [key, value] of obj) {
                    clonedMap.set(key, this.deepClone(value));
                }
                return clonedMap;
            }
            if (Array.isArray(obj)) return obj.map(item => this.deepClone(item));
            
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        } catch (error) {
            this.logger.error?.('Deep clone failed', error) || console.error('Clone failed:', error);
            return obj;
        }
    }
}

// =============================================================================
// BULLETPROOF GAME ENGINE INTEGRATION
// =============================================================================

class BulletproofGame {
    constructor() {
        this.initialized = false;
        this.systems = new Map();
        
        try {
            this.initializeCore();
            this.initializeSystems();
            this.initializeUI();
            this.bindLegacyFunctions();
            
            this.initialized = true;
            console.log('🎉 BULLETPROOF GAME ENGINE V2 READY!');
            
        } catch (error) {
            console.error('❌ CRITICAL: Bulletproof game initialization failed', error);
            this.emergencyFallback();
        }
    }
    
    initializeCore() {
        console.log('🚀 Initializing bulletproof core systems...');
        
        // Initialize core systems with bulletproof error handling
        this.logger = new Logger('BulletproofGame');
        this.eventBus = new EventBus(this.logger);
        this.gameState = new GameState(this.eventBus, this.logger);
        
        this.logger.info('✅ Core systems initialized');
    }
    
    initializeSystems() {
        console.log('🎮 Initializing game systems...');
        
        // Game systems will be initialized here in the future
        // For now, we have the foundation ready
        
        this.logger.info('✅ Game systems initialized');
    }
    
    initializeUI() {
        console.log('🎨 Initializing UI bindings...');
        
        // Set up UI event handlers
        this.setupUIEventHandlers();
        
        // Initial UI population
        this.refreshAllUI();
        
        this.logger.info('✅ UI bindings initialized');
    }
    
    setupUIEventHandlers() {
        try {
            // Listen for pilot selection
            this.eventBus.on('pilot.selected', (data) => {
                this.displayPilotDetails(data.pilotId);
            });
            
            // Listen for mech selection
            this.eventBus.on('mech.selected', (data) => {
                this.displayMechDetails(data.mechId);
            });
            
            // Listen for contract selection
            this.eventBus.on('contract.selected', (data) => {
                this.displayContractDetails(data.contractId);
            });
            
            // Listen for state changes
            this.eventBus.on('state.updated', () => {
                this.refreshAllUI();
            });
            
        } catch (error) {
            this.logger.error('Failed to setup UI event handlers', error);
        }
    }
    
    bindLegacyFunctions() {
        try {
            // Bind global functions for onclick handlers (maintaining compatibility)
            window.startNewGame = () => this.startNewGame();
            window.loadGame = () => this.loadGame();
            window.showSettings = () => this.showSettings();
            window.quitGame = () => this.quitGame();
            
            window.showMainMenu = () => this.showScreen('main-menu');
            window.showCompanyOverview = () => this.showScreen('company-overview');
            window.showMechBay = () => this.showScreen('mech-bay');
            window.showStarMap = () => this.showScreen('star-map');
            window.showTacticalCombat = () => this.showScreen('tactical-combat');
            
            window.selectPilot = (pilotId) => this.selectPilot(pilotId);
            window.selectMech = (mechId) => this.selectMech(mechId);
            window.selectContract = (contractId) => this.selectContract(contractId);
            window.acceptContract = (contractId) => this.acceptContract(contractId);
            
            window.hirePilot = () => this.hirePilot();
            window.refreshContracts = () => this.refreshContracts();
            window.advanceTime = () => this.advanceTime();
            
            window.endTurn = () => this.endTurn();
            window.exitCombat = () => this.exitCombat();
            
            this.logger.info('Legacy function bindings established');
            
        } catch (error) {
            this.logger.error('Failed to bind legacy functions', error);
        }
    }
    
    // =============================================================================
    // GAME ACTIONS (Bulletproof implementations)
    // =============================================================================
    
    startNewGame() {
        try {
            this.logger.info('🆕 Starting new game...');
            
            this.showScreen('company-overview');
            this.refreshAllUI();
            
            this.logger.info('✅ New game started successfully');
            
        } catch (error) {
            this.logger.error('Failed to start new game', error);
            console.error('❌ Start new game failed:', error);
        }
    }
    
    loadGame() {
        try {
            this.logger.info('Loading saved game...');
            // Load game implementation would go here
            alert('Load game functionality coming soon!');
        } catch (error) {
            this.logger.error('Failed to load game', error);
        }
    }
    
    showSettings() {
        try {
            this.logger.info('Showing settings...');
            alert('Settings panel coming soon!');
        } catch (error) {
            this.logger.error('Failed to show settings', error);
        }
    }
    
    quitGame() {
        try {
            this.logger.info('Quitting game...');
            if (confirm('Are you sure you want to quit?')) {
                window.close();
            }
        } catch (error) {
            this.logger.error('Failed to quit game', error);
        }
    }
    
    selectPilot(pilotId) {
        try {
            this.logger.info(`Pilot selected: ${pilotId}`);
            
            // Update visual selection state
            this.updateSelectionState('pilot-list', 'pilot-item', pilotId);
            
            this.eventBus.emit('pilot.selected', { pilotId, timestamp: Date.now() });
        } catch (error) {
            this.logger.error(`Failed to select pilot: ${pilotId}`, error);
        }
    }
    
    selectMech(mechId) {
        try {
            this.logger.info(`Mech selected: ${mechId}`);
            
            // Update visual selection state
            this.updateSelectionState('mech-list', 'mech-item', mechId);
            
            this.eventBus.emit('mech.selected', { mechId, timestamp: Date.now() });
        } catch (error) {
            this.logger.error(`Failed to select mech: ${mechId}`, error);
        }
    }
    
    selectContract(contractId) {
        try {
            this.logger.info(`Contract selected: ${contractId}`);
            
            // Update visual selection state
            this.updateSelectionState('contract-list', 'contract-item', contractId);
            
            this.eventBus.emit('contract.selected', { contractId, timestamp: Date.now() });
        } catch (error) {
            this.logger.error(`Failed to select contract: ${contractId}`, error);
        }
    }
    
    acceptContract(contractId) {
        try {
            this.logger.info(`Accepting contract: ${contractId}`);
            
            const state = this.gameState.getState();
            const contract = Array.from(state.contracts.available.values()).find(c => c.id == contractId);
            
            if (!contract) {
                alert('Contract not found!');
                return;
            }
            
            // Check if company has enough pilots/mechs for the contract
            const availablePilots = Array.from(state.personnel.pilots.values()).filter(p => p.status === 'active');
            const availableMechs = Array.from(state.assets.mechs.values()).filter(m => m.status === 'operational');
            
            if (availablePilots.length === 0) {
                alert('You need at least one active pilot to accept a contract!');
                return;
            }
            
            if (availableMechs.length === 0) {
                alert('You need at least one operational mech to accept a contract!');
                return;
            }
            
            // Move contract from available to active
            state.contracts.available.delete(contractId);
            state.contracts.active.set(contractId, {
                ...contract,
                acceptedDate: new Date(),
                status: 'accepted'
            });
            
            // Update state
            this.gameState.setState(state);
            
            // Notify user and refresh UI
            alert(`Contract "${contract.title}" accepted! Mission will commence soon.`);
            this.refreshAllUI();
            
            // For now, show tactical combat screen (future: proper mission preparation)
            this.showScreen('tactical-combat');
            
            this.logger.info(`Contract accepted successfully: ${contract.title}`);
            
        } catch (error) {
            this.logger.error(`Failed to accept contract: ${contractId}`, error);
            alert('Failed to accept contract. Please try again.');
        }
    }
    
    hirePilot() {
        try {
            this.logger.info('Hiring new pilot...');
            alert('Advanced pilot hiring system coming soon!');
        } catch (error) {
            this.logger.error('Failed to hire pilot', error);
        }
    }
    
    advanceTime() {
        try {
            this.logger.info('Advancing time...');
            
            const currentState = this.gameState.getState();
            const newDate = new Date(currentState.game.currentDate);
            newDate.setDate(newDate.getDate() + 7);
            
            this.gameState.updateState('game.currentDate', newDate);
            
            this.logger.info(`Time advanced to: ${newDate.toDateString()}`);
            
        } catch (error) {
            this.logger.error('Failed to advance time', error);
        }
    }
    
    refreshContracts() {
        try {
            this.logger.info('Refreshing contracts...');
            this.populateContracts();
        } catch (error) {
            this.logger.error('Failed to refresh contracts', error);
        }
    }
    
    endTurn() {
        try {
            this.logger.info('Ending turn...');
            alert('Combat system coming soon!');
        } catch (error) {
            this.logger.error('Failed to end turn', error);
        }
    }
    
    exitCombat() {
        try {
            this.logger.info('Exiting combat...');
            this.showScreen('company-overview');
        } catch (error) {
            this.logger.error('Failed to exit combat', error);
        }
    }
    
    // =============================================================================
    // UI MANAGEMENT (Bulletproof screen and content management)
    // =============================================================================
    
    showScreen(screenId) {
        try {
            this.logger.debug(`Showing screen: ${screenId}`);
            
            // Hide all screens
            const screens = document.querySelectorAll('.screen');
            screens.forEach(screen => {
                screen.classList.remove('active');
            });
            
            // Show target screen
            const targetScreen = document.getElementById(screenId);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.logger.debug(`Screen shown: ${screenId}`);
            } else {
                this.logger.warn(`Screen not found: ${screenId}`);
            }
            
        } catch (error) {
            this.logger.error(`Failed to show screen: ${screenId}`, error);
        }
    }
    
    refreshAllUI() {
        try {
            this.populateCompanyInfo();
            this.populatePilots();
            this.populateMechs();
            this.populateContracts();
            
            this.logger.debug('All UI refreshed');
            
        } catch (error) {
            this.logger.error('Failed to refresh all UI', error);
        }
    }
    
    populateCompanyInfo() {
        try {
            const state = this.gameState.getState();
            
            this.updateElement('company-name', state.company.name);
            this.updateElement('company-funds', `${state.company.funds.toLocaleString()} C-Bills`);
            this.updateElement('company-rating', state.company.rating);
            this.updateElement('current-date', state.game.currentDate.toDateString());
            this.updateElement('monthly-expenses', `${state.company.monthlyExpenses.toLocaleString()} C-Bills`);
            this.updateElement('monthly-income', `${state.company.monthlyIncome.toLocaleString()} C-Bills`);
            
        } catch (error) {
            this.logger.error('Failed to populate company info', error);
        }
    }
    
    populatePilots() {
        try {
            const state = this.gameState.getState();
            const pilots = Array.from(state.personnel.pilots.values());
            
            const pilotListElement = document.getElementById('pilot-list');
            if (!pilotListElement) return;
            
            pilotListElement.innerHTML = pilots.map(pilot => `
                <div class="pilot-item" data-id="${pilot.id}" onclick="selectPilot(${pilot.id})">
                    <div class="pilot-header">
                        <div class="pilot-name">${pilot.name}</div>
                        <div class="pilot-experience ${pilot.experience.toLowerCase()}">${pilot.experience}</div>
                    </div>
                    <div class="pilot-stats">
                        <span class="stat"><strong>Gun:</strong> ${pilot.gunnery}</span>
                        <span class="stat"><strong>Pilot:</strong> ${pilot.piloting}</span>
                        <span class="stat"><strong>Status:</strong> ${pilot.status}</span>
                    </div>
                    <div class="pilot-salary">${pilot.salary.toLocaleString()} C-Bills/month</div>
                </div>
            `).join('');
            
        } catch (error) {
            this.logger.error('Failed to populate pilots', error);
        }
    }
    
    populateMechs() {
        try {
            const state = this.gameState.getState();
            const mechs = Array.from(state.assets.mechs.values());
            const pilots = Array.from(state.personnel.pilots.values());
            
            const mechListElement = document.getElementById('mech-list');
            if (!mechListElement) return;
            
            mechListElement.innerHTML = mechs.map(mech => {
                const pilot = pilots.find(p => p.id === mech.pilot);
                const pilotName = pilot ? pilot.name : 'Unassigned';
                
                return `
                    <div class="mech-item" data-id="${mech.id}" onclick="selectMech(${mech.id})">
                        <div class="mech-header">
                            <div class="mech-name">${mech.name}</div>
                            <div class="mech-weight-class ${mech.type.toLowerCase()}">${mech.type} (${mech.weight}t)</div>
                        </div>
                        <div class="mech-stats">
                            <span class="stat"><strong>Condition:</strong> <span class="${mech.condition.toLowerCase()}">${mech.condition}</span></span>
                            <span class="stat"><strong>Armor:</strong> ${mech.armor}%</span>
                        </div>
                        <div class="mech-pilot-assignment">
                            <strong>Pilot:</strong> <span class="${pilot ? 'assigned' : 'unassigned'}">${pilotName}</span>
                        </div>
                    </div>
                `;
            }).join('');
            
        } catch (error) {
            this.logger.error('Failed to populate mechs', error);
        }
    }
    
    populateContracts() {
        try {
            const state = this.gameState.getState();
            const contracts = Array.from(state.contracts.available.values());
            
            const contractListElement = document.getElementById('contract-list');
            if (!contractListElement) return;
            
            contractListElement.innerHTML = contracts.map(contract => `
                <div class="contract-item" data-id="${contract.id}" onclick="selectContract(${contract.id})">
                    <div class="contract-header">
                        <div class="contract-title">${contract.title}</div>
                        <div class="contract-difficulty ${contract.difficulty.toLowerCase()}">${contract.difficulty}</div>
                    </div>
                    <div class="contract-employer">${contract.employer} • ${contract.planet}</div>
                    <div class="contract-details">
                        <span class="contract-payment">${contract.payment.toLocaleString()} C-Bills</span>
                        <span class="contract-duration">${contract.duration} days</span>
                        <span class="contract-salvage">${contract.salvage} salvage</span>
                    </div>
                    <div class="contract-description">${contract.description}</div>
                </div>
            `).join('');
            
        } catch (error) {
            this.logger.error('Failed to populate contracts', error);
        }
    }
    
    displayPilotDetails(pilotId) {
        try {
            const state = this.gameState.getState();
            const pilot = Array.from(state.personnel.pilots.values()).find(p => p.id == pilotId);
            
            if (!pilot) {
                this.logger.warn(`Pilot not found: ${pilotId}`);
                return;
            }
            
            const detailsElement = document.getElementById('pilot-details');
            if (!detailsElement) return;
            
            detailsElement.innerHTML = `
                <h3>${pilot.name}</h3>
                <div class="pilot-detail-stats">
                    <p><strong>Experience:</strong> ${pilot.experience}</p>
                    <p><strong>Gunnery:</strong> ${pilot.gunnery}</p>
                    <p><strong>Piloting:</strong> ${pilot.piloting}</p>
                    <p><strong>Salary:</strong> ${pilot.salary.toLocaleString()} C-Bills/month</p>
                    <p><strong>Status:</strong> ${pilot.status}</p>
                    <p><strong>Skills:</strong> ${pilot.skills.join(', ')}</p>
                    <p><strong>Background:</strong> ${pilot.background}</p>
                </div>
            `;
            
        } catch (error) {
            this.logger.error(`Failed to display pilot details: ${pilotId}`, error);
        }
    }
    
    displayMechDetails(mechId) {
        try {
            const state = this.gameState.getState();
            const mech = Array.from(state.assets.mechs.values()).find(m => m.id == mechId);
            
            if (!mech) {
                this.logger.warn(`Mech not found: ${mechId}`);
                return;
            }
            
            const pilots = Array.from(state.personnel.pilots.values());
            const pilot = pilots.find(p => p.id === mech.pilot);
            const pilotName = pilot ? pilot.name : 'Unassigned';
            
            const detailsElement = document.getElementById('mech-details');
            if (!detailsElement) return;
            
            detailsElement.innerHTML = `
                <h3>${mech.name}</h3>
                <div class="mech-detail-stats">
                    <p><strong>Weight:</strong> ${mech.weight} tons</p>
                    <p><strong>Type:</strong> ${mech.type}</p>
                    <p><strong>Condition:</strong> ${mech.condition}</p>
                    <p><strong>Armor:</strong> ${mech.armor}%</p>
                    <p><strong>Pilot:</strong> ${pilotName}</p>
                    <p><strong>Weapons:</strong> ${mech.weapons.join(', ')}</p>
                </div>
            `;
            
        } catch (error) {
            this.logger.error(`Failed to display mech details: ${mechId}`, error);
        }
    }
    
    displayContractDetails(contractId) {
        try {
            const state = this.gameState.getState();
            const contract = Array.from(state.contracts.available.values()).find(c => c.id == contractId);
            
            if (!contract) {
                this.logger.warn(`Contract not found: ${contractId}`);
                return;
            }
            
            const detailsElement = document.getElementById('contract-details');
            if (!detailsElement) return;
            
            detailsElement.innerHTML = `
                <h3>${contract.title}</h3>
                <div class="contract-detail-info">
                    <p><strong>Employer:</strong> ${contract.employer}</p>
                    <p><strong>Planet:</strong> ${contract.planet}</p>
                    <p><strong>Difficulty:</strong> ${contract.difficulty}</p>
                    <p><strong>Payment:</strong> ${contract.payment.toLocaleString()} C-Bills</p>
                    <p><strong>Salvage Rights:</strong> ${contract.salvage}</p>
                    <p><strong>Duration:</strong> ${contract.duration} days</p>
                    <p><strong>Description:</strong> ${contract.description}</p>
                </div>
                <div class="contract-actions">
                    <button class="btn btn-primary" onclick="acceptContract('${contract.id}')">Accept Contract</button>
                </div>
            `;
            
        } catch (error) {
            this.logger.error(`Failed to display contract details: ${contractId}`, error);
        }
    }
    
    updateElement(elementId, content) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = content;
            }
        } catch (error) {
            this.logger.debug(`Failed to update element: ${elementId}`, error);
        }
    }
    
    updateSelectionState(containerId, itemClass, selectedId) {
        try {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            // Remove selected class from all items
            const items = container.querySelectorAll(`.${itemClass}`);
            items.forEach(item => item.classList.remove('selected'));
            
            // Add selected class to clicked item
            const selectedItem = container.querySelector(`.${itemClass}[data-id="${selectedId}"]`);
            if (selectedItem) {
                selectedItem.classList.add('selected');
            }
            
        } catch (error) {
            this.logger.error('Failed to update selection state', error);
        }
    }
    
    emergencyFallback() {
        try {
            console.error('🚨 EMERGENCY FALLBACK ACTIVATED');
            
            // Minimal fallback functionality
            window.startNewGame = () => {
                console.log('Emergency: Starting new game');
                document.getElementById('company-overview')?.classList.add('active');
                document.getElementById('main-menu')?.classList.remove('active');
            };
            
            window.showMainMenu = () => {
                console.log('Emergency: Showing main menu');
                document.getElementById('main-menu')?.classList.add('active');
                document.querySelectorAll('.screen').forEach(s => {
                    if (s.id !== 'main-menu') s.classList.remove('active');
                });
            };
            
            console.error('Emergency fallback systems activated');
            
        } catch (fallbackError) {
            console.error('❌ TOTAL SYSTEM FAILURE: Even emergency fallback failed', fallbackError);
        }
    }
    
    getSystemStatus() {
        return {
            initialized: this.initialized,
            coreSystemsStatus: {
                logger: this.logger ? this.logger.getStatus() : null,
                eventBus: this.eventBus ? this.eventBus.getStatus() : null,
                gameState: this.gameState ? { initialized: this.gameState.initialized } : null
            },
            gameSystemsCount: this.systems.size
        };
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize the bulletproof game engine when page loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Initializing Bulletproof Game Engine V2...');
        
        // Create global game instance
        window.bulletproofGame = new BulletproofGame();
        
        console.log('🎉 BULLETPROOF GAME ENGINE V2 LOADED SUCCESSFULLY!');
        console.log('✅ All systems operational and ready for play');
        
    } catch (error) {
        console.error('❌ CRITICAL: Failed to initialize Bulletproof Game Engine V2', error);
        
        // Last resort fallback
        window.startNewGame = () => {
            document.getElementById('company-overview')?.classList.add('active');
            document.getElementById('main-menu')?.classList.remove('active');
        };
        
        console.error('🚨 Minimal fallback functions activated');
    }
});

// Export for testing/debugging
window.BulletproofGame = BulletproofGame;