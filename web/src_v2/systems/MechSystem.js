/**
 * Bulletproof Mech System - Self-contained mech management
 * This system handles all mech operations with comprehensive error handling
 */

class MechSystem {
    constructor(eventBus, logger, gameState) {
        this.eventBus = eventBus || console;
        this.logger = logger || console;
        this.gameState = gameState;
        this.initialized = false;
        
        // System configuration
        this.systemName = 'MechSystem';
        this.version = '1.0.0';
        
        // Mech database
        this.mechDatabase = {
            light: [
                { name: 'Locust LCT-1V', weight: 20, cost: 1500000, weapons: ['Medium Laser', '2x Machine Gun'], armor: 60 },
                { name: 'Commando COM-2D', weight: 25, cost: 1800000, weapons: ['SRM-2', '2x Medium Laser'], armor: 70 },
                { name: 'Spider SDR-5V', weight: 30, cost: 2200000, weapons: ['2x Medium Laser'], armor: 75 },
                { name: 'Jenner JR7-D', weight: 35, cost: 2900000, weapons: ['SRM-4', '4x Medium Laser'], armor: 85 }
            ],
            medium: [
                { name: 'Centurion CN9-A', weight: 50, cost: 4200000, weapons: ['AC/10', 'LRM-10', 'Medium Laser'], armor: 100 },
                { name: 'Phoenix Hawk PXH-1', weight: 45, cost: 3800000, weapons: ['Large Laser', '2x Machine Gun'], armor: 95 },
                { name: 'Wolverine WVR-6R', weight: 55, cost: 4800000, weapons: ['AC/5', 'SRM-6', 'Medium Laser'], armor: 110 },
                { name: 'Griffin GRF-1N', weight: 55, cost: 4900000, weapons: ['PPC', 'LRM-10'], armor: 105 }
            ],
            heavy: [
                { name: 'Catapult CPLT-C1', weight: 65, cost: 6200000, weapons: ['2x LRM-15'], armor: 130 },
                { name: 'JagerMech JM6-S', weight: 65, cost: 5800000, weapons: ['2x AC/5', '4x Medium Laser'], armor: 125 },
                { name: 'Rifleman RFL-3N', weight: 60, cost: 5500000, weapons: ['2x Large Laser', '2x AC/5'], armor: 115 },
                { name: 'Thunderbolt TDR-5S', weight: 65, cost: 6000000, weapons: ['SRM-2', 'LRM-15', 'Large Laser'], armor: 135 }
            ],
            assault: [
                { name: 'Atlas AS7-D', weight: 100, cost: 9500000, weapons: ['AC/20', 'LRM-20', 'SRM-6', 'Medium Laser'], armor: 180 },
                { name: 'BattleMaster BLR-1G', weight: 85, cost: 8200000, weapons: ['PPC', 'SRM-6', '6x Medium Laser'], armor: 160 },
                { name: 'Stalker STK-3F', weight: 85, cost: 7900000, weapons: ['2x LRM-10', '4x Medium Laser'], armor: 155 },
                { name: 'Highlander HGN-732', weight: 90, cost: 8800000, weapons: ['Gauss Rifle', 'SRM-6', '2x Medium Laser'], armor: 170 }
            ]
        };
        
        // Condition descriptions
        this.conditionLevels = {
            'Excellent': { multiplier: 1.0, description: 'Perfect condition, no issues' },
            'Good': { multiplier: 0.9, description: 'Minor wear, fully operational' },
            'Fair': { multiplier: 0.8, description: 'Noticeable wear, some systems degraded' },
            'Poor': { multiplier: 0.6, description: 'Significant damage, reduced performance' },
            'Salvage': { multiplier: 0.3, description: 'Barely operational, major repairs needed' }
        };
        
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
        this.emitEvent('mechsystem.initialized', { 
            version: this.version,
            timestamp: Date.now() 
        });
    }
    
