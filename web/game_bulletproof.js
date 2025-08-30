// BULLETPROOF BATTLETECH GAME
// Design Principle: NEVER break existing functionality when adding new features
// Architecture: Single file, progressive enhancement, extensive validation

console.log('Loading Bulletproof Battletech Game...');

// ============================================================================
// CORE ARCHITECTURE - These functions are NEVER modified, only extended
// ============================================================================

// Global game state - simple object, no complex dependencies
window.gameState = {
    pilots: [],
    mechs: [],
    contracts: [],
    selectedPilot: null,
    selectedMech: null,
    selectedContract: null,
    gameInitialized: false
};

// Core screen management - bulletproof, never changes
function showScreen(screenId) {
    console.log('Switching to screen:', screenId);
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    } else {
        console.error('Screen not found:', screenId);
    }
}

// Navigation functions - bulletproof, never changes
function showMainMenu() { showScreen('main-menu'); }
function showCompanyOverview() { showScreen('company-overview'); }
function showMechBay() { showScreen('mech-bay'); }
function showStarMap() { showScreen('star-map'); }

// ============================================================================
// GAME INITIALIZATION - Core logic that must always work
// ============================================================================

function startNewGame() {
    console.log('=== NEW COMPANY STARTED ===');
    
    try {
        // Reset everything
        gameState.pilots = [];
        gameState.mechs = [];
        gameState.contracts = [];
        gameState.selectedPilot = null;
        gameState.selectedMech = null;
        gameState.selectedContract = null;
        
        // Generate content using bulletproof functions
        generatePilots();
        generateMechs(); 
        generateContracts();
        
        // Update displays using bulletproof functions
        updatePilotDisplay();
        updateMechDisplay();
        updateContractDisplay();
        
        // Mark as initialized
        gameState.gameInitialized = true;
        
        // Navigate to game
        showCompanyOverview();
        
        console.log('✅ New game initialized successfully');
        console.log('Pilots:', gameState.pilots.length);
        console.log('Mechs:', gameState.mechs.length);  
        console.log('Contracts:', gameState.contracts.length);
        
    } catch (error) {
        console.error('❌ Error starting new game:', error);
        alert('Error starting new game. Please refresh the page.');
    }
}

// ============================================================================
// CONTENT GENERATION - Bulletproof data creation
// ============================================================================

function generatePilots() {
    console.log('Generating pilots...');
    
    // Core pilot data - simple structure, no dependencies
    const pilots = [
        { id: 1, name: 'Marcus "Reaper" Kane', gunnery: 2, piloting: 3, experience: 'Elite', salary: 25000, background: 'Former Star League Regular Army officer' },
        { id: 2, name: 'Lisa "Razor" Williams', gunnery: 3, piloting: 4, experience: 'Veteran', salary: 18000, background: 'Former Davion Guards sniper specialist' },
        { id: 3, name: 'James "Thunder" Rodriguez', gunnery: 4, piloting: 3, experience: 'Veteran', salary: 17000, background: 'Ex-Marik Militia commander' },
        { id: 4, name: 'Sarah "Phoenix" Chen', gunnery: 3, piloting: 2, experience: 'Elite', salary: 22000, background: 'Ex-Wolf\'s Dragoons ace pilot' },
        { id: 5, name: 'Jake "Rookie" Miller', gunnery: 6, piloting: 5, experience: 'Green', salary: 8000, background: 'Fresh academy graduate' },
        { id: 6, name: 'Anna "Ghost" Steiner', gunnery: 4, piloting: 3, experience: 'Regular', salary: 14000, background: 'Former Lyran reconnaissance pilot' },
        { id: 7, name: 'David "Iron" Blake', gunnery: 4, piloting: 4, experience: 'Veteran', salary: 16000, background: 'Mercenary with 15 years experience' }
    ];
    
    gameState.pilots = pilots;
    console.log('✅ Generated', pilots.length, 'pilots');
}

