/**
 * Bulletproof Game State - Centralized state management system
 * This system manages all game data with validation and change tracking
 */

class GameState {
    constructor(eventBus, logger) {
        this.eventBus = eventBus || console;
        this.logger = logger || console;
        this.initialized = false;
        
        // State data
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
                currentDate: new Date(3025, 0, 1), // January 1, 3025
                difficulty: 'normal',
                version: '2.0.0'
            },
            personnel: {
                pilots: new Map(),
                staff: new Map(),
                nextPilotId: 1
            },
            assets: {
                mechs: new Map(),
                equipment: new Map(),
                nextMechId: 1
            },
            contracts: {
                available: new Map(),
                active: new Map(),
                completed: new Map(),
                nextContractId: 1
            },
            meta: {
                saveVersion: '2.0.0',
                lastSaved: null,
                playTime: 0,
                startTime: Date.now()
            }
        };
        
        // State validation rules
        this.validationRules = {
            'company.funds': (value) => typeof value === 'number' && value >= 0,
            'company.name': (value) => typeof value === 'string' && value.length > 0,
            'company.rating': (value) => ['Green', 'Regular', 'Veteran', 'Elite'].includes(value)
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
        
        // Set up state change listeners
        this.setupStateChangeHandlers();
        
        // Initialize default pilots
        this.initializeDefaultPilots();
        
        // Initialize default mechs
        this.initializeDefaultMechs();
        
        // Initialize default contracts
        this.initializeDefaultContracts();
        
        // Mark as initialized
        this.initialized = true;
        
        this.logger.info?.('GameState initialized successfully') || console.log('GameState initialized');
        
        // Emit initialization event
        this.emitStateChange('gamestate.initialized', { timestamp: Date.now() });
    }
    
    setupStateChangeHandlers() {
        try {
            // Listen for time advancement
            this.eventBus.on?.('game.time.advance', (data) => {
                this.advanceTime(data.days || 7);
            });
            
            // Listen for company updates
            this.eventBus.on?.('company.update', (data) => {
                this.updateCompany(data);
            });
            
            this.logger.debug?.('State change handlers established') || 
                console.debug('State handlers ready');
                
        } catch (error) {
            this.logger.error?.('Failed to setup state change handlers', error) || 
                console.error('State handlers failed:', error);
        }
    }
    
    initializeDefaultPilots() {
        try {
            const defaultPilots = [
                {
                    name: 'Marcus "Reaper" Kane',
                    gunnery: 2,
                    piloting: 3,
                    experience: 'Elite',
                    salary: 25000,
                    skills: ['Sharpshooter', 'Evasion'],
                    background: 'Former Steiner regular who joined after the Battle of Mallory\'s World.'
                },
                {
                    name: 'Lisa "Razor" Williams',
                    gunnery: 3,
                    piloting: 4,
                    experience: 'Veteran',
                    salary: 18000,
                    skills: ['Multi-targeting', 'Heat Management'],
                    background: 'Capellan expatriate with expertise in urban combat operations.'
                },
                {
                    name: 'Chen "Ghost" Liu',
                    gunnery: 4,
                    piloting: 3,
                    experience: 'Regular',
                    salary: 12000,
                    skills: ['Reconnaissance', 'Stealth'],
                    background: 'Former DCMS scout with knowledge of Kurita tactics and territory.'
                }
            ];
            
            defaultPilots.forEach(pilot => {
                this.addPilot({
                    ...pilot,
                    id: this.state.personnel.nextPilotId++,
                    status: 'Available',
                    assignedMech: null,
                    injuries: [],
                    hireDate: new Date(this.state.game.currentDate)
                });
            });
            
        } catch (error) {
            this.logger.error?.('Failed to initialize default pilots', error) || 
                console.error('Default pilots failed:', error);
        }
    }
    
    initializeDefaultMechs() {
        try {
            const defaultMechs = [
                {
                    name: 'Centurion CN9-A',
                    weight: 50,
                    type: 'Medium',
                    condition: 'Excellent',
                    pilot: 1,
                    weapons: ['AC/10', 'LRM-10', 'Medium Laser'],
                    armor: 100
                },
                {
                    name: 'Phoenix Hawk PXH-1',
                    weight: 45,
                    type: 'Medium',
                    condition: 'Good',
                    pilot: 2,
                    weapons: ['Large Laser', '2x Machine Gun'],
                    armor: 85
                },
                {
                    name: 'Locust LCT-1V',
                    weight: 20,
                    type: 'Light',
                    condition: 'Fair',
                    pilot: null,
                    weapons: ['Medium Laser', '2x Machine Gun'],
                    armor: 60
                }
            ];
            
            defaultMechs.forEach(mech => {
                this.addMech({
                    ...mech,
                    id: this.state.assets.nextMechId++,
                    maintenanceCost: Math.floor(mech.weight * 100),
                    lastMaintenance: new Date(this.state.game.currentDate)
                });
            });
            
        } catch (error) {
            this.logger.error?.('Failed to initialize default mechs', error) || 
                console.error('Default mechs failed:', error);
        }
    }
    
    initializeDefaultContracts() {
        try {
            const defaultContracts = [
                {
                    title: 'Pirate Suppression - Galatea',
                    employer: 'Mercenary Review Board',
                    planet: 'Galatea',
                    difficulty: 'Easy',
                    payment: 150000,
                    salvage: 'Standard',
                    duration: 30,
                    description: 'Clear out pirate raiders threatening local shipping lanes.',
                    requirements: { minRating: 'Green', minMechs: 2 }
                },
                {
                    title: 'Escort Duty - New Avalon',
                    employer: 'Federated Suns',
                    planet: 'New Avalon',
                    difficulty: 'Medium',
                    payment: 250000,
                    salvage: 'Limited',
                    duration: 45,
                    description: 'Provide security for diplomatic convoy through contested territory.',
                    requirements: { minRating: 'Regular', minMechs: 3 }
                },
                {
                    title: 'Garrison Contract - Solaris VII',
                    employer: 'Solaris Stables',
                    planet: 'Solaris VII',
                    difficulty: 'Hard',
                    payment: 400000,
                    salvage: 'Generous',
                    duration: 60,
                    description: 'Defend arena facilities from corporate sabotage attempts.',
                    requirements: { minRating: 'Veteran', minMechs: 4 }
                }
            ];
            
            defaultContracts.forEach(contract => {
                this.addContract({
                    ...contract,
                    id: this.state.contracts.nextContractId++,
                    status: 'Available',
                    expires: new Date(this.state.game.currentDate.getTime() + (30 * 24 * 60 * 60 * 1000))
                });
            });
            
        } catch (error) {
            this.logger.error?.('Failed to initialize default contracts', error) || 
                console.error('Default contracts failed:', error);
        }
    }
    
    /**
     * Get current game state (read-only)
     */
    getState() {
        return this.deepClone(this.state);
    }
    
    /**
     * Get specific state section
     */
    getStateSection(section) {
        try {
            if (!this.state[section]) {
                this.logger.warn?.(`Unknown state section: ${section}`) || 
                    console.warn(`Unknown state section: ${section}`);
                return null;
            }
            
            return this.deepClone(this.state[section]);
            
        } catch (error) {
            this.logger.error?.(`Failed to get state section: ${section}`, error) || 
                console.error(`Get state section failed: ${section}`, error);
            return null;
        }
    }
    
    /**
     * Update state with validation
     */
    updateState(path, value) {
        try {
            if (!path || typeof path !== 'string') {
                throw new Error('State path must be a valid string');
            }
            
            // Validate the update
            if (!this.validateStateUpdate(path, value)) {
                throw new Error(`State validation failed for path: ${path}`);
            }
            
            // Store old value for change event
            const oldValue = this.getValueByPath(path);
            
            // Update the state
            this.setValueByPath(path, value);
            
            // Emit change event
            this.emitStateChange('state.updated', {
                path,
                oldValue,
                newValue: value,
                timestamp: Date.now()
            });
            
            this.logger.debug?.(`State updated: ${path}`) || console.debug(`State updated: ${path}`);
            
            return true;
            
        } catch (error) {
            this.logger.error?.(`Failed to update state: ${path}`, error) || 
                console.error(`State update failed: ${path}`, error);
            return false;
        }
    }
    
    /**
     * Validate state updates
     */
    validateStateUpdate(path, value) {
        try {
            const rule = this.validationRules[path];
            if (rule && typeof rule === 'function') {
                return rule(value);
            }
            
            // No specific rule, allow update
            return true;
            
        } catch (error) {
            this.logger.error?.(`Validation error for path: ${path}`, error) || 
                console.error(`Validation failed: ${path}`, error);
            return false;
        }
    }
    
    /**
     * Add a new pilot
     */
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
                injuries: pilotData.injuries || [],
                hireDate: pilotData.hireDate || new Date(this.state.game.currentDate)
            };
            
            this.state.personnel.pilots.set(pilot.id, pilot);
            
            this.emitStateChange('pilot.added', { pilot });
            
            return pilot.id;
            
        } catch (error) {
            this.logger.error?.('Failed to add pilot', error) || console.error('Add pilot failed:', error);
            return null;
        }
    }
    
    /**
     * Add a new mech
     */
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
                maintenanceCost: mechData.maintenanceCost || 5000,
                lastMaintenance: mechData.lastMaintenance || new Date(this.state.game.currentDate)
            };
            
            this.state.assets.mechs.set(mech.id, mech);
            
            this.emitStateChange('mech.added', { mech });
            
            return mech.id;
            
        } catch (error) {
            this.logger.error?.('Failed to add mech', error) || console.error('Add mech failed:', error);
            return null;
        }
    }
    
    /**
     * Add a new contract
     */
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
                requirements: contractData.requirements || {},
                status: contractData.status || 'Available',
                expires: contractData.expires || new Date(this.state.game.currentDate.getTime() + (30 * 24 * 60 * 60 * 1000))
            };
            
            this.state.contracts.available.set(contract.id, contract);
            
            this.emitStateChange('contract.added', { contract });
            
            return contract.id;
            
        } catch (error) {
            this.logger.error?.('Failed to add contract', error) || console.error('Add contract failed:', error);
            return null;
        }
    }
    
    /**
     * Advance game time
     */
    advanceTime(days = 7) {
        try {
            const oldDate = new Date(this.state.game.currentDate);
            
            this.state.game.currentDate.setDate(this.state.game.currentDate.getDate() + days);
            
            // Process monthly expenses if month changed
            if (oldDate.getMonth() !== this.state.game.currentDate.getMonth()) {
                this.processMonthlyExpenses();
            }
            
            this.emitStateChange('time.advanced', {
                oldDate,
                newDate: new Date(this.state.game.currentDate),
                daysAdvanced: days
            });
            
            return true;
            
        } catch (error) {
            this.logger.error?.('Failed to advance time', error) || console.error('Time advance failed:', error);
            return false;
        }
    }
    
    /**
     * Process monthly expenses
     */
    processMonthlyExpenses() {
        try {
            const expenses = this.calculateMonthlyExpenses();
            const income = this.state.company.monthlyIncome;
            const netChange = income - expenses;
            
            this.state.company.funds += netChange;
            
            this.emitStateChange('monthly.processed', {
                expenses,
                income,
                netChange,
                newFunds: this.state.company.funds
            });
            
        } catch (error) {
            this.logger.error?.('Failed to process monthly expenses', error) || 
                console.error('Monthly expenses failed:', error);
        }
    }
    
    /**
     * Calculate current monthly expenses
     */
    calculateMonthlyExpenses() {
        try {
            let total = 0;
            
            // Base company expenses
            total += 20000; // Base operations
            
            // Pilot salaries
            for (const pilot of this.state.personnel.pilots.values()) {
                total += pilot.salary || 0;
            }
            
            // Mech maintenance
            for (const mech of this.state.assets.mechs.values()) {
                total += mech.maintenanceCost || 0;
            }
            
            this.state.company.monthlyExpenses = total;
            return total;
            
        } catch (error) {
            this.logger.error?.('Failed to calculate monthly expenses', error) || 
                console.error('Expense calculation failed:', error);
            return this.state.company.monthlyExpenses;
        }
    }
    
    /**
     * Helper methods
     */
    getValueByPath(path) {
        try {
            const parts = path.split('.');
            let current = this.state;
            
            for (const part of parts) {
                current = current[part];
                if (current === undefined) break;
            }
            
            return current;
            
        } catch (error) {
            return undefined;
        }
    }
    
    setValueByPath(path, value) {
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
            
        } catch (error) {
            this.logger.error?.(`Failed to set value by path: ${path}`, error) || 
                console.error(`Set value failed: ${path}`, error);
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
            return obj; // Return original if cloning fails
        }
    }
    
    emitStateChange(eventName, data) {
        try {
            if (this.eventBus && this.eventBus.emit) {
                this.eventBus.emit(eventName, data);
            }
        } catch (error) {
            console.error(`Failed to emit state change: ${eventName}`, error);
        }
    }
}

// Export for use in other modules
window.BattletechGameState = GameState;

export default GameState;