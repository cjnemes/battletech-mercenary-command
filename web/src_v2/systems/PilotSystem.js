/**
 * Bulletproof Pilot System - Self-contained pilot management
 * This system handles all pilot operations with comprehensive error handling
 */

class PilotSystem {
    constructor(eventBus, logger, gameState) {
        this.eventBus = eventBus || console;
        this.logger = logger || console;
        this.gameState = gameState;
        this.initialized = false;
        
        // System configuration
        this.systemName = 'PilotSystem';
        this.version = '1.0.0';
        
        // Pilot generation data
        this.namePool = {
            first: ['Marcus', 'Lisa', 'Chen', 'Maria', 'David', 'Keiko', 'Anton', 'Sarah', 'Viktor', 'Elena', 'James', 'Yuki', 'Pavel', 'Anna'],
            last: ['Kane', 'Williams', 'Liu', 'Rodriguez', 'Smith', 'Tanaka', 'Volkov', 'Johnson', 'Petrov', 'Anderson', 'Brown', 'Yamamoto', 'Davis', 'Miller']
        };
        
        this.callsigns = ['Reaper', 'Razor', 'Ghost', 'Phoenix', 'Storm', 'Viper', 'Eagle', 'Wolf', 'Tiger', 'Falcon', 'Hawk', 'Bear', 'Fox', 'Lion'];
        
        this.backgrounds = [
            'Former House military veteran with combat experience',
            'Academy graduate with formal training',
            'Mercenary with extensive battlefield knowledge',
            'Ex-pirate turned legitimate with street fighting skills',
            'Noble heir with access to advanced training',
            'Dispossessed warrior seeking redemption'
        ];
        
        this.skills = [
            'Sharpshooter', 'Evasion', 'Multi-targeting', 'Heat Management',
            'Reconnaissance', 'Stealth', 'Leadership', 'Tactics',
            'Electronics', 'Survival', 'Close Quarters', 'Artillery'
        ];
        
        try {
            this.initialize();
        } catch (error) {
            this.logger.error?.(`${this.systemName} initialization failed`, error) || 
                console.error(`${this.systemName} init failed:`, error);
            throw error;
        }
    }
    
    initialize() {
        this.logger.info?.(`${this.systemName} initializing...`) || 
            console.log(`${this.systemName} initializing...`);
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Validate dependencies
        this.validateDependencies();
        
        // Register with game system
        this.registerWithGame();
        
        this.initialized = true;
        this.logger.info?.(`${this.systemName} initialized successfully`) || 
            console.log(`${this.systemName} initialized`);
        
        // Emit initialization event
        this.emitEvent('pilotsystem.initialized', { 
            version: this.version,
            timestamp: Date.now() 
        });
    }
    
    setupEventHandlers() {
        try {
            // Listen for pilot hiring requests
            this.eventBus.on?.('pilot.hire.request', (data) => {
                this.handleHirePilot(data);
            });
            
            // Listen for pilot selection
            this.eventBus.on?.('pilot.selected', (data) => {
                this.handlePilotSelection(data);
            });
            
            // Listen for pilot assignment requests
            this.eventBus.on?.('pilot.assign.request', (data) => {
                this.handlePilotAssignment(data);
            });
            
            // Listen for pilot dismissal
            this.eventBus.on?.('pilot.dismiss.request', (data) => {
                this.handlePilotDismissal(data);
            });
            
            // Listen for pilot injury/recovery
            this.eventBus.on?.('pilot.injury', (data) => {
                this.handlePilotInjury(data);
            });
            
            // Listen for pilot skill advancement
            this.eventBus.on?.('pilot.advance.skill', (data) => {
                this.handleSkillAdvancement(data);
            });
            
            // Listen for UI refresh requests
            this.eventBus.on?.('ui.refresh.pilots', () => {
                this.refreshPilotUI();
            });
            
            this.logger.debug?.(`${this.systemName} event handlers established`) || 
                console.debug(`${this.systemName} handlers ready`);
                
        } catch (error) {
            this.logger.error?.(`Failed to setup ${this.systemName} event handlers`, error) || 
                console.error(`${this.systemName} handlers failed:`, error);
        }
    }
    
    validateDependencies() {
        try {
            if (!this.gameState) {
                throw new Error('GameState dependency missing');
            }
            
            if (!this.eventBus) {
                throw new Error('EventBus dependency missing');
            }
            
            this.logger.debug?.(`${this.systemName} dependencies validated`) || 
                console.debug(`${this.systemName} dependencies OK`);
                
        } catch (error) {
            this.logger.error?.(`${this.systemName} dependency validation failed`, error) || 
                console.error(`${this.systemName} dependencies failed:`, error);
            throw error;
        }
    }
    