function generateMechs() {
    console.log('Generating mechs...');
    
    // Core mech data - simple structure, no dependencies
    const mechs = [
        { id: 1, name: 'Atlas AS7-D', tonnage: 100, weightClass: 'Assault', status: 'Ready', weapons: 'AC/20, LRM-20, SRM-6', armor: 92 },
        { id: 2, name: 'Centurion CN9-A', tonnage: 50, weightClass: 'Medium', status: 'Ready', weapons: 'AC/10, LRM-10, Medium Laser x2', armor: 88 },
        { id: 3, name: 'Locust LCT-1V', tonnage: 20, weightClass: 'Light', status: 'Repair Needed', weapons: 'Machine Gun x2, SRM-2', armor: 75 },
        { id: 4, name: 'Hunchback HBK-4G', tonnage: 50, weightClass: 'Medium', status: 'Ready', weapons: 'AC/20, Medium Laser x2', armor: 90 },
        { id: 5, name: 'Catapult CPLT-C1', tonnage: 65, weightClass: 'Heavy', status: 'Maintenance', weapons: 'LRM-15 x2, Medium Laser x4', armor: 82 }
    ];
    
    gameState.mechs = mechs;
    console.log('✅ Generated', mechs.length, 'mechs');
}

function generateContracts() {
    console.log('Generating contracts...');
    
    // Core contract data - simple structure, no dependencies
    const contracts = [
        { 
            id: 1, 
            name: 'Garrison Duty - Solaris VII', 
            payment: '85,000 C-Bills', 
            difficulty: 'Easy',
            description: 'Standard 30-day garrison contract protecting the main spaceport on Solaris VII.',
            location: 'Solaris VII',
            faction: 'Lyran Commonwealth'
        },
        { 
            id: 2, 
            name: 'Pirate Hunt - Periphery Border', 
            payment: '120,000 C-Bills', 
            difficulty: 'Moderate',
            description: 'Seek and destroy pirate raiders operating along the Periphery border.',
            location: 'Outreach System',
            faction: 'Mercenary'
        },
        { 
            id: 3, 
            name: 'Escort Mission - Marik Space', 
            payment: '95,000 C-Bills', 
            difficulty: 'Easy',
            description: 'Escort commercial convoy through contested Free Worlds League territory.',
            location: 'Atreus System',
            faction: 'Free Worlds League'
        },
        { 
            id: 4, 
            name: 'Planetary Assault - Capellan Front', 
            payment: '200,000 C-Bills', 
            difficulty: 'Hard',
            description: 'Spearhead assault on fortified Capellan position. Heavy resistance expected.',
            location: 'Sarna',
            faction: 'Federated Suns'
        },
        { 
            id: 5, 
            name: 'Reconnaissance Mission', 
            payment: '110,000 C-Bills', 
            difficulty: 'Moderate',
            description: 'Deep reconnaissance of enemy positions behind Kurita lines.',
            location: 'Benjamin System',
            faction: 'Lyran Commonwealth'
        },
        { 
            id: 6, 
            name: 'Base Defense Contract', 
            payment: '130,000 C-Bills', 
            difficulty: 'Moderate',
            description: 'Defend military installation from expected pirate attack.',
            location: 'Galatea',
            faction: 'Mercenary'
        }
    ];
    
    gameState.contracts = contracts;
    console.log('✅ Generated', contracts.length, 'contracts');
}

// ============================================================================
// DISPLAY UPDATES - Bulletproof UI updates
// ============================================================================

function updatePilotDisplay() {
    console.log('Updating pilot display...');
    
    try {
        const pilotList = document.getElementById('pilot-list');
        if (!pilotList) {
            console.warn('pilot-list element not found');
            return;
        }
        
        if (gameState.pilots.length === 0) {
            pilotList.innerHTML = '<p>No pilots available</p>';
            return;
        }
        
        pilotList.innerHTML = gameState.pilots.map(pilot => 
            `<div class="pilot-entry" onclick="selectPilot(${pilot.id})" data-pilot-id="${pilot.id}">
                <div class="pilot-name">${pilot.name}</div>
                <div class="pilot-skills">Gunnery: ${pilot.gunnery}, Piloting: ${pilot.piloting}</div>
                <div class="pilot-traits">${pilot.experience} - ${pilot.salary.toLocaleString()} C-Bills/month</div>
            </div>`
        ).join('');
        
        console.log('✅ Pilot display updated');
        
    } catch (error) {
        console.error('❌ Error updating pilot display:', error);
    }
}

