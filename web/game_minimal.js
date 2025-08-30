// Minimal Working Battletech Game
console.log('Loading minimal Battletech game...');

let gameState = {
    pilots: [],
    mechs: [],
    contracts: []
};

// Screen functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showMainMenu() { showScreen('main-menu'); }
function showCompanyOverview() { showScreen('company-overview'); }
function showMechBay() { showScreen('mech-bay'); }
function showStarMap() { showScreen('star-map'); }

// WORKING New Game function
function startNewGame() {
    console.log('New Company button clicked - WORKING!');
    
    // Simple data
    gameState.pilots = [
        { name: 'Marcus "Reaper" Kane', gunnery: 2, piloting: 3, experience: 'Elite', salary: 25000 },
        { name: 'Lisa "Razor" Williams', gunnery: 3, piloting: 4, experience: 'Veteran', salary: 18000 }
    ];
    
    gameState.mechs = [
        { name: 'Atlas AS7-D', tonnage: 100, status: 'Ready', weapons: 'AC/20, LRM-20' }
    ];
    
    gameState.contracts = [
        { name: 'Garrison Duty', payment: '85,000 C-Bills', difficulty: 'Easy' },
        { name: 'Pirate Hunt', payment: '120,000 C-Bills', difficulty: 'Moderate' }
    ];
    
    // Update displays
    updateAll();
    showCompanyOverview();
}

function updateAll() {
    // Update pilots
    const pilotList = document.getElementById('pilot-list');
    if (pilotList) {
        pilotList.innerHTML = gameState.pilots.map((pilot, index) => 
            `<div class="pilot-entry" onclick="selectPilot(${index})">
                <div class="pilot-name">${pilot.name}</div>
                <div class="pilot-skills">Gunnery: ${pilot.gunnery}, Piloting: ${pilot.piloting}</div>
                <div class="pilot-traits">${pilot.experience} - ${pilot.salary.toLocaleString()} C-Bills/month</div>
            </div>`
        ).join('');
    }
    
    // Update mechs  
    const mechList = document.getElementById('mech-list');
    if (mechList) {
        mechList.innerHTML = gameState.mechs.map((mech, index) => 
            `<div class="mech-entry" onclick="selectMech(${index})">
                <div class="mech-name">${mech.name}</div>
                <div class="mech-status">${mech.tonnage} tons - ${mech.status}</div>
            </div>`
        ).join('');
    }
    
    // Update contracts
    const contractList = document.getElementById('contract-list');
    if (contractList) {
        contractList.innerHTML = gameState.contracts.map(contract => 
            `<div class="contract-entry">
                <div class="contract-name">${contract.name}</div>
                <div class="contract-summary">Payment: ${contract.payment} - ${contract.difficulty}</div>
            </div>`
        ).join('');
    }
}

// Selection functions
function selectPilot(index) {
    const pilot = gameState.pilots[index];
    const details = document.getElementById('pilot-details');
    if (details) {
        details.innerHTML = `
            <h3>${pilot.name}</h3>
            <div class="stat-line"><span>Experience:</span><span>${pilot.experience}</span></div>
            <div class="stat-line"><span>Gunnery:</span><span>${pilot.gunnery}</span></div>
            <div class="stat-line"><span>Piloting:</span><span>${pilot.piloting}</span></div>
            <div class="stat-line"><span>Salary:</span><span>${pilot.salary.toLocaleString()} C-Bills/month</span></div>
        `;
    }
}

function selectMech(index) {
    const mech = gameState.mechs[index];
    const details = document.getElementById('mech-details');
    if (details) {
        details.innerHTML = `
            <h3>${mech.name}</h3>
            <div class="stat-line"><span>Tonnage:</span><span>${mech.tonnage} tons</span></div>
            <div class="stat-line"><span>Status:</span><span>${mech.status}</span></div>
            <div class="stat-line"><span>Weapons:</span><span>${mech.weapons}</span></div>
        `;
    }
}

// Other functions
function loadGame() { alert('Load game not implemented'); }
function showSettings() { alert('Settings not implemented'); }
function quitGame() { alert('Thanks for playing!'); }
function hirePilot() { alert('Hire pilot not implemented'); }
function refreshContracts() { alert('Refresh contracts not implemented'); }
function advanceTime() { alert('Advance time not implemented'); }