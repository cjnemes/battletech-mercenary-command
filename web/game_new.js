// Simple Working Game
let gameState = {
    pilots: [],
    mechs: [],
    contracts: [],
    selectedPilot: null,
    selectedMech: null,
    selectedContract: null,
    combat: {
        active: false,
        battlefield: null,
        units: [],
        currentTurn: 0,
        turnOrder: [],
        currentUnitIndex: 0,
        selectedUnit: null,
        phase: 'movement', // 'movement', 'firing', 'heat'
        canvas: null,
        ctx: null,
        hexSize: 20,
        hexWidth: 0,
        hexHeight: 0,
        gridWidth: 20,
        gridHeight: 15,
        terrain: []
    }
};

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Navigation
function showMainMenu() { showScreen('main-menu'); }
function showCompanyOverview() { showScreen('company-overview'); }
function showMechBay() { showScreen('mech-bay'); }
function showStarMap() { showScreen('star-map'); }

// Main Functions
function startNewGame() {
    console.log('Starting new Battletech Mercenary Command game!');
    
    // Add starting pilot roster (diverse experience levels)
    gameState.pilots = [
        { id: 'pilot1', name: 'Marcus Kane', callsign: 'Reaper', age: 42, gunnery: 2, piloting: 3, tactics: 3, leadership: 4, salary: 25000, morale: 95, loyalty: 85, experience: 'Elite', traits: ['Natural Leader', 'Marksman'], background: 'Former Star League Regular Army officer' },
        { id: 'pilot2', name: 'Lisa Williams', callsign: 'Razor', age: 35, gunnery: 3, piloting: 4, tactics: 4, leadership: 3, salary: 18000, morale: 80, loyalty: 75, experience: 'Veteran', traits: ['Marksman', 'Cautious'], background: 'Former Davion Guards sniper specialist' },
        { id: 'pilot3', name: 'Robert Stone', callsign: 'Bulldog', age: 30, gunnery: 4, piloting: 4, tactics: 3, leadership: 3, salary: 14000, morale: 70, loyalty: 75, experience: 'Regular', traits: ['Dependable'], background: 'Solid mercenary pilot, dependable' },
        { id: 'pilot4', name: 'Jake Miller', callsign: 'Rookie', age: 23, gunnery: 6, piloting: 5, tactics: 2, leadership: 2, salary: 8000, morale: 60, loyalty: 60, experience: 'Green', traits: ['Eager'], background: 'Fresh academy graduate' }
    ];
    
    gameState.mechs = [{
        id: 'mech1',
        name: 'Atlas AS7-D',
        tonnage: 100,
        status: 'Ready',
        armor: 85,
        maxArmor: 85,
        weapons: ['AC/20', 'LRM-20', 'SRM-6'],
        weaponData: [
            { name: 'AC/20', damage: 20, heat: 7, range: { short: 3, medium: 6, long: 9 }, ammo: 10 },
            { name: 'LRM-20', damage: 20, heat: 6, range: { short: 6, medium: 14, long: 21 }, ammo: 12 },
            { name: 'SRM-6', damage: 12, heat: 4, range: { short: 3, medium: 6, long: 9 }, ammo: 15 }
        ],
        heat: 0,
        maxHeat: 30,
        movement: 3,
        jumpMovement: 0,
        pilot: 'pilot1'
    }];
    
    gameState.contracts = [
        {
            id: 'contract1',
            name: 'Garrison Duty - Solaris VII',
            payment: '85,000 C-Bills',
            difficulty: 'Easy',
            description: 'Standard 30-day garrison contract protecting the main spaceport on Solaris VII. Light resistance expected from local criminal elements.',
            location: 'Solaris VII',
            faction: 'Lyran Commonwealth',
            duration: '30 days',
            riskLevel: 'Low'
        },
        {
            id: 'contract2', 
            name: 'Pirate Hunting - Periphery Border',
            payment: '120,000 C-Bills',
            difficulty: 'Moderate',
            description: 'Seek and destroy pirate raiders operating along the Periphery border. Multiple enemy lances expected. Salvage rights included.',
            location: 'Outreach System',
            faction: 'Mercenary',
            duration: '45 days',
            riskLevel: 'Medium'
        },
        {
            id: 'contract3',
            name: 'Planetary Assault - Capellan Front',
            payment: '200,000 C-Bills', 
            difficulty: 'Hard',
            description: 'Spearhead assault on fortified Capellan position. Heavy resistance expected including combined-arms forces. High casualty risk.',
            location: 'Sarna',
            faction: 'Federated Suns',
            duration: '21 days',
            riskLevel: 'High'
        }
    ];
    
    updateDisplays();
    showCompanyOverview();
}