function updateMechDisplay() {
    console.log('Updating mech display...');
    
    try {
        const mechList = document.getElementById('mech-list');
        if (!mechList) {
            console.warn('mech-list element not found');
            return;
        }
        
        if (gameState.mechs.length === 0) {
            mechList.innerHTML = '<p>No mechs available</p>';
            return;
        }
        
        mechList.innerHTML = gameState.mechs.map(mech => 
            `<div class="mech-entry" onclick="selectMech(${mech.id})" data-mech-id="${mech.id}">
                <div class="mech-name">${mech.name}</div>
                <div class="mech-status">${mech.tonnage} tons - ${mech.status}</div>
                <div class="mech-weapons">Weapons: ${mech.weapons}</div>
            </div>`
        ).join('');
        
        console.log('✅ Mech display updated');
        
    } catch (error) {
        console.error('❌ Error updating mech display:', error);
    }
}

function updateContractDisplay() {
    console.log('Updating contract display...');
    
    try {
        const contractList = document.getElementById('contract-list');
        if (!contractList) {
            console.warn('contract-list element not found');
            return;
        }
        
        if (gameState.contracts.length === 0) {
            contractList.innerHTML = '<p>No contracts available</p>';
            return;
        }
        
        contractList.innerHTML = gameState.contracts.map(contract => 
            `<div class="contract-entry" onclick="selectContract(${contract.id})" data-contract-id="${contract.id}">
                <div class="contract-name">${contract.name}</div>
                <div class="contract-summary">Payment: ${contract.payment} - ${contract.difficulty}</div>
                <div class="contract-faction">Employer: ${contract.faction}</div>
            </div>`
        ).join('');
        
        console.log('✅ Contract display updated');
        
    } catch (error) {
        console.error('❌ Error updating contract display:', error);
    }
}

// ============================================================================
// SELECTION SYSTEM - Bulletproof selection with detailed info
// ============================================================================

function selectPilot(pilotId) {
    console.log('Selecting pilot:', pilotId);
    
    try {
        const pilot = gameState.pilots.find(p => p.id === pilotId);
        if (!pilot) {
            console.error('Pilot not found:', pilotId);
            return;
        }
        
        gameState.selectedPilot = pilot;
        
        // Update pilot details panel
        const pilotDetails = document.getElementById('pilot-details');
        if (pilotDetails) {
            pilotDetails.innerHTML = `
                <h3>${pilot.name}</h3>
                <div class="stat-line"><span>Experience:</span><span class="experience-${pilot.experience.toLowerCase()}">${pilot.experience}</span></div>
                <div class="stat-line"><span>Gunnery Skill:</span><span>${pilot.gunnery}</span></div>
                <div class="stat-line"><span>Piloting Skill:</span><span>${pilot.piloting}</span></div>
                <div class="stat-line"><span>Monthly Salary:</span><span class="text-warning">${pilot.salary.toLocaleString()} C-Bills</span></div>
                <hr>
                <p><strong>Background:</strong><br><em>${pilot.background}</em></p>
            `;
        }
        
        // Highlight selected pilot
        document.querySelectorAll('.pilot-entry').forEach(entry => {
            entry.classList.remove('selected');
        });
        document.querySelector(`[data-pilot-id="${pilotId}"]`)?.classList.add('selected');
        
        console.log('✅ Pilot selected:', pilot.name);
        
    } catch (error) {
        console.error('❌ Error selecting pilot:', error);
    }
}