    setupEventHandlers() {
        try {
            // Listen for mech selection
            this.eventBus.on?.('mech.selected', (data) => {
                this.handleMechSelection(data);
            });
            
            // Listen for pilot assignment requests
            this.eventBus.on?.('mech.pilot.assign', (data) => {
                this.handlePilotAssignment(data);
            });
            
            // Listen for pilot unassignment
            this.eventBus.on?.('mech.pilot.unassign', (data) => {
                this.handlePilotUnassignment(data);
            });
            
            // Listen for mech purchase requests
            this.eventBus.on?.('mech.purchase.request', (data) => {
                this.handleMechPurchase(data);
            });
            
            // Listen for mech sale requests
            this.eventBus.on?.('mech.sell.request', (data) => {
                this.handleMechSale(data);
            });
            
            // Listen for mech repair requests
            this.eventBus.on?.('mech.repair.request', (data) => {
                this.handleMechRepair(data);
            });
            
            // Listen for mech damage
            this.eventBus.on?.('mech.damage', (data) => {
                this.handleMechDamage(data);
            });
            
            // Listen for UI refresh requests
            this.eventBus.on?.('ui.refresh.mechs', () => {
                this.refreshMechUI();
            });
            
            // Listen for pilot assignment requests from PilotSystem
            this.eventBus.on?.('pilot.assignment.request', (data) => {
                this.handlePilotAssignmentFromPilotSystem(data);
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
     * Handle mech selection for UI
     */
    handleMechSelection(data) {
        try {
            const { mechId } = data;
            
            if (!mechId) {
                throw new Error('No mech ID provided');
            }
            
            this.logger.info?.(`Mech selected: ${mechId}`) || 
                console.log(`Mech selected: ${mechId}`);
            
            // Get mech data
            const currentState = this.gameState.getState();
            const mechs = Array.from(currentState.assets.mechs.values());
            const selectedMech = mechs.find(m => m.id == mechId);
            
            if (!selectedMech) {
                throw new Error(`Mech not found: ${mechId}`);
            }
            
            // Get pilot information if assigned
            let pilotInfo = null;
            if (selectedMech.pilot) {
                const pilots = Array.from(currentState.personnel.pilots.values());
                pilotInfo = pilots.find(p => p.id == selectedMech.pilot);
            }
            
            // Emit mech details event for UI
            this.emitEvent('mech.details.show', {
                mech: selectedMech,
                pilot: pilotInfo,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.(`Failed to handle mech selection: ${data?.mechId}`, error) || 
                console.error(`Mech selection failed:`, error);
            
            this.emitEvent('mech.selection.failed', {
                mechId: data?.mechId,
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
            
            // Get current state
            const currentState = this.gameState.getState();
            const mechs = currentState.assets.mechs;
            const pilots = currentState.personnel.pilots;
            
            // Validate mech exists
            if (!mechs.has(mechId)) {
                throw new Error(`Mech not found: ${mechId}`);
            }
            
            // Validate pilot exists  
            if (!pilots.has(pilotId)) {
                throw new Error(`Pilot not found: ${pilotId}`);
            }
            
            const mech = mechs.get(mechId);
            const pilot = pilots.get(pilotId);
            
            // Check if pilot is available
            if (pilot.status !== 'Available') {
                throw new Error(`Pilot ${pilot.name} is not available (Status: ${pilot.status})`);
            }
            
            // Check if mech already has a pilot
            if (mech.pilot) {
                // Unassign current pilot first
                const currentPilot = pilots.get(mech.pilot);
                if (currentPilot) {
                    currentPilot.assignedMech = null;
                    currentPilot.status = 'Available';
                }
            }
            
            // Check if pilot is assigned to another mech
            if (pilot.assignedMech) {
                const currentMech = mechs.get(pilot.assignedMech);
                if (currentMech) {
                    currentMech.pilot = null;
                }
            }
            
            // Make the assignment
            mech.pilot = pilotId;
            pilot.assignedMech = mechId;
            pilot.status = 'Assigned';
            
            this.logger.info?.(`Assignment complete: ${pilot.name} -> ${mech.name}`) || 
                console.log(`Assigned: ${pilot.name} -> ${mech.name}`);
            
            // Emit success event
            this.emitEvent('pilot.assigned.success', {
                pilotId,
                mechId,
                pilot,
                mech,
                timestamp: Date.now()
            });
            
            // Refresh UI
            this.refreshMechUI();
            this.emitEvent('ui.pilot.refresh', { source: this.systemName });
            
            return true;
            
        } catch (error) {
            this.logger.error?.('Failed to assign pilot to mech', error) || 
                console.error('Pilot assignment failed:', error);
            
            this.emitEvent('pilot.assignment.failed', {
                pilotId: data?.pilotId,
                mechId: data?.mechId,
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Handle pilot assignment request from PilotSystem
     */
    handlePilotAssignmentFromPilotSystem(data) {
        try {
            this.logger.debug?.('Received pilot assignment request from PilotSystem') || 
                console.debug('Pilot assignment from PilotSystem');
            
            // Forward to standard assignment handler
            return this.handlePilotAssignment(data);
            
        } catch (error) {
            this.logger.error?.('Failed to handle pilot assignment from PilotSystem', error) || 
                console.error('PilotSystem assignment failed:', error);
        }
    }
    
    /**
     * Handle pilot unassignment from mech
     */
    handlePilotUnassignment(data) {
        try {
            const { mechId, pilotId } = data;
            
            this.logger.info?.(`Unassigning pilot from mech: ${mechId}`) || 
                console.log(`Unassigning pilot from mech: ${mechId}`);
            
            // Get current state
            const currentState = this.gameState.getState();
            const mechs = currentState.assets.mechs;
            const pilots = currentState.personnel.pilots;
            
            if (mechId && mechs.has(mechId)) {
                const mech = mechs.get(mechId);
                if (mech.pilot) {
                    const pilot = pilots.get(mech.pilot);
                    if (pilot) {
                        pilot.assignedMech = null;
                        pilot.status = 'Available';
                    }
                    mech.pilot = null;
                    
                    this.logger.info?.(`Pilot unassigned from ${mech.name}`) || 
                        console.log(`Pilot unassigned from ${mech.name}`);
                }
            }
            
            if (pilotId && pilots.has(pilotId)) {
                const pilot = pilots.get(pilotId);
                if (pilot.assignedMech) {
                    const mech = mechs.get(pilot.assignedMech);
                    if (mech) {
                        mech.pilot = null;
                    }
                    pilot.assignedMech = null;
                    pilot.status = 'Available';
                }
            }
            
            // Emit unassignment event
            this.emitEvent('pilot.unassigned', {
                mechId,
                pilotId,
                timestamp: Date.now()
            });
            
            // Refresh UI
            this.refreshMechUI();
            this.emitEvent('ui.pilot.refresh', { source: this.systemName });
            
        } catch (error) {
            this.logger.error?.('Failed to unassign pilot from mech', error) || 
                console.error('Pilot unassignment failed:', error);
        }
    }
    
    /**
     * Handle mech purchase request
     */
    handleMechPurchase(data) {
        try {
            const { mechType, mechVariant } = data;
            
            this.logger.info?.(`Processing mech purchase request: ${mechType}`) || 
                console.log(`Purchasing mech: ${mechType}`);
            
            // Find mech in database
            let selectedMech = null;
            
            if (mechVariant) {
                // Specific variant requested
                for (const category of Object.values(this.mechDatabase)) {
                    selectedMech = category.find(m => m.name === mechVariant);
                    if (selectedMech) break;
                }
            } else if (mechType) {
                // Random mech from category
                const category = this.mechDatabase[mechType.toLowerCase()];
                if (category && category.length > 0) {
                    selectedMech = category[Math.floor(Math.random() * category.length)];
                }
            }
            
            if (!selectedMech) {
                throw new Error(`Mech not found: ${mechVariant || mechType}`);
            }
            
            // Check if company can afford the mech
            const currentState = this.gameState.getState();
            const mechCost = selectedMech.cost;
            
            if (currentState.company.funds < mechCost) {
                this.logger.warn?.(`Insufficient funds for mech purchase: ${mechCost} required`) || 
                    console.warn(`Cannot afford mech: ${mechCost} C-Bills required`);
                
                this.emitEvent('mech.purchase.failed', {
                    reason: 'insufficient_funds',
                    cost: mechCost,
                    available: currentState.company.funds,
                    mech: selectedMech
                });
                return false;
            }
            
            // Create mech object
            const newMech = {
                ...selectedMech,
                pilot: null,
                condition: this.getRandomCondition(),
                lastMaintenance: new Date(),
                maintenanceCost: Math.floor(selectedMech.weight * 100),
                combatMissions: 0,
                totalDamage: 0
            };
            
            // Add mech to game state
            const mechId = this.gameState.addMech(newMech);
            
            if (mechId) {
                // Deduct cost
                this.gameState.updateState('company.funds', currentState.company.funds - mechCost);
                
                this.logger.info?.(`Mech purchased successfully: ${newMech.name} (ID: ${mechId})`) || 
                    console.log(`Purchased: ${newMech.name}`);
                
                // Emit success event
                this.emitEvent('mech.purchased', {
                    mechId,
                    mech: newMech,
                    cost: mechCost,
                    timestamp: Date.now()
                });
                
                // Refresh UI
                this.refreshMechUI();
                
                return mechId;
            } else {
                throw new Error('Failed to add mech to game state');
            }
            
        } catch (error) {
            this.logger.error?.('Failed to purchase mech', error) || 
                console.error('Mech purchase failed:', error);
            
            this.emitEvent('mech.purchase.failed', {
                reason: 'system_error',
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Handle mech sale request
     */
    handleMechSale(data) {
        try {
            const { mechId } = data;
            
            if (!mechId) {
                throw new Error('No mech ID provided for sale');
            }
            
            this.logger.info?.(`Processing mech sale: ${mechId}`) || 
                console.log(`Selling mech: ${mechId}`);
            
            // Get current state
            const currentState = this.gameState.getState();
            const mechs = currentState.assets.mechs;
            
            if (!mechs.has(mechId)) {
                throw new Error(`Mech not found: ${mechId}`);
            }
            
            const mech = mechs.get(mechId);
            
            // Unassign pilot if any
            if (mech.pilot) {
                this.handlePilotUnassignment({ mechId });
            }
            
            // Calculate sale price (condition affects price)
            const conditionMultiplier = this.conditionLevels[mech.condition]?.multiplier || 0.5;
            const basePrice = this.findMechBasePrice(mech.name);
            const salePrice = Math.floor(basePrice * conditionMultiplier * 0.6); // 60% of condition-adjusted value
            
            // Remove mech from state
            mechs.delete(mechId);
            
            // Add funds
            this.gameState.updateState('company.funds', currentState.company.funds + salePrice);
            
            this.logger.info?.(`Mech sold: ${mech.name} for ${salePrice} C-Bills`) || 
                console.log(`Sold ${mech.name} for ${salePrice} C-Bills`);
            
            this.emitEvent('mech.sold', {
                mechId,
                mech,
                salePrice,
                timestamp: Date.now()
            });
            
            // Refresh UI
            this.refreshMechUI();
            
            return salePrice;
            
        } catch (error) {
            this.logger.error?.(`Failed to sell mech: ${data?.mechId}`, error) || 
                console.error('Mech sale failed:', error);
            
            this.emitEvent('mech.sale.failed', {
                mechId: data?.mechId,
                error: error.message
            });
            
            return false;
        }
    }
    
    /**
     * Handle mech repair request
     */
    handleMechRepair(data) {
        try {
            const { mechId, repairLevel = 'basic' } = data;
            
            if (!mechId) {
                throw new Error('No mech ID provided for repair');
            }
            
            this.logger.info?.(`Processing mech repair: ${mechId}`) || 
                console.log(`Repairing mech: ${mechId}`);
            
            // Get current state
            const currentState = this.gameState.getState();
            const mechs = currentState.assets.mechs;
            
            if (!mechs.has(mechId)) {
                throw new Error(`Mech not found: ${mechId}`);
            }
            
            const mech = mechs.get(mechId);
            
            // Calculate repair cost based on current condition and repair level
            const repairCosts = {
                'basic': mech.weight * 1000,
                'full': mech.weight * 2000,
                'overhaul': mech.weight * 3000
            };
            
            const repairCost = repairCosts[repairLevel] || repairCosts.basic;
            
            // Check if company can afford repair
            if (currentState.company.funds < repairCost) {
                this.emitEvent('mech.repair.failed', {
                    reason: 'insufficient_funds',
                    cost: repairCost,
                    available: currentState.company.funds
                });
                return false;
            }
            
            // Perform repair
            const conditionImprovements = {
                'basic': { 'Poor': 'Fair', 'Salvage': 'Poor' },
                'full': { 'Poor': 'Good', 'Fair': 'Good', 'Salvage': 'Fair' },
                'overhaul': { 'Poor': 'Excellent', 'Fair': 'Excellent', 'Good': 'Excellent', 'Salvage': 'Good' }
            };
            
            const improvement = conditionImprovements[repairLevel];
            if (improvement && improvement[mech.condition]) {
                mech.condition = improvement[mech.condition];
            }
            
            // Update armor and last maintenance
            if (repairLevel === 'full' || repairLevel === 'overhaul') {
                mech.armor = 100;
            } else {
                mech.armor = Math.min(100, mech.armor + 20);
            }
            
            mech.lastMaintenance = new Date();
            
            // Deduct cost
            this.gameState.updateState('company.funds', currentState.company.funds - repairCost);
            
            this.logger.info?.(`Mech repaired: ${mech.name} - ${repairLevel} repair`) || 
                console.log(`Repaired ${mech.name}: ${repairLevel}`);
            
            this.emitEvent('mech.repaired', {
                mechId,
                mech,
                repairLevel,
                cost: repairCost,
                timestamp: Date.now()
            });
            
            // Refresh UI
            this.refreshMechUI();
            
            return true;
            
        } catch (error) {
            this.logger.error?.(`Failed to repair mech: ${data?.mechId}`, error) || 
                console.error('Mech repair failed:', error);
            
            return false;
        }
    }
    
    /**
     * Handle mech damage
     */
    handleMechDamage(data) {
        try {
            const { mechId, damage, damageType = 'combat' } = data;
            
            if (!mechId) {
                throw new Error('No mech ID provided for damage');
            }
            
            this.logger.info?.(`Processing mech damage: ${mechId}`) || 
                console.log(`Mech damage: ${mechId}`);
            
            // Get current state
            const currentState = this.gameState.getState();
            const mechs = currentState.assets.mechs;
            
            if (!mechs.has(mechId)) {
                throw new Error(`Mech not found: ${mechId}`);
            }
            
            const mech = mechs.get(mechId);
            
            // Apply damage
            const damageAmount = damage || (10 + Math.random() * 30); // Random damage 10-40%
            mech.armor = Math.max(0, mech.armor - damageAmount);
            mech.totalDamage = (mech.totalDamage || 0) + damageAmount;
            
            // Update condition based on armor level
            if (mech.armor <= 20) {
                mech.condition = 'Poor';
            } else if (mech.armor <= 40) {
                mech.condition = 'Fair';
            } else if (mech.armor <= 70) {
                mech.condition = 'Good';
            }
            
            this.logger.info?.(`Mech damaged: ${mech.name} - Armor: ${mech.armor}%`) || 
                console.log(`${mech.name} damaged: ${mech.armor}% armor`);
            
            this.emitEvent('mech.damaged', {
                mechId,
                mech,
                damage: damageAmount,
                damageType,
                timestamp: Date.now()
            });
            
            // Refresh UI
            this.refreshMechUI();
            
        } catch (error) {
            this.logger.error?.(`Failed to process mech damage: ${data?.mechId}`, error) || 
                console.error('Mech damage failed:', error);
        }
    }
    
    /**
     * Refresh mech UI
     */
    refreshMechUI() {
        try {
            this.emitEvent('ui.mech.refresh', {
                source: this.systemName,
                timestamp: Date.now()
            });
            
            this.logger.debug?.('Mech UI refresh requested') || 
                console.debug('Refreshing mech UI');
                
        } catch (error) {
            this.logger.error?.('Failed to refresh mech UI', error) || 
                console.error('Mech UI refresh failed:', error);
        }
    }
    
    /**
     * Utility methods
     */
    getRandomCondition() {
        const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];
        const weights = [10, 30, 40, 20]; // Most mechs are Fair condition
        return this.getWeightedRandom(conditions, weights);
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
    
    findMechBasePrice(mechName) {
        for (const category of Object.values(this.mechDatabase)) {
            const mech = category.find(m => m.name === mechName);
            if (mech) return mech.cost;
        }
        return 1000000; // Default fallback price
    }
    
    /**
     * Get available mechs for purchase
     */
    getAvailableMechs(category = null) {
        try {
            if (category && this.mechDatabase[category.toLowerCase()]) {
                return this.mechDatabase[category.toLowerCase()];
            }
            
            // Return all mechs if no category specified
            return Object.values(this.mechDatabase).flat();
            
        } catch (error) {
            this.logger.error?.('Failed to get available mechs', error) || 
                console.error('Get available mechs failed:', error);
            return [];
        }
    }
    
    /**
     * Get system status
     */
    getStatus() {
        try {
            const currentState = this.gameState.getState();
            const mechs = Array.from(currentState.assets.mechs.values());
            
            return {
                initialized: this.initialized,
                systemName: this.systemName,
                version: this.version,
                totalMechs: mechs.length,
                assignedMechs: mechs.filter(m => m.pilot).length,
                unassignedMechs: mechs.filter(m => !m.pilot).length,
                conditionBreakdown: {
                    Excellent: mechs.filter(m => m.condition === 'Excellent').length,
                    Good: mechs.filter(m => m.condition === 'Good').length,
                    Fair: mechs.filter(m => m.condition === 'Fair').length,
                    Poor: mechs.filter(m => m.condition === 'Poor').length,
                    Salvage: mechs.filter(m => m.condition === 'Salvage').length
                },
                weightClassBreakdown: {
                    Light: mechs.filter(m => m.weight <= 35).length,
                    Medium: mechs.filter(m => m.weight > 35 && m.weight <= 55).length,
                    Heavy: mechs.filter(m => m.weight > 55 && m.weight <= 75).length,
                    Assault: mechs.filter(m => m.weight > 75).length
                },
                averageArmor: mechs.length > 0 ? 
                    Math.round(mechs.reduce((sum, m) => sum + (m.armor || 0), 0) / mechs.length) : 0,
                totalMaintenanceCost: mechs.reduce((sum, m) => sum + (m.maintenanceCost || 0), 0)
            };
        } catch (error) {
            this.logger.error?.('Failed to get mech system status', error) || 
                console.error('Mech status failed:', error);
            
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
            console.error(`Failed to emit mech event: ${eventName}`, error);
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
            
            this.emitEvent('mechsystem.shutdown', { timestamp: Date.now() });
            
            this.logger.info?.(`${this.systemName} shutdown complete`) || 
                console.log(`${this.systemName} shutdown complete`);
                
        } catch (error) {
            console.error(`${this.systemName} shutdown failed:`, error);
        }
    }
}

// Export for use in other modules
window.BattletechMechSystem = MechSystem;

export default MechSystem;