function updateDisplays() {
    // Update pilot display
    const pilotList = document.getElementById('pilot-list');
    if (pilotList) {
        pilotList.innerHTML = gameState.pilots.map(pilot => 
            `<div class="pilot-entry" onclick="selectPilot('${pilot.id}')">
                <div class="pilot-name">${pilot.name} "${pilot.callsign}"</div>
                <div class="pilot-skills">Gunnery: ${pilot.gunnery}, Piloting: ${pilot.piloting}</div>
                <div class="pilot-traits">${pilot.experience} - ${pilot.salary.toLocaleString()} C-Bills/month</div>
            </div>`
        ).join('');
    }
    
    // Update mech display
    const mechList = document.getElementById('mech-list');
    if (mechList) {
        mechList.innerHTML = gameState.mechs.map(mech => 
            `<div class="mech-entry" onclick="selectMech('${mech.id}')">
                <div class="mech-name">${mech.name}</div>
                <div class="mech-status">${mech.tonnage} tons - ${mech.status}</div>
            </div>`
        ).join('');
    }
    
    // Update contract display
    const contractList = document.getElementById('contract-list');
    if (contractList) {
        contractList.innerHTML = gameState.contracts.map(contract => 
            `<div class="contract-entry" onclick="selectContract('${contract.id}')">
                <div class="contract-name">${contract.name}</div>
                <div class="contract-summary">Payment: ${contract.payment} - ${contract.difficulty}</div>
            </div>`
        ).join('');
    }
    
    // Update mech details panel
    updateMechDetails();
    
    // Update pilot details panel
    updatePilotDetails();
    
    // Update contract details panel
    updateContractDetails();
}

// Selection functions
function selectPilot(pilotId) {
    console.log('selectPilot called with id:', pilotId);
    gameState.selectedPilot = gameState.pilots.find(p => p.id === pilotId);
    console.log('Selected pilot:', gameState.selectedPilot?.name);
    updatePilotDetails();
}

function selectMech(mechId) {
    gameState.selectedMech = gameState.mechs.find(m => m.id === mechId);
    console.log('Selected mech:', gameState.selectedMech.name);
    updateMechDetails();
}

function selectContract(contractId) {
    gameState.selectedContract = gameState.contracts.find(c => c.id === contractId);
    console.log('Selected contract:', gameState.selectedContract.name);
    updateContractDetails();
}

function updateMechDetails() {
    const mechDetails = document.getElementById('mech-details');
    if (mechDetails) {
        if (gameState.selectedMech) {
            const mech = gameState.selectedMech;
            mechDetails.innerHTML = `
                <h3>${mech.name}</h3>
                <div class="stat-line"><span>Tonnage:</span><span>${mech.tonnage} tons</span></div>
                <div class="stat-line"><span>Status:</span><span>${mech.status}</span></div>
                <div class="stat-line"><span>Armor:</span><span>${mech.armor}%</span></div>
                <div class="stat-line"><span>Weapons:</span><span>${Array.isArray(mech.weapons) ? mech.weapons.join(', ') : mech.weapons}</span></div>
            `;
        } else {
            mechDetails.innerHTML = `
                <h3>Select a Mech</h3>
                <p>Choose a mech from the roster to view details and manage pilot assignments.</p>
            `;
        }
    }
}

