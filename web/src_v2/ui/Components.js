/**
 * Bulletproof UI Components - Reusable UI building blocks
 * This system provides safe, error-resistant UI components
 */

class Components {
    constructor(eventBus, logger) {
        this.eventBus = eventBus || console;
        this.logger = logger || console;
        this.initialized = false;
        
        // Component registry
        this.components = new Map();
        this.renderCount = 0;
        
        try {
            this.initialize();
        } catch (error) {
            this.logger.error?.('Components initialization failed', error) || 
                console.error('Components init failed:', error);
            throw error;
        }
    }
    
    initialize() {
        this.logger.info?.('Components initializing...') || console.log('Components initializing...');
        
        // Set up component templates
        this.setupComponentTemplates();
        
        // Set up event handlers
        this.setupEventHandlers();
        
        // Set up global component functions
        this.setupGlobalFunctions();
        
        this.initialized = true;
        this.logger.info?.('Components initialized successfully') || console.log('Components initialized');
        
        // Emit initialization event
        this.emitEvent('components.initialized', { timestamp: Date.now() });
    }
    
    setupComponentTemplates() {
        try {
            // Register standard component templates
            this.registerTemplate('pilot-card', this.createPilotCardTemplate());
            this.registerTemplate('mech-card', this.createMechCardTemplate());
            this.registerTemplate('contract-card', this.createContractCardTemplate());
            this.registerTemplate('button', this.createButtonTemplate());
            this.registerTemplate('info-card', this.createInfoCardTemplate());
            
            this.logger.debug?.(`Registered ${this.components.size} component templates`) || 
                console.debug(`Component templates: ${this.components.size}`);
                
        } catch (error) {
            this.logger.error?.('Failed to setup component templates', error) || 
                console.error('Component templates failed:', error);
        }
    }
    
    setupEventHandlers() {
        try {
            // Listen for component render requests
            this.eventBus.on?.('component.render', (data) => {
                this.renderComponent(data.type, data.container, data.data, data.options);
            });
            
            // Listen for component updates
            this.eventBus.on?.('component.update', (data) => {
                this.updateComponent(data.id, data.data, data.options);
            });
            
            // Listen for component removal
            this.eventBus.on?.('component.remove', (data) => {
                this.removeComponent(data.id);
            });
            
            this.logger.debug?.('Component event handlers established') || 
                console.debug('Component handlers ready');
                
        } catch (error) {
            this.logger.error?.('Failed to setup component event handlers', error) || 
                console.error('Component handlers failed:', error);
        }
    }
    
    setupGlobalFunctions() {
        try {
            // Global functions for onclick handlers
            window.selectPilot = (pilotId) => {
                this.handlePilotSelection(pilotId);
            };
            
            window.selectMech = (mechId) => {
                this.handleMechSelection(mechId);
            };
            
            window.selectContract = (contractId) => {
                this.handleContractSelection(contractId);
            };
            
            window.hirePilot = () => {
                this.handleHirePilot();
            };
            
            window.assignPilot = (pilotId, mechId) => {
                this.handlePilotAssignment(pilotId, mechId);
            };
            
            this.logger.debug?.('Global component functions established') || 
                console.debug('Global functions ready');
                
        } catch (error) {
            this.logger.error?.('Failed to setup global functions', error) || 
                console.error('Global functions failed:', error);
        }
    }
    
    /**
     * Register a component template
     */
    registerTemplate(name, template) {
        try {
            if (!name || typeof name !== 'string') {
                throw new Error('Template name must be a valid string');
            }
            
            if (!template || typeof template !== 'object') {
                throw new Error('Template must be a valid object');
            }
            
            this.components.set(name, {
                name,
                template,
                renderCount: 0,
                lastRendered: null
            });
            
            this.logger.debug?.(`Template registered: ${name}`) || console.debug(`Template: ${name}`);
            
        } catch (error) {
            this.logger.error?.(`Failed to register template: ${name}`, error) || 
                console.error(`Template registration failed: ${name}`, error);
        }
    }
    