function selectMech(mechId) {
    console.log('Selecting mech:', mechId);
    
    try {
        const mech = gameState.mechs.find(m => m.id === mechId);
        if (!mech) {
            console.error('Mech not found:', mechId);
            return;
        }
        
        gameState.selectedMech = mech;
        
        // Update mech details panel
        const mechDetails = document.getElementById('mech-details');
        if (mechDetails) {
            mechDetails.innerHTML = `
                <h3>${mech.name}</h3>
                <div class="stat-line"><span>Weight Class:</span><span class="weight-${mech.weightClass.toLowerCase()}">${mech.weightClass}</span></div>
                <div class="stat-line"><span>Tonnage:</span><span>${mech.tonnage} tons</span></div>
                <div class="stat-line"><span>Status:</span><span class="status-${mech.status.toLowerCase().replace(' ', '-')}">${mech.status}</span></div>
                <div class="stat-line"><span>Armor:</span><span>${mech.armor}%</span></div>
                <hr>
                <p><strong>Weapons:</strong><br>${mech.weapons}</p>
            `;
        }
        
        // Highlight selected mech
        document.querySelectorAll('.mech-entry').forEach(entry => {
            entry.classList.remove('selected');
        });
        document.querySelector(`[data-mech-id="${mechId}"]`)?.classList.add('selected');
        
        console.log('✅ Mech selected:', mech.name);
        
    } catch (error) {
        console.error('❌ Error selecting mech:', error);
    }
}

function selectContract(contractId) {
    console.log('Selecting contract:', contractId);
    
    try {
        const contract = gameState.contracts.find(c => c.id === contractId);
        if (!contract) {
            console.error('Contract not found:', contractId);
            return;
        }
        
        gameState.selectedContract = contract;
        
        // Update contract details panel
        const contractDetails = document.getElementById('contract-details');
        if (contractDetails) {
            const difficultyClass = contract.difficulty.toLowerCase();
            contractDetails.innerHTML = `
                <h3>${contract.name}</h3>
                <div class="stat-line"><span>Location:</span><span>${contract.location}</span></div>
                <div class="stat-line"><span>Employer:</span><span>${contract.faction}</span></div>
                <div class="stat-line"><span>Payment:</span><span class="text-success">${contract.payment}</span></div>
                <div class="stat-line"><span>Difficulty:</span><span class="difficulty-${difficultyClass}">${contract.difficulty}</span></div>
                <hr>
                <p><strong>Mission Briefing:</strong><br>${contract.description}</p>
                <button class="btn btn-primary" onclick="acceptContract(${contract.id})">Accept Contract</button>
            `;
        }
        
        // Highlight selected contract
        document.querySelectorAll('.contract-entry').forEach(entry => {
            entry.classList.remove('selected');
        });
        document.querySelector(`[data-contract-id="${contractId}"]`)?.classList.add('selected');
        
        console.log('✅ Contract selected:', contract.name);
        
    } catch (error) {
        console.error('❌ Error selecting contract:', error);
    }
}

function acceptContract(contractId) {
    console.log('Accepting contract:', contractId);
    
    try {
        const contract = gameState.contracts.find(c => c.id === contractId);
        if (!contract) {
            console.error('Contract not found:', contractId);
            return;
        }
        
        alert(`Contract "${contract.name}" accepted!\n\nPayment: ${contract.payment}\nDifficulty: ${contract.difficulty}\n\nPrepare for combat!`);
        
        console.log('✅ Contract accepted:', contract.name);
        
    } catch (error) {
        console.error('❌ Error accepting contract:', error);
    }
}

// ============================================================================
// PLACEHOLDER FUNCTIONS - Bulletproof stubs for missing features
// ============================================================================

function loadGame() { 
    alert('Load game functionality coming soon!');
}

function showSettings() { 
    alert('Settings menu coming soon!');
}

function quitGame() { 
    if (confirm('Are you sure you want to quit?')) {
        alert('Thanks for playing Battletech Mercenary Command!');
    }
}

function hirePilot() { 
    alert('Hire pilot functionality coming soon!');
}

function refreshContracts() { 
    console.log('Refreshing contracts...');
    generateContracts();
    updateContractDisplay();
    alert('New contracts are now available!');
}

function advanceTime() { 
    alert('Advance time functionality coming soon!');
}

// ============================================================================
// INITIALIZATION - Make sure everything starts correctly
// ============================================================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== BULLETPROOF BATTLETECH GAME LOADED ===');
    console.log('Ready for new game creation');
});

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    alert('An error occurred. Please refresh the page if the game stops working.');
});

console.log('✅ Bulletproof Battletech Game loaded successfully');