function updatePilotDetails() {
    const pilotDetails = document.getElementById('pilot-details');
    if (pilotDetails) {
        if (gameState.selectedPilot) {
            const pilot = gameState.selectedPilot;
            const expClass = pilot.experience.toLowerCase();
            pilotDetails.innerHTML = `
                <h3>${pilot.name} "${pilot.callsign}"</h3>
                <div class="stat-line"><span>Age:</span><span>${pilot.age}</span></div>
                <div class="stat-line"><span>Experience:</span><span class="experience-${expClass}">${pilot.experience}</span></div>
                <div class="stat-line"><span>Gunnery:</span><span class="skill-${pilot.gunnery <= 3 ? 'good' : pilot.gunnery <= 5 ? 'average' : 'poor'}">${pilot.gunnery}</span></div>
                <div class="stat-line"><span>Piloting:</span><span class="skill-${pilot.piloting <= 3 ? 'good' : pilot.piloting <= 5 ? 'average' : 'poor'}">${pilot.piloting}</span></div>
                <div class="stat-line"><span>Tactics:</span><span>${pilot.tactics}</span></div>
                <div class="stat-line"><span>Leadership:</span><span>${pilot.leadership}</span></div>
                <div class="stat-line"><span>Salary:</span><span class="text-warning">${pilot.salary.toLocaleString()} C-Bills/month</span></div>
                <div class="stat-line"><span>Morale:</span><span class="text-${pilot.morale >= 80 ? 'success' : pilot.morale >= 60 ? 'warning' : 'danger'}">${pilot.morale}%</span></div>
                <div class="stat-line"><span>Loyalty:</span><span class="text-${pilot.loyalty >= 80 ? 'success' : pilot.loyalty >= 60 ? 'warning' : 'danger'}">${pilot.loyalty}%</span></div>
                <div class="stat-line"><span>Traits:</span><span class="text-success">${pilot.traits.join(', ')}</span></div>
                <hr>
                <p><strong>Background:</strong><br><em>${pilot.background}</em></p>
                <button class="btn btn-secondary btn-sm" onclick="assignMech()">Assign Mech</button>
            `;
        } else {
            pilotDetails.innerHTML = `
                <h3>Select a Pilot</h3>
                <p>Choose a pilot from the roster to view detailed information.</p>
            `;
        }
    }
}

function updateContractDetails() {
    const contractDetails = document.getElementById('contract-details');
    if (contractDetails) {
        if (gameState.selectedContract) {
            const contract = gameState.selectedContract;
            const difficultyClass = contract.difficulty.toLowerCase().replace(' ', '-');
            const riskClass = contract.riskLevel.toLowerCase();
            contractDetails.innerHTML = `
                <h3>${contract.name}</h3>
                <div class="stat-line"><span>Location:</span><span>${contract.location}</span></div>
                <div class="stat-line"><span>Employer:</span><span>${contract.faction}</span></div>
                <div class="stat-line"><span>Payment:</span><span class="text-success">${contract.payment}</span></div>
                <div class="stat-line"><span>Duration:</span><span>${contract.duration}</span></div>
                <div class="stat-line"><span>Difficulty:</span><span class="difficulty-${difficultyClass}">${contract.difficulty}</span></div>
                <div class="stat-line"><span>Risk Level:</span><span class="text-${riskClass === 'low' ? 'success' : riskClass === 'medium' ? 'warning' : 'danger'}">${contract.riskLevel}</span></div>
                <hr>
                <p><strong>Mission Briefing:</strong><br>${contract.description}</p>
                <button class="btn btn-primary" onclick="acceptContract()">Accept Contract</button>
            `;
        } else {
            contractDetails.innerHTML = `
                <h3>Select a Contract</h3>
                <p>Choose a contract from the list to view mission details and requirements.</p>
            `;
        }
    }
}

// Other functions
function loadGame() { alert('Load game not implemented yet'); }
function showSettings() { alert('Settings not implemented yet'); }
function quitGame() { alert('Thanks for playing!'); }
function hirePilot() { alert('Hire pilot not implemented yet'); }
function refreshContracts() { alert('Refresh contracts not implemented yet'); }
function advanceTime() { alert('Advance time not implemented yet'); }
function acceptContract() { 
    if (gameState.selectedContract) {
        console.log(`Accepted contract: ${gameState.selectedContract.name} - Starting combat...`); 
        initializeCombat();
        showTacticalCombat();
    }
}
function assignMech() {
    if (gameState.selectedPilot) {
        alert(`Assign mech functionality coming soon for ${gameState.selectedPilot.name}!`);
    }
}

// ============== TACTICAL COMBAT SYSTEM ==============

// Hex battlefield utilities
function hexToPixel(q, r) {
    const size = gameState.combat.hexSize;
    const x = size * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r);
    const y = size * (3/2 * r);
    return { x: x + 400, y: y + 300 }; // Center in canvas
}

function pixelToHex(x, y) {
    const size = gameState.combat.hexSize;
    x -= 400; y -= 300; // Uncenter
    const q = (Math.sqrt(3)/3 * x - 1/3 * y) / size;
    const r = (2/3 * y) / size;
    return axialRound(q, r);
}