    /**
     * Render a component to a container
     */
    renderComponent(type, container, data = {}, options = {}) {
        try {
            if (!type || !this.components.has(type)) {
                throw new Error(`Unknown component type: ${type}`);
            }
            
            const containerElement = this.resolveContainer(container);
            if (!containerElement) {
                throw new Error(`Container not found: ${container}`);
            }
            
            const componentConfig = this.components.get(type);
            const template = componentConfig.template;
            
            this.logger.debug?.(`Rendering component: ${type}`) || console.debug(`Rendering: ${type}`);
            
            // Create component HTML
            const html = this.processTemplate(template, data, options);
            
            // Insert into container
            if (options.append) {
                containerElement.insertAdjacentHTML('beforeend', html);
            } else {
                containerElement.innerHTML = html;
            }
            
            // Update component stats
            componentConfig.renderCount++;
            componentConfig.lastRendered = Date.now();
            this.renderCount++;
            
            // Emit render event
            this.emitEvent('component.rendered', {
                type,
                container: container,
                data,
                timestamp: Date.now()
            });
            
            return true;
            
        } catch (error) {
            this.logger.error?.(`Failed to render component: ${type}`, error) || 
                console.error(`Component render failed: ${type}`, error);
            return false;
        }
    }
    
    /**
     * Process template with data
     */
    processTemplate(template, data, options) {
        try {
            let html = template.html || '<div>Missing template</div>';
            
            // Replace template variables
            html = html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                const value = this.getNestedValue(data, key);
                return this.escapeHtml(value !== undefined ? value : '');
            });
            
            // Process conditional sections
            html = this.processConditionals(html, data);
            
            // Process loops
            html = this.processLoops(html, data);
            
            return html;
            
        } catch (error) {
            this.logger.error?.('Template processing failed', error) || 
                console.error('Template processing failed:', error);
            return '<div class="error">Template Error</div>';
        }
    }
    
    processConditionals(html, data) {
        try {
            // Process {{#if condition}} ... {{/if}} blocks
            return html.replace(/\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs, (match, condition, content) => {
                const value = this.getNestedValue(data, condition);
                return value ? content : '';
            });
        } catch (error) {
            this.logger.error?.('Conditional processing failed', error) || 
                console.error('Conditional processing failed:', error);
            return html;
        }
    }
    
    processLoops(html, data) {
        try {
            // Process {{#each array}} ... {{/each}} blocks
            return html.replace(/\{\{#each\s+(\w+)\}\}(.*?)\{\{\/each\}\}/gs, (match, arrayName, itemTemplate) => {
                const array = this.getNestedValue(data, arrayName);
                
                if (!Array.isArray(array)) {
                    return '';
                }
                
                return array.map((item, index) => {
                    let itemHtml = itemTemplate;
                    
                    // Replace item properties
                    itemHtml = itemHtml.replace(/\{\{(\w+)\}\}/g, (itemMatch, key) => {
                        const value = this.getNestedValue(item, key);
                        return this.escapeHtml(value !== undefined ? value : '');
                    });
                    
                    // Replace index
                    itemHtml = itemHtml.replace(/\{\{@index\}\}/g, index);
                    
                    return itemHtml;
                }).join('');
            });
        } catch (error) {
            this.logger.error?.('Loop processing failed', error) || 
                console.error('Loop processing failed:', error);
            return html;
        }
    }
    
    /**
     * Component Templates
     */
    createPilotCardTemplate() {
        return {
            html: `
                <div class="pilot-card {{#if selected}}selected{{/if}}" onclick="selectPilot('{{id}}')">
                    <div class="pilot-header">
                        <h4>{{name}}</h4>
                        <span class="experience {{experience}}">{{experience}}</span>
                    </div>
                    <div class="pilot-stats">
                        <div class="stat-line">
                            <span>Gunnery:</span>
                            <span class="stat-value">{{gunnery}}</span>
                        </div>
                        <div class="stat-line">
                            <span>Piloting:</span>
                            <span class="stat-value">{{piloting}}</span>
                        </div>
                        <div class="stat-line">
                            <span>Salary:</span>
                            <span class="salary">{{salary}} C-Bills</span>
                        </div>
                    </div>
                    {{#if skills}}
                    <div class="pilot-skills">
                        <strong>Skills:</strong> {{skills}}
                    </div>
                    {{/if}}
                    <div class="pilot-status">
                        Status: <span class="status {{status}}">{{status}}</span>
                    </div>
                </div>
            `
        };
    }
    
    createMechCardTemplate() {
        return {
            html: `
                <div class="mech-card {{#if selected}}selected{{/if}}" onclick="selectMech('{{id}}')">
                    <div class="mech-header">
                        <h4>{{name}}</h4>
                        <span class="mech-type {{type}}">{{type}} ({{weight}}t)</span>
                    </div>
                    <div class="mech-stats">
                        <div class="stat-line">
                            <span>Condition:</span>
                            <span class="condition {{condition}}">{{condition}}</span>
                        </div>
                        <div class="stat-line">
                            <span>Pilot:</span>
                            <span class="pilot-name">{{pilotName}}</span>
                        </div>
                        <div class="stat-line">
                            <span>Armor:</span>
                            <span class="armor">{{armor}}%</span>
                        </div>
                    </div>
                    {{#if weapons}}
                    <div class="mech-weapons">
                        <strong>Weapons:</strong> {{weapons}}
                    </div>
                    {{/if}}
                </div>
            `
        };
    }
    
    createContractCardTemplate() {
        return {
            html: `
                <div class="contract-card {{difficulty}}" onclick="selectContract('{{id}}')">
                    <div class="contract-header">
                        <h4>{{title}}</h4>
                        <span class="difficulty {{difficulty}}">{{difficulty}}</span>
                    </div>
                    <div class="contract-details">
                        <div class="detail-line">
                            <span>Employer:</span>
                            <span>{{employer}}</span>
                        </div>
                        <div class="detail-line">
                            <span>Planet:</span>
                            <span>{{planet}}</span>
                        </div>
                        <div class="detail-line">
                            <span>Payment:</span>
                            <span class="payment">{{payment}} C-Bills</span>
                        </div>
                        <div class="detail-line">
                            <span>Duration:</span>
                            <span>{{duration}} days</span>
                        </div>
                    </div>
                    <div class="contract-description">
                        {{description}}
                    </div>
                </div>
            `
        };
    }
    
    createButtonTemplate() {
        return {
            html: `
                <button class="btn {{class}}" {{#if onclick}}onclick="{{onclick}}"{{/if}} {{#if disabled}}disabled{{/if}}>
                    {{text}}
                </button>
            `
        };
    }
    
    createInfoCardTemplate() {
        return {
            html: `
                <div class="info-card {{class}}">
                    {{#if title}}
                    <div class="card-header">
                        <h3>{{title}}</h3>
                        {{#if actions}}
                        <div class="card-actions">
                            {{#each actions}}
                            <button class="btn btn-sm {{class}}" onclick="{{onclick}}">{{text}}</button>
                            {{/each}}
                        </div>
                        {{/if}}
                    </div>
                    {{/if}}
                    <div class="card-content">
                        {{content}}
                    </div>
                </div>
            `
        };
    }
    
    /**
     * Event Handlers
     */
    handlePilotSelection(pilotId) {
        try {
            this.logger.info?.(`Pilot selected: ${pilotId}`) || console.log(`Pilot selected: ${pilotId}`);
            
            // Emit pilot selection event
            this.emitEvent('pilot.selected', {
                pilotId,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.(`Failed to handle pilot selection: ${pilotId}`, error) || 
                console.error(`Pilot selection failed: ${pilotId}`, error);
        }
    }
    
    handleMechSelection(mechId) {
        try {
            this.logger.info?.(`Mech selected: ${mechId}`) || console.log(`Mech selected: ${mechId}`);
            
            // Emit mech selection event
            this.emitEvent('mech.selected', {
                mechId,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.(`Failed to handle mech selection: ${mechId}`, error) || 
                console.error(`Mech selection failed: ${mechId}`, error);
        }
    }
    
    handleContractSelection(contractId) {
        try {
            this.logger.info?.(`Contract selected: ${contractId}`) || console.log(`Contract selected: ${contractId}`);
            
            // Emit contract selection event
            this.emitEvent('contract.selected', {
                contractId,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.(`Failed to handle contract selection: ${contractId}`, error) || 
                console.error(`Contract selection failed: ${contractId}`, error);
        }
    }
    
    handleHirePilot() {
        try {
            this.logger.info?.('Hire pilot requested') || console.log('Hire pilot requested');
            
            // Emit hire pilot event
            this.emitEvent('pilot.hire', {
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.('Failed to handle hire pilot', error) || 
                console.error('Hire pilot failed:', error);
        }
    }
    
    handlePilotAssignment(pilotId, mechId) {
        try {
            this.logger.info?.(`Pilot assignment: ${pilotId} -> ${mechId}`) || 
                console.log(`Pilot assignment: ${pilotId} -> ${mechId}`);
            
            // Emit pilot assignment event
            this.emitEvent('pilot.assigned', {
                pilotId,
                mechId,
                timestamp: Date.now()
            });
            
        } catch (error) {
            this.logger.error?.(`Failed to handle pilot assignment: ${pilotId} -> ${mechId}`, error) || 
                console.error(`Pilot assignment failed: ${pilotId} -> ${mechId}`, error);
        }
    }
    
    /**
     * Helper methods
     */
    resolveContainer(container) {
        try {
            if (typeof container === 'string') {
                return document.getElementById(container) || document.querySelector(container);
            } else if (container && container.tagName) {
                return container;
            }
            return null;
        } catch (error) {
            this.logger.error?.('Container resolution failed', error) || 
                console.error('Container resolution failed:', error);
            return null;
        }
    }
    
    getNestedValue(obj, path) {
        try {
            const keys = path.split('.');
            let current = obj;
            
            for (const key of keys) {
                if (current === null || current === undefined) {
                    return undefined;
                }
                current = current[key];
            }
            
            return current;
        } catch (error) {
            return undefined;
        }
    }
    
    escapeHtml(text) {
        try {
            if (typeof text !== 'string') {
                text = String(text);
            }
            
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            
            return text.replace(/[&<>"']/g, (m) => map[m]);
        } catch (error) {
            return String(text);
        }
    }
    
    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            totalComponents: this.components.size,
            totalRenders: this.renderCount,
            componentList: Array.from(this.components.keys()),
            renderCounts: Array.from(this.components.values()).map(c => ({
                name: c.name,
                renders: c.renderCount,
                lastRendered: c.lastRendered
            }))
        };
    }
    
    emitEvent(eventName, data) {
        try {
            if (this.eventBus && this.eventBus.emit) {
                this.eventBus.emit(eventName, data);
            }
        } catch (error) {
            console.error(`Failed to emit component event: ${eventName}`, error);
        }
    }
    
    /**
     * Cleanup method
     */
    shutdown() {
        try {
            this.logger.info?.('Components shutdown initiated') || console.log('Components shutdown');
            
            // Clear global functions
            delete window.selectPilot;
            delete window.selectMech;
            delete window.selectContract;
            delete window.hirePilot;
            delete window.assignPilot;
            
            this.initialized = false;
            this.logger.info?.('Components shutdown complete') || console.log('Components shutdown complete');
            
        } catch (error) {
            console.error('Components shutdown failed:', error);
        }
    }
}

// Export for use in other modules
window.BattletechComponents = Components;

export default Components;