    registerWithGame() {
        try {
            // Register this system as a module
            this.emitEvent('module.register', {
                name: this.systemName,
                instance: this,
                version: this.version
            });
            
            this.logger.debug?.(`${this.systemName} registered with game`) || 
                console.debug(`${this.systemName} registered`);
                
        } catch (error) {
            this.logger.error?.(`Failed to register ${this.systemName}`, error) || 
                console.error(`${this.systemName} registration failed:`, error);
        }
    }
    
    /**
     * Handle pilot hiring request
     */
    handleHirePilot(data = {}) {
        try {
            this.logger.info?.('Processing pilot hiring request') || 
                console.log('Hiring pilot...');
            
            // Generate random pilot
            const newPilot = this.generateRandomPilot();
            
            // Check if company can afford the pilot
            const currentState = this.gameState.getState();
            const hiringCost = newPilot.salary * 2; // 2 months upfront
            
            if (currentState.company.funds < hiringCost) {
                this.logger.warn?.(`Insufficient funds to hire pilot: ${hiringCost} required`) || 
                    console.warn(`Cannot afford pilot: ${hiringCost} C-Bills required`);
                
                this.emitEvent('pilot.hire.failed', {
                    reason: 'insufficient_funds',
                    cost: hiringCost,
                    available: currentState.company.funds,
                    pilot: newPilot
                });
                return false;
            }
            
            // Add pilot to game state
            const pilotId = this.gameState.addPilot(newPilot);
            
            if (pilotId) {
                // Deduct hiring cost
                this.gameState.updateState('company.funds', currentState.company.funds - hiringCost);
                
                this.logger.info?.(`Pilot hired successfully: ${newPilot.name} (ID: ${pilotId})`) || 
                    console.log(`Hired: ${newPilot.name}`);
                
                // Emit success event
                this.emitEvent('pilot.hired', {
                    pilotId,
                    pilot: newPilot,
                    cost: hiringCost,
                    timestamp: Date.now()
                });
                
                // Refresh UI
                this.refreshPilotUI();
                
                return pilotId;
            } else {
                throw new Error('Failed to add pilot to game state');
            }
            
        } catch (error) {
            this.logger.error?.('Failed to hire pilot', error) || 
                console.error('Hire pilot failed:', error);
            
            this.emitEvent('pilot.hire.failed', {
                reason: 'system_error',
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Generate a random pilot with realistic stats
     */
    generateRandomPilot() {
        try {
            const firstName = this.getRandomElement(this.namePool.first);
            const lastName = this.getRandomElement(this.namePool.last);
            const callsign = this.getRandomElement(this.callsigns);
            
            // Generate experience level first (affects other stats)
            const experienceLevels = ['Green', 'Regular', 'Veteran', 'Elite'];
            const experienceWeights = [40, 35, 20, 5]; // More green pilots available
            const experience = this.getWeightedRandom(experienceLevels, experienceWeights);
            
            // Generate stats based on experience
            const statRanges = {
                'Green': { gunnery: [5, 6], piloting: [6, 7], salaryBase: 8000 },
                'Regular': { gunnery: [4, 5], piloting: [5, 6], salaryBase: 12000 },
                'Veteran': { gunnery: [3, 4], piloting: [4, 5], salaryBase: 18000 },
                'Elite': { gunnery: [2, 3], piloting: [3, 4], salaryBase: 25000 }
            };
            
            const range = statRanges[experience];
            const gunnery = this.getRandomInt(range.gunnery[0], range.gunnery[1]);
            const piloting = this.getRandomInt(range.piloting[0], range.piloting[1]);
            
            // Calculate salary with some variation
            const salaryVariation = 0.8 + (Math.random() * 0.4); // ±20% variation
            const salary = Math.floor(range.salaryBase * salaryVariation);
            
            // Generate skills (more skilled pilots have more skills)
            const skillCount = experience === 'Green' ? 1 : 
                             experience === 'Regular' ? 2 : 
                             experience === 'Veteran' ? 3 : 4;
            
            const pilotSkills = this.getRandomElements(this.skills, skillCount);
            
            const pilot = {
                name: `${firstName} "${callsign}" ${lastName}`,
                gunnery,
                piloting,
                experience,
                salary,
                status: 'Available',
                assignedMech: null,
                skills: pilotSkills,
                background: this.getRandomElement(this.backgrounds),
                injuries: [],
                hireDate: new Date(),
                combatMissions: 0,
                kills: 0,
                morale: 'Good'
            };
            
            this.logger.debug?.(`Generated pilot: ${pilot.name} (${experience})`) || 
                console.debug(`Generated: ${pilot.name}`);
            
            return pilot;
            
        } catch (error) {
            this.logger.error?.('Failed to generate random pilot', error) || 
                console.error('Pilot generation failed:', error);
            
            // Return a basic fallback pilot
            return {
                name: 'Unknown Pilot',
                gunnery: 5,
                piloting: 5,
                experience: 'Green',
                salary: 8000,
                status: 'Available',
                assignedMech: null,
                skills: ['Basic Training'],
                background: 'Unknown background',
                injuries: [],
                hireDate: new Date(),
                combatMissions: 0,
                kills: 0,
                morale: 'Good'
            };
        }
    }
    
    /**
     * Handle pilot selection for UI
     */
    handlePilotSelection(data) {
        try {
            const { pilotId } = data;
            
            if (!pilotId) {
                throw new Error('No pilot ID provided');
            }
            
            this.logger.info?.(`Pilot selected: ${pilotId}`) || 
                console.log(`Pilot selected: ${pilotId}`);
            
            // Get pilot data
            const currentState = this.gameState.getState();
            const pilots = Array.from(currentState.personnel.pilots.values());
            const selectedPilot = pilots.find(p => p.id == pilotId);
            
            if (!selectedPilot) {
                throw new Error(`Pilot not found: ${pilotId}`);
            }
            
            // Emit pilot details event for UI
            this.emitEvent('pilot.details.show', {
                pilot: selectedPilot,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.(`Failed to handle pilot selection: ${data?.pilotId}`, error) || 
                console.error(`Pilot selection failed:`, error);
            
            this.emitEvent('pilot.selection.failed', {
                pilotId: data?.pilotId,
                error: error.message
            });
        }
    }
    
    /**
     * Handle pilot assignment to mech
     */
    handlePilotAssignment(data) {
        try {
            const { pilotId, mechId } = data;
            
            if (!pilotId || !mechId) {
                throw new Error('Both pilot ID and mech ID required for assignment');
            }
            
            this.logger.info?.(`Assigning pilot ${pilotId} to mech ${mechId}`) || 
                console.log(`Assigning pilot ${pilotId} to mech ${mechId}`);
            
            // This would coordinate with MechSystem via events
            this.emitEvent('pilot.assignment.request', {
                pilotId,
                mechId,
                requestedBy: this.systemName,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.('Failed to handle pilot assignment', error) || 
                console.error('Pilot assignment failed:', error);
            
            this.emitEvent('pilot.assignment.failed', {
                pilotId: data?.pilotId,
                mechId: data?.mechId,
                error: error.message
            });
        }
    }
    
    /**
     * Handle pilot dismissal
     */
    handlePilotDismissal(data) {
        try {
            const { pilotId, reason = 'dismissed' } = data;
            
            if (!pilotId) {
                throw new Error('No pilot ID provided for dismissal');
            }
            
            this.logger.info?.(`Dismissing pilot: ${pilotId}`) || 
                console.log(`Dismissing pilot: ${pilotId}`);
            
            // Get current state
            const currentState = this.gameState.getState();
            const pilots = currentState.personnel.pilots;
            
            if (pilots.has(pilotId)) {
                const pilot = pilots.get(pilotId);
                
                // Remove from mech assignment if any
                if (pilot.assignedMech) {
                    this.emitEvent('mech.pilot.unassign', {
                        mechId: pilot.assignedMech,
                        pilotId: pilotId
                    });
                }
                
                // Remove pilot from state
                pilots.delete(pilotId);
                
                this.logger.info?.(`Pilot dismissed: ${pilot.name}`) || 
                    console.log(`Dismissed: ${pilot.name}`);
                
                this.emitEvent('pilot.dismissed', {
                    pilotId,
                    pilot,
                    reason,
                    timestamp: Date.now()
                });
                
                // Refresh UI
                this.refreshPilotUI();
                
                return true;
            } else {
                throw new Error(`Pilot not found: ${pilotId}`);
            }
            
        } catch (error) {
            this.logger.error?.(`Failed to dismiss pilot: ${data?.pilotId}`, error) || 
                console.error('Pilot dismissal failed:', error);
            
            this.emitEvent('pilot.dismissal.failed', {
                pilotId: data?.pilotId,
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Handle pilot injury
     */
    handlePilotInjury(data) {
        try {
            const { pilotId, injury, severity = 'minor' } = data;
            
            if (!pilotId) {
                throw new Error('No pilot ID provided for injury');
            }
            
            this.logger.info?.(`Processing pilot injury: ${pilotId}`) || 
                console.log(`Pilot injury: ${pilotId}`);
            
            // Get current state
            const currentState = this.gameState.getState();
            const pilots = currentState.personnel.pilots;
            
            if (pilots.has(pilotId)) {
                const pilot = pilots.get(pilotId);
                
                // Add injury to pilot record
                const injuryRecord = {
                    type: injury || 'Combat injury',
                    severity: severity,
                    date: new Date(),
                    healingTime: this.calculateHealingTime(severity)
                };
                
                pilot.injuries.push(injuryRecord);
                pilot.status = 'Injured';
                pilot.morale = severity === 'severe' ? 'Poor' : 'Fair';
                
                this.logger.info?.(`Pilot injured: ${pilot.name} - ${injury}`) || 
                    console.log(`${pilot.name} injured: ${injury}`);
                
                this.emitEvent('pilot.injured', {
                    pilotId,
                    pilot,
                    injury: injuryRecord,
                    timestamp: Date.now()
                });
                
                // Refresh UI
                this.refreshPilotUI();
                
                return true;
            } else {
                throw new Error(`Pilot not found: ${pilotId}`);
            }
            
        } catch (error) {
            this.logger.error?.(`Failed to process pilot injury: ${data?.pilotId}`, error) || 
                console.error('Pilot injury failed:', error);
            
            return false;
        }
    }
    
    /**
     * Handle skill advancement
     */
    handleSkillAdvancement(data) {
        try {
            const { pilotId, skill, improvement } = data;
            
            if (!pilotId) {
                throw new Error('No pilot ID provided for skill advancement');
            }
            
            this.logger.info?.(`Processing skill advancement: ${pilotId}`) || 
                console.log(`Skill advancement: ${pilotId}`);
            
            // Implementation would go here
            // This is a placeholder for future expansion
            
            this.emitEvent('pilot.skill.advanced', {
                pilotId,
                skill,
                improvement,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.(`Failed to advance pilot skill: ${data?.pilotId}`, error) || 
                console.error('Skill advancement failed:', error);
        }
    }
    
    /**
     * Refresh pilot UI
     */
    refreshPilotUI() {
        try {
            this.emitEvent('ui.pilot.refresh', {
                source: this.systemName,
                timestamp: Date.now()
            });
            
            this.logger.debug?.('Pilot UI refresh requested') || 
                console.debug('Refreshing pilot UI');
                
        } catch (error) {
            this.logger.error?.('Failed to refresh pilot UI', error) || 
                console.error('Pilot UI refresh failed:', error);
        }
    }
    
    /**
     * Utility methods
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
    
    getRandomElements(array, count) {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }
    
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    getWeightedRandom(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            if (random < weights[i]) {
                return items[i];
            }
            random -= weights[i];
        }
        
        return items[items.length - 1];
    }
    
    calculateHealingTime(severity) {
        const baseTime = {
            'minor': 7,    // 1 week
            'moderate': 21, // 3 weeks  
            'severe': 42   // 6 weeks
        };
        
        return baseTime[severity] || 7;
    }
    
    /**
     * Get system status
     */
    getStatus() {
        try {
            const currentState = this.gameState.getState();
            const pilots = Array.from(currentState.personnel.pilots.values());
            
            return {
                initialized: this.initialized,
                systemName: this.systemName,
                version: this.version,
                totalPilots: pilots.length,
                availablePilots: pilots.filter(p => p.status === 'Available').length,
                injuredPilots: pilots.filter(p => p.status === 'Injured').length,
                assignedPilots: pilots.filter(p => p.assignedMech).length,
                experienceBreakdown: {
                    Green: pilots.filter(p => p.experience === 'Green').length,
                    Regular: pilots.filter(p => p.experience === 'Regular').length,
                    Veteran: pilots.filter(p => p.experience === 'Veteran').length,
                    Elite: pilots.filter(p => p.experience === 'Elite').length
                }
            };
        } catch (error) {
            this.logger.error?.('Failed to get pilot system status', error) || 
                console.error('Pilot status failed:', error);
            
            return {
                initialized: this.initialized,
                systemName: this.systemName,
                error: error.message
            };
        }
    }
    
    emitEvent(eventName, data) {
        try {
            if (this.eventBus && this.eventBus.emit) {
                this.eventBus.emit(eventName, data);
            }
        } catch (error) {
            console.error(`Failed to emit pilot event: ${eventName}`, error);
        }
    }
    
    /**
     * Shutdown method
     */
    shutdown() {
        try {
            this.logger.info?.(`${this.systemName} shutdown initiated`) || 
                console.log(`${this.systemName} shutdown`);
            
            this.initialized = false;
            
            this.emitEvent('pilotsystem.shutdown', { timestamp: Date.now() });
            
            this.logger.info?.(`${this.systemName} shutdown complete`) || 
                console.log(`${this.systemName} shutdown complete`);
                
        } catch (error) {
            console.error(`${this.systemName} shutdown failed:`, error);
        }
    }
}

// Export for use in other modules
window.BattletechPilotSystem = PilotSystem;

export default PilotSystem;