function axialRound(q, r) {
    const s = -q - r;
    let rq = Math.round(q);
    let rr = Math.round(r);
    let rs = Math.round(s);
    
    const q_diff = Math.abs(rq - q);
    const r_diff = Math.abs(rr - r);
    const s_diff = Math.abs(rs - s);
    
    if (q_diff > r_diff && q_diff > s_diff) {
        rq = -rr - rs;
    } else if (r_diff > s_diff) {
        rr = -rq - rs;
    } else {
        rs = -rq - rr;
    }
    
    return { q: rq, r: rr };
}

function hexDistance(hex1, hex2) {
    return (Math.abs(hex1.q - hex2.q) + Math.abs(hex1.q + hex1.r - hex2.q - hex2.r) + Math.abs(hex1.r - hex2.r)) / 2;
}

function getHexNeighbors(hex) {
    const directions = [
        {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
        {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
    ];
    return directions.map(dir => ({q: hex.q + dir.q, r: hex.r + dir.r}));
}

// Terrain generation
function generateTerrain() {
    const terrain = [];
    for (let q = -10; q <= 10; q++) {
        for (let r = Math.max(-10, -q-10); r <= Math.min(10, -q+10); r++) {
            let terrainType = 'clear';
            const rand = Math.random();
            
            if (rand < 0.1) terrainType = 'woods';
            else if (rand < 0.15) terrainType = 'rough';
            else if (rand < 0.18) terrainType = 'water';
            
            terrain.push({
                q: q,
                r: r,
                type: terrainType,
                elevation: Math.floor(Math.random() * 3)
            });
        }
    }
    return terrain;
}

// Drawing functions
function drawHex(ctx, center, size, fillColor, strokeColor) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = Math.PI / 3 * i;
        const x = center.x + size * Math.cos(angle);
        const y = center.y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    
    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }
    
    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
    }
}

function drawBattlefield() {
    const canvas = gameState.combat.canvas;
    const ctx = gameState.combat.ctx;
    
    // Clear canvas
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw hex grid
    for (const terrain of gameState.combat.terrain) {
        const pixel = hexToPixel(terrain.q, terrain.r);
        let fillColor = '#003366';
        
        switch (terrain.type) {
            case 'woods': fillColor = '#2d5016'; break;
            case 'rough': fillColor = '#4a4a2a'; break;
            case 'water': fillColor = '#1a4c96'; break;
        }
        
        drawHex(ctx, pixel, gameState.combat.hexSize, fillColor, '#666666');
        
        // Draw elevation indicators
        if (terrain.elevation > 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(terrain.elevation.toString(), pixel.x, pixel.y + 3);
        }
    }
    
    // Draw units
    for (const unit of gameState.combat.units) {
        drawUnit(ctx, unit);
    }
    
    // Highlight selected unit
    if (gameState.combat.selectedUnit) {
        const unit = gameState.combat.selectedUnit;
        const pixel = hexToPixel(unit.position.q, unit.position.r);
        drawHex(ctx, pixel, gameState.combat.hexSize + 3, null, '#ffff00');
        
        // Show movement range
        if (gameState.combat.phase === 'movement') {
            drawMovementRange(ctx, unit);
        }
    }
}

function drawUnit(ctx, unit) {
    const pixel = hexToPixel(unit.position.q, unit.position.r);
    
    // Unit circle
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, 12, 0, 2 * Math.PI);
    ctx.fillStyle = unit.isPlayer ? '#4a9eff' : '#dc3545';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    
    // Unit name
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(unit.name.substring(0, 3), pixel.x, pixel.y + 20);
    
    // Health bar
    const healthPercent = unit.armor / unit.maxArmor;
    const barWidth = 16;
    const barHeight = 3;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(pixel.x - barWidth/2, pixel.y - 18, barWidth, barHeight);
    ctx.fillStyle = healthPercent > 0.5 ? '#28a745' : healthPercent > 0.25 ? '#ffc107' : '#dc3545';
    ctx.fillRect(pixel.x - barWidth/2, pixel.y - 18, barWidth * healthPercent, barHeight);
    
    // Heat indicator
    if (unit.heat > 0) {
        const heatPercent = unit.heat / unit.maxHeat;
        ctx.fillStyle = '#ff4500';
        ctx.fillRect(pixel.x - barWidth/2, pixel.y + 16, barWidth * heatPercent, barHeight);
    }
}

function drawMovementRange(ctx, unit) {
    const moveRange = unit.movement + (unit.heat > 20 ? -1 : 0);
    
    for (const terrain of gameState.combat.terrain) {
        const distance = hexDistance(unit.position, terrain);
        if (distance <= moveRange && distance > 0) {
            const pixel = hexToPixel(terrain.q, terrain.r);
            drawHex(ctx, pixel, gameState.combat.hexSize, 'rgba(74, 158, 255, 0.3)', null);
        }
    }
}

// Combat initialization
function initializeCombat() {
    gameState.combat.active = true;
    gameState.combat.canvas = document.getElementById('battlefield');
    gameState.combat.ctx = gameState.combat.canvas.getContext('2d');
    
    // Generate terrain
    gameState.combat.terrain = generateTerrain();
    
    // Setup units
    setupCombatUnits();
    
    // Initialize turn order
    initializeTurnOrder();
    
    // Setup event listeners
    gameState.combat.canvas.addEventListener('click', handleCanvasClick);
    
    // Start combat
    showScreen('tactical-combat');
    drawBattlefield();
    updateCombatUI();
    
    addCombatLog('Combat initialized. Turn 1 begins.');
}

function setupCombatUnits() {
    gameState.combat.units = [];
    
    // Add player mechs
    gameState.mechs.forEach((mech, index) => {
        const pilot = gameState.pilots.find(p => p.id === mech.pilot);
        gameState.combat.units.push({
            id: mech.id,
            name: mech.name,
            tonnage: mech.tonnage,
            armor: mech.armor,
            maxArmor: mech.maxArmor,
            heat: 0,
            maxHeat: mech.maxHeat,
            movement: mech.movement,
            jumpMovement: mech.jumpMovement,
            weapons: mech.weaponData,
            pilot: pilot,
            position: { q: -8 + index * 2, r: 8 },
            isPlayer: true,
            hasActed: false,
            hasMoved: false,
            hasFired: false
        });
    });
    
    // Add enemy mechs
    const enemyMechs = [
        { name: 'Centurion CN9-A', tonnage: 50, armor: 45, maxArmor: 45, movement: 4 },
        { name: 'Rifleman RFL-3N', tonnage: 60, armor: 52, maxArmor: 52, movement: 3 }
    ];
    
    enemyMechs.forEach((enemyData, index) => {
        gameState.combat.units.push({
            id: 'enemy' + (index + 1),
            name: enemyData.name,
            tonnage: enemyData.tonnage,
            armor: enemyData.armor,
            maxArmor: enemyData.maxArmor,
            heat: 0,
            maxHeat: 25,
            movement: enemyData.movement,
            jumpMovement: 0,
            weapons: [
                { name: 'PPC', damage: 10, heat: 10, range: { short: 3, medium: 9, long: 18 }, ammo: -1 },
                { name: 'Medium Laser', damage: 5, heat: 3, range: { short: 1, medium: 3, long: 6 }, ammo: -1 }
            ],
            pilot: { gunnery: 4, piloting: 5 },
            position: { q: 6 + index * 3, r: -6 },
            isPlayer: false,
            hasActed: false,
            hasMoved: false,
            hasFired: false
        });
    });
}

function initializeTurnOrder() {
    // Sort by initiative (pilot skill + 2d6, lower tonnage breaks ties)
    gameState.combat.turnOrder = [...gameState.combat.units].sort((a, b) => {
        const aInit = (a.pilot.piloting || 4) + Math.floor(Math.random() * 12) + 2;
        const bInit = (b.pilot.piloting || 4) + Math.floor(Math.random() * 12) + 2;
        
        if (aInit !== bInit) return aInit - bInit;
        return a.tonnage - b.tonnage;
    });
    
    gameState.combat.currentUnitIndex = 0;
    gameState.combat.selectedUnit = gameState.combat.turnOrder[0];
}

// Event handling
function handleCanvasClick(event) {
    const rect = gameState.combat.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hexCoord = pixelToHex(x, y);
    
    // Check if clicking on a unit
    const clickedUnit = gameState.combat.units.find(unit => 
        unit.position.q === hexCoord.q && unit.position.r === hexCoord.r
    );
    
    if (clickedUnit) {
        selectUnit(clickedUnit);
    } else if (gameState.combat.selectedUnit && gameState.combat.phase === 'movement') {
        attemptMove(hexCoord);
    } else if (gameState.combat.selectedUnit && gameState.combat.phase === 'firing') {
        attemptFire(hexCoord);
    }
    
    drawBattlefield();
    updateCombatUI();
}

function selectUnit(unit) {
    if (gameState.combat.turnOrder[gameState.combat.currentUnitIndex] === unit) {
        gameState.combat.selectedUnit = unit;
    }
}

function attemptMove(targetHex) {
    const unit = gameState.combat.selectedUnit;
    if (!unit || unit.hasMoved || !unit.isPlayer) return;
    
    const distance = hexDistance(unit.position, targetHex);
    const moveRange = unit.movement + (unit.heat > 20 ? -1 : 0);
    
    if (distance <= moveRange && distance > 0) {
        // Check if hex is occupied
        const occupied = gameState.combat.units.some(u => 
            u !== unit && u.position.q === targetHex.q && u.position.r === targetHex.r
        );
        
        if (!occupied) {
            unit.position = { ...targetHex };
            unit.hasMoved = true;
            
            // Generate heat from movement
            if (distance > unit.movement / 2) {
                unit.heat += Math.floor(distance / 2);
            }
            
            addCombatLog(`${unit.name} moves to hex (${targetHex.q}, ${targetHex.r})`);
            
            // Switch to firing phase
            gameState.combat.phase = 'firing';
        }
    }
}

function attemptFire(targetHex) {
    const unit = gameState.combat.selectedUnit;
    if (!unit || unit.hasFired || !unit.isPlayer) return;
    
    const target = gameState.combat.units.find(u => 
        u.position.q === targetHex.q && u.position.r === targetHex.r && !u.isPlayer
    );
    
    if (target) {
        fireAtTarget(unit, target);
    }
}

function fireAtTarget(attacker, target) {
    const distance = hexDistance(attacker.position, target.position);
    let totalDamage = 0;
    let totalHeat = 0;
    
    // Fire all weapons
    for (const weapon of attacker.weapons) {
        if (weapon.ammo === 0) continue;
        
        // Check range
        let rangeMultiplier = 1;
        if (distance <= weapon.range.short) rangeMultiplier = 1;
        else if (distance <= weapon.range.medium) rangeMultiplier = 0.8;
        else if (distance <= weapon.range.long) rangeMultiplier = 0.6;
        else continue; // Out of range
        
        // Calculate hit probability
        const gunnerySkill = attacker.pilot.gunnery || 4;
        const baseToHit = gunnerySkill + 4; // Base difficulty
        const heatModifier = Math.floor(attacker.heat / 5);
        const movementModifier = attacker.hasMoved ? 2 : 0;
        
        const targetNumber = baseToHit + heatModifier + movementModifier;
        const roll = Math.floor(Math.random() * 12) + 2;
        
        if (roll >= targetNumber) {
            const damage = Math.floor(weapon.damage * rangeMultiplier);
            totalDamage += damage;
            addCombatLog(`${weapon.name} hits for ${damage} damage!`, 'success');
        } else {
            addCombatLog(`${weapon.name} misses (rolled ${roll}, needed ${targetNumber})`);
        }
        
        totalHeat += weapon.heat;
        
        // Use ammo
        if (weapon.ammo > 0) weapon.ammo--;
    }
    
    // Apply damage
    if (totalDamage > 0) {
        target.armor = Math.max(0, target.armor - totalDamage);
        addCombatLog(`${target.name} takes ${totalDamage} total damage!`, 'damage');
        
        if (target.armor === 0) {
            addCombatLog(`${target.name} is destroyed!`, 'important');
            target.isDestroyed = true;
        }
    }
    
    // Apply heat
    attacker.heat += totalHeat;
    if (attacker.heat > attacker.maxHeat) {
        addCombatLog(`${attacker.name} shuts down from heat!`, 'damage');
        attacker.shutDown = true;
    }
    
    attacker.hasFired = true;
}

// AI System
function executeAITurn(unit) {
    if (unit.shutDown) {
        unit.heat = Math.max(0, unit.heat - 5);
        if (unit.heat < unit.maxHeat * 0.8) {
            unit.shutDown = false;
            addCombatLog(`${unit.name} comes back online.`);
        }
        return;
    }
    
    // AI movement
    if (!unit.hasMoved) {
        const bestPosition = findBestPosition(unit);
        if (bestPosition && (bestPosition.q !== unit.position.q || bestPosition.r !== unit.position.r)) {
            unit.position = bestPosition;
            unit.hasMoved = true;
            addCombatLog(`${unit.name} moves to hex (${bestPosition.q}, ${bestPosition.r})`);
        }
    }
    
    // AI firing
    if (!unit.hasFired) {
        const target = findBestTarget(unit);
        if (target) {
            fireAtTarget(unit, target);
            unit.hasFired = true;
        }
    }
    
    // Heat management
    unit.heat = Math.max(0, unit.heat - 2);
}

function findBestPosition(unit) {
    const currentPos = unit.position;
    const moveRange = unit.movement;
    const possiblePositions = [];
    
    // Get all positions within movement range
    for (const terrain of gameState.combat.terrain) {
        const distance = hexDistance(currentPos, terrain);
        if (distance <= moveRange && distance > 0) {
            const occupied = gameState.combat.units.some(u => 
                u !== unit && u.position.q === terrain.q && u.position.r === terrain.r
            );
            
            if (!occupied) {
                possiblePositions.push(terrain);
            }
        }
    }
    
    // Score positions based on tactical value
    let bestScore = -1000;
    let bestPosition = currentPos;
    
    for (const pos of possiblePositions) {
        let score = 0;
        
        // Prefer positions closer to player units
        const closestPlayer = gameState.combat.units
            .filter(u => u.isPlayer && !u.isDestroyed)
            .reduce((closest, u) => {
                const dist = hexDistance(pos, u.position);
                return dist < hexDistance(pos, closest.position) ? u : closest;
            });
        
        if (closestPlayer) {
            const distance = hexDistance(pos, closestPlayer.position);
            if (distance >= 6 && distance <= 12) score += 20; // Optimal firing range
            else if (distance < 6) score += 10; // Close range
            else score -= distance; // Too far
        }
        
        // Prefer cover (woods/rough terrain)
        const positionTerrain = gameState.combat.terrain.find(t => t.q === pos.q && t.r === pos.r);
        if (positionTerrain) {
            if (positionTerrain.type === 'woods') score += 15;
            else if (positionTerrain.type === 'rough') score += 10;
            if (positionTerrain.elevation > 0) score += positionTerrain.elevation * 5;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestPosition = pos;
        }
    }
    
    return bestPosition;
}

function findBestTarget(unit) {
    const playerUnits = gameState.combat.units.filter(u => u.isPlayer && !u.isDestroyed);
    if (playerUnits.length === 0) return null;
    
    let bestTarget = null;
    let bestScore = -1;
    
    for (const target of playerUnits) {
        const distance = hexDistance(unit.position, target.position);
        let score = 0;
        
        // Prefer damaged targets
        const healthPercent = target.armor / target.maxArmor;
        score += (1 - healthPercent) * 30;
        
        // Prefer closer targets
        score += Math.max(0, 20 - distance * 2);
        
        // Check if we can hit with any weapon
        const canHit = unit.weapons.some(weapon => distance <= weapon.range.long);
        if (!canHit) score = 0;
        
        if (score > bestScore) {
            bestScore = score;
            bestTarget = target;
        }
    }
    
    return bestTarget;
}

// Turn management
function endTurn() {
    const currentUnit = gameState.combat.turnOrder[gameState.combat.currentUnitIndex];
    currentUnit.hasActed = true;
    
    // Move to next unit
    gameState.combat.currentUnitIndex++;
    
    // Check if turn is complete
    if (gameState.combat.currentUnitIndex >= gameState.combat.turnOrder.length) {
        // Start new turn
        gameState.combat.currentTurn++;
        gameState.combat.currentUnitIndex = 0;
        
        // Reset unit states
        for (const unit of gameState.combat.units) {
            unit.hasActed = false;
            unit.hasMoved = false;
            unit.hasFired = false;
            unit.heat = Math.max(0, unit.heat - 1); // Passive heat dissipation
        }
        
        addCombatLog(`Turn ${gameState.combat.currentTurn} begins.`, 'important');
    }
    
    // Select next unit
    const nextUnit = gameState.combat.turnOrder[gameState.combat.currentUnitIndex];
    gameState.combat.selectedUnit = nextUnit;
    gameState.combat.phase = 'movement';
    
    // Execute AI turn if needed
    if (!nextUnit.isPlayer && !nextUnit.isDestroyed) {
        setTimeout(() => {
            executeAITurn(nextUnit);
            drawBattlefield();
            updateCombatUI();
            
            // Auto-advance after AI turn
            setTimeout(() => endTurn(), 1000);
        }, 500);
    }
    
    // Check victory conditions
    checkVictoryConditions();
    
    drawBattlefield();
    updateCombatUI();
}

function checkVictoryConditions() {
    const playerUnits = gameState.combat.units.filter(u => u.isPlayer && !u.isDestroyed);
    const enemyUnits = gameState.combat.units.filter(u => !u.isPlayer && !u.isDestroyed);
    
    if (playerUnits.length === 0) {
        addCombatLog('Defeat! All player units destroyed.', 'damage');
        setTimeout(() => alert('Mission Failed!'), 1000);
    } else if (enemyUnits.length === 0) {
        addCombatLog('Victory! All enemy units destroyed.', 'success');
        setTimeout(() => alert('Mission Accomplished!'), 1000);
    }
}

// UI Updates
function updateCombatUI() {
    // Update turn info
    document.getElementById('turn-number').textContent = gameState.combat.currentTurn;
    
    const currentUnit = gameState.combat.selectedUnit;
    if (currentUnit) {
        document.getElementById('current-unit').textContent = currentUnit.name;
        
        // Update unit details
        const unitDetails = document.getElementById('unit-details');
        const pilot = currentUnit.pilot;
        const pilotName = pilot.name || 'AI Pilot';
        
        unitDetails.innerHTML = `
            <div class="stat-line"><span>Pilot:</span><span>${pilotName}</span></div>
            <div class="stat-line"><span>Tonnage:</span><span>${currentUnit.tonnage} tons</span></div>
            <div class="stat-line"><span>Armor:</span><span>${currentUnit.armor}/${currentUnit.maxArmor}</span></div>
            <div class="stat-line"><span>Heat:</span><span>${currentUnit.heat}/${currentUnit.maxHeat}</span></div>
            <div class="stat-line"><span>Movement:</span><span>${currentUnit.movement} hexes</span></div>
            <div class="stat-line"><span>Has Moved:</span><span>${currentUnit.hasMoved ? 'Yes' : 'No'}</span></div>
            <div class="stat-line"><span>Has Fired:</span><span>${currentUnit.hasFired ? 'Yes' : 'No'}</span></div>
            <div class="stat-line"><span>Phase:</span><span>${gameState.combat.phase}</span></div>
        `;
        
        // Show weapons
        if (currentUnit.weapons && currentUnit.weapons.length > 0) {
            unitDetails.innerHTML += '<h4>Weapons:</h4>';
            currentUnit.weapons.forEach(weapon => {
                const ammoText = weapon.ammo === -1 ? 'Unlimited' : weapon.ammo.toString();
                unitDetails.innerHTML += `
                    <div class="stat-line">
                        <span>${weapon.name}:</span>
                        <span>${weapon.damage}dmg, ${weapon.heat}heat, ${ammoText} ammo</span>
                    </div>
                `;
            });
        }
    }
    
    // Update end turn button
    const endTurnBtn = document.getElementById('end-turn-btn');
    if (currentUnit && currentUnit.isPlayer) {
        endTurnBtn.disabled = false;
        endTurnBtn.textContent = 'End Turn';
    } else {
        endTurnBtn.disabled = true;
        endTurnBtn.textContent = 'AI Turn';
    }
}

function addCombatLog(message, type = '') {
    const logElement = document.getElementById('combat-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry' + (type ? ' ' + type : '');
    entry.textContent = `Turn ${gameState.combat.currentTurn}: ${message}`;
    
    logElement.appendChild(entry);
    logElement.scrollTop = logElement.scrollHeight;
    
    // Keep log manageable
    while (logElement.children.length > 50) {
        logElement.removeChild(logElement.firstChild);
    }
}

function exitCombat() {
    if (confirm('Are you sure you want to exit combat?')) {
        gameState.combat.active = false;
        gameState.combat.selectedUnit = null;
        showScreen('star-map');
    }
}