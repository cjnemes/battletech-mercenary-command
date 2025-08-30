// Battletech Mercenary Command - Web Game Logic

// Game State
let gameState = {
    currentScreen: 'main-menu',
    previousScreen: null,
    inGame: false,
    company: {
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
        }
    },
    time: {
        day: 1,
        month: 1,
        year: 3025
    },
    pilots: [],
    mechs: [],
    contracts: [],
    selectedPilot: null,
    selectedMech: null,
    selectedContract: null
};

// Initialize game on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Battletech Mercenary Command - Web Version Loading...');
    initializeGame();
});

function initializeGame() {
    // Generate starting company
    generateStartingPilots();
    generateStartingMechs();
    generateContracts();
    
    // Update displays
    updateCompanyDisplay();
    updatePilotDisplay();
    updateMechDisplay();
    updateContractDisplay();
    
    console.log('Game initialized successfully!');
}

// Screen Management
function showScreen(screenId) {
    console.log(`Switching to screen: ${screenId}`);
    
    // Track previous screen for navigation
    gameState.previousScreen = gameState.currentScreen;
    
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show target screen
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function showMainMenu() { 
    if (gameState.inGame) {
        // If we're in-game, go back to company overview instead
        showScreen('company-overview'); 
    } else {
        // Otherwise go to main menu
        showScreen('main-menu'); 
    }
}
function showCompanyOverview() { showScreen('company-overview'); }
function showMechBay() { showScreen('mech-bay'); }
function showStarMap() { showScreen('star-map'); }
function showTacticalCombat() { showScreen('tactical-combat'); }

// Main Menu Functions
function startNewGame() {
    console.log('Starting new game!');
    
    // Simple reset - just clear arrays and add basic data
    gameState.inGame = true;
    gameState.pilots = [];
    gameState.mechs = [];
    gameState.contracts = [];
    
    // Add one simple pilot
    gameState.pilots.push({
        id: 'pilot1',
        name: 'Commander',
        callsign: 'Boss',
        gunnery: 3,
        piloting: 4,
        salary: 10000
    });
    
    // Add one simple mech
    gameState.mechs.push({
        id: 'mech1',
        name: 'Atlas',
        tonnage: 100,
        status: 'Ready'
    });
    
    // Add one simple contract
    gameState.contracts.push({
        id: 'contract1',
        name: 'Garrison Duty',
        payment: 100000,
        difficulty: 'Easy'
    });
    
    // Update displays
    updatePilotDisplay();
    updateMechDisplay();
    updateContractDisplay();
    
    showCompanyOverview();
}

function loadGame() {
    alert('Load game functionality not yet implemented.');
}

function showSettings() {
    alert('Settings menu not yet implemented.');
}

function quitGame() {
    if (confirm('Are you sure you want to quit?')) {
        alert('Thanks for playing Battletech Mercenary Command!');
    }
}

// Pilot Generation and Management
function generateStartingPilots() {
    // Comprehensive pilot data for authentic Battletech experience
    const pilotPool = [
        // Elite Veterans (Gunnery 2-3, Piloting 2-3)
        {name: 'Marcus "Reaper" Kane', age: 42, gunnery: 2, piloting: 2, experience: 'Elite', traits: ['Marksman', 'Veteran', 'Iron Will'], backstory: 'Former Star League Regular Army officer'},
        {name: 'Sarah "Phoenix" Chen', age: 38, gunnery: 2, piloting: 3, experience: 'Elite', traits: ['Natural Leader', 'Veteran', 'Lucky'], backstory: 'Ex-Wolf\'s Dragoons ace pilot'},
        {name: 'Viktor "Hammerfall" Petrov', age: 45, gunnery: 3, piloting: 2, experience: 'Elite', traits: ['Aggressive', 'Veteran', 'Steady Hands'], backstory: 'Former Lyran Guards assault specialist'},
        
        // Veterans (Gunnery 3-4, Piloting 3-4)
        {name: 'Lisa "Razor" Williams', age: 34, gunnery: 3, piloting: 3, experience: 'Veteran', traits: ['Marksman', 'Cautious'], backstory: 'Former Davion Guards sniper specialist'},
        {name: 'James "Thunder" Rodriguez', age: 36, gunnery: 4, piloting: 3, experience: 'Veteran', traits: ['Natural Leader', 'Steady Hands'], backstory: 'Ex-Marik Militia commander'},
        {name: 'Anna "Ghostrider" Steiner', age: 31, gunnery: 3, piloting: 4, experience: 'Veteran', traits: ['Cautious', 'Iron Will'], backstory: 'Former Lyran reconnaissance pilot'},
        {name: 'David "Ironside" Blake', age: 39, gunnery: 4, piloting: 3, experience: 'Veteran', traits: ['Veteran', 'Lucky'], backstory: 'Mercenary with 15 years experience'},
        {name: 'Michelle "Viper" Cross', age: 33, gunnery: 3, piloting: 4, experience: 'Veteran', traits: ['Aggressive', 'Steady Hands'], backstory: 'Former House Liao special forces'},
        
        // Regulars (Gunnery 4-5, Piloting 4-5)
        {name: 'Robert "Bulldog" Stone', age: 29, gunnery: 4, piloting: 4, experience: 'Regular', traits: ['Steady Hands'], backstory: 'Solid mercenary pilot, dependable'},
        {name: 'Elena "Falcon" Kurita', age: 27, gunnery: 5, piloting: 4, experience: 'Regular', traits: ['Cautious'], backstory: 'Former DCMS regular forces'},
        {name: 'Thomas "Striker" Davion', age: 30, gunnery: 4, piloting: 5, experience: 'Regular', traits: ['Marksman'], backstory: 'Ex-Davion Reserves officer'},
        {name: 'Catherine "Storm" Marik', age: 28, gunnery: 5, piloting: 4, experience: 'Regular', traits: ['Iron Will'], backstory: 'Former Free Worlds League militia'},
        {name: 'Alex "Talon" Hawk', age: 32, gunnery: 4, piloting: 5, experience: 'Regular', traits: ['Lucky'], backstory: 'Seasoned mercenary pilot'},
        {name: 'Morgan "Stormcrow" Wolf', age: 26, gunnery: 5, piloting: 5, experience: 'Regular', traits: [], backstory: 'Competent pilot seeking experience'},
        
        // Green Pilots (Gunnery 5-7, Piloting 5-7)
        {name: 'Jake "Rookie" Miller', age: 23, gunnery: 6, piloting: 6, experience: 'Green', traits: ['Lucky'], backstory: 'Fresh academy graduate'},
        {name: 'Samantha "Newbie" Taylor', age: 22, gunnery: 7, piloting: 5, experience: 'Green', traits: [], backstory: 'Recent training battalion graduate'},
        {name: 'Chris "Hotshot" Anderson', age: 24, gunnery: 5, piloting: 7, experience: 'Green', traits: ['Aggressive'], backstory: 'Overconfident but talented rookie'},
        {name: 'Amy "Cadet" Johnson', age: 25, gunnery: 6, piloting: 6, experience: 'Green', traits: ['Cautious'], backstory: 'Careful but inexperienced pilot'},
        {name: 'Ryan "Fresh" Wilson', age: 23, gunnery: 7, piloting: 6, experience: 'Green', traits: [], backstory: 'New to mercenary life'},
        {name: 'Jessica "Greenhorn" Davis', age: 22, gunnery: 6, piloting: 7, experience: 'Green', traits: ['Iron Will'], backstory: 'Determined but untested'}
    ];
    
    // Add player's starting pilot (always the commander)
    gameState.pilots.push({
        id: generateId(),
        name: 'Commander',
        callsign: 'Boss',
        age: 35,
        gunnery: 3,
        piloting: 4,
        experience: 'Veteran',
        salary: 12000,
        morale: 100,
        loyalty: 100,
        traits: ['Natural Leader', 'Veteran'],
        backstory: 'Experienced mercenary commander',
        currentMech: null,
        injuries: []
    });
    
    // Randomly select and add pilots from the pool
    const availablePilots = [...pilotPool];
    const numStartingPilots = 8 + Math.floor(Math.random() * 5); // 8-12 starting pilots
    
    for (let i = 0; i < numStartingPilots && availablePilots.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availablePilots.length);
        const selectedPilot = availablePilots.splice(randomIndex, 1)[0];
        
        // Calculate salary based on skills and experience
        let baseSalary = calculatePilotSalary(selectedPilot.gunnery, selectedPilot.piloting, selectedPilot.experience);
        
        const pilot = {
            id: generateId(),
            name: selectedPilot.name.split('"')[2] || selectedPilot.name.split(' ')[1], // Extract real name
            callsign: selectedPilot.name.match(/"([^"]+)"/)?.[1] || '', // Extract callsign
            age: selectedPilot.age,
            gunnery: selectedPilot.gunnery,
            piloting: selectedPilot.piloting,
            experience: selectedPilot.experience,
            salary: baseSalary,
            morale: 50 + Math.floor(Math.random() * 40), // 50-90
            loyalty: 30 + Math.floor(Math.random() * 40), // 30-70
            traits: [...selectedPilot.traits],
            backstory: selectedPilot.backstory,
            currentMech: null,
            injuries: []
        };
        
        gameState.pilots.push(pilot);
    }
}

function calculatePilotSalary(gunnery, piloting, experience) {
    let baseSalary = 15000; // Base salary
    
    // Adjust for skills (lower numbers are better)
    baseSalary -= (gunnery - 2) * 1500;
    baseSalary -= (piloting - 2) * 1200;
    
    // Adjust for experience
    switch (experience) {
        case 'Elite': baseSalary += 8000; break;
        case 'Veteran': baseSalary += 4000; break;
        case 'Regular': baseSalary += 1000; break;
        case 'Green': baseSalary -= 2000; break;
    }
    
    return Math.max(3000, Math.floor(baseSalary / 500) * 500); // Round to nearest 500, minimum 3000
}

function generateStartingMechs() {
    const mechDatabase = [
        // LIGHT MECHS (20-35 tons)
        {
            chassis: 'Locust', variant: 'LCT-1V', tonnage: 20, weightClass: 'Light',
            movement: 8, jumpJets: 0, heatCapacity: 10, battleValue: 356,
            armor: { head: 9, centerTorso: 15, leftTorso: 10, rightTorso: 10, leftArm: 6, rightArm: 6, leftLeg: 8, rightLeg: 8, total: 72 },
            weapons: ['Medium Laser', 'Machine Gun'], ammo: ['Machine Gun: 200'],
            quirks: ['Improved Communications', 'Weak Head Armor']
        },
        {
            chassis: 'Commando', variant: 'COM-2D', tonnage: 25, weightClass: 'Light',
            movement: 6, jumpJets: 0, heatCapacity: 10, battleValue: 514,
            armor: { head: 9, centerTorso: 18, leftTorso: 13, rightTorso: 13, leftArm: 8, rightArm: 8, leftLeg: 12, rightLeg: 12, total: 93 },
            weapons: ['SRM-2', 'SRM-2'], ammo: ['SRM: 50'],
            quirks: ['Improved Communications']
        },
        {
            chassis: 'Raven', variant: 'RVN-3L', tonnage: 35, weightClass: 'Light',
            movement: 6, jumpJets: 0, heatCapacity: 13, battleValue: 498,
            armor: { head: 9, centerTorso: 22, leftTorso: 16, rightTorso: 16, leftArm: 12, rightArm: 12, leftLeg: 16, rightLeg: 16, total: 119 },
            weapons: ['Medium Laser', 'Medium Laser', 'SRM-2'], ammo: ['SRM: 50'],
            quirks: ['Improved Communications', 'Electronic Warfare Equipment']
        },
        {
            chassis: 'Jenner', variant: 'JR7-D', tonnage: 35, weightClass: 'Light',
            movement: 7, jumpJets: 5, heatCapacity: 10, battleValue: 669,
            armor: { head: 9, centerTorso: 21, leftTorso: 15, rightTorso: 15, leftArm: 12, rightArm: 12, leftLeg: 16, rightLeg: 16, total: 116 },
            weapons: ['SRM-4', 'SRM-4'], ammo: ['SRM: 25'],
            quirks: ['Improved Jump Jets']
        },

        // MEDIUM MECHS (40-55 tons)
        {
            chassis: 'Centurion', variant: 'CN9-A', tonnage: 50, weightClass: 'Medium',
            movement: 4, jumpJets: 0, heatCapacity: 13, battleValue: 772,
            armor: { head: 9, centerTorso: 31, leftTorso: 23, rightTorso: 23, leftArm: 17, rightArm: 17, leftLeg: 23, rightLeg: 23, total: 166 },
            weapons: ['AC/10', 'LRM-10', 'Medium Laser'], ammo: ['AC/10: 20', 'LRM: 12'],
            quirks: ['Rugged']
        },
        {
            chassis: 'Hunchback', variant: 'HBK-4G', tonnage: 50, weightClass: 'Medium',
            movement: 4, jumpJets: 0, heatCapacity: 13, battleValue: 851,
            armor: { head: 9, centerTorso: 31, leftTorso: 23, rightTorso: 23, leftArm: 17, rightArm: 17, leftLeg: 23, rightLeg: 23, total: 166 },
            weapons: ['AC/20', 'Medium Laser', 'Medium Laser'], ammo: ['AC/20: 15'],
            quirks: ['Accurate Weapon (AC/20)']
        },
        {
            chassis: 'Griffin', variant: 'GRF-1N', tonnage: 55, weightClass: 'Medium',
            movement: 5, jumpJets: 5, heatCapacity: 13, battleValue: 1086,
            armor: { head: 9, centerTorso: 35, leftTorso: 26, rightTorso: 26, leftArm: 18, rightArm: 18, leftLeg: 26, rightLeg: 26, total: 184 },
            weapons: ['PPC', 'LRM-10'], ammo: ['LRM: 12'],
            quirks: ['Improved Jump Jets']
        },
        {
            chassis: 'Wolverine', variant: 'WVR-6R', tonnage: 55, weightClass: 'Medium',
            movement: 5, jumpJets: 5, heatCapacity: 10, battleValue: 1101,
            armor: { head: 9, centerTorso: 35, leftTorso: 26, rightTorso: 26, leftArm: 18, rightArm: 18, leftLeg: 26, rightLeg: 26, total: 184 },
            weapons: ['AC/5', 'SRM-6', 'Medium Laser'], ammo: ['AC/5: 20', 'SRM: 15'],
            quirks: ['Rugged']
        },

        // HEAVY MECHS (60-75 tons)
        {
            chassis: 'Catapult', variant: 'CPLT-C1', tonnage: 65, weightClass: 'Heavy',
            movement: 4, jumpJets: 4, heatCapacity: 16, battleValue: 1165,
            armor: { head: 9, centerTorso: 42, leftTorso: 32, rightTorso: 32, leftArm: 22, rightArm: 22, leftLeg: 32, rightLeg: 32, total: 223 },
            weapons: ['LRM-15', 'LRM-15', 'Medium Laser', 'Medium Laser'], ammo: ['LRM: 16'],
            quirks: ['Improved Jump Jets']
        },
        {
            chassis: 'JagerMech', variant: 'JM6-S', tonnage: 65, weightClass: 'Heavy',
            movement: 4, jumpJets: 0, heatCapacity: 10, battleValue: 749,
            armor: { head: 9, centerTorso: 42, leftTorso: 32, rightTorso: 32, leftArm: 22, rightArm: 22, leftLeg: 32, rightLeg: 32, total: 223 },
            weapons: ['AC/5', 'AC/5', 'Medium Laser', 'Medium Laser'], ammo: ['AC/5: 40'],
            quirks: ['Accurate Weapon (AC/5)', 'Weak Head Armor']
        },
        {
            chassis: 'Rifleman', variant: 'RFL-3N', tonnage: 60, weightClass: 'Heavy',
            movement: 4, jumpJets: 0, heatCapacity: 20, battleValue: 797,
            armor: { head: 9, centerTorso: 40, leftTorso: 30, rightTorso: 30, leftArm: 20, rightArm: 20, leftLeg: 30, rightLeg: 30, total: 209 },
            weapons: ['AC/5', 'AC/5', 'Medium Laser', 'Medium Laser'], ammo: ['AC/5: 40'],
            quirks: ['Anti-Aircraft Targeting']
        },
        {
            chassis: 'Warhammer', variant: 'WHM-6R', tonnage: 70, weightClass: 'Heavy',
            movement: 4, jumpJets: 0, heatCapacity: 20, battleValue: 978,
            armor: { head: 9, centerTorso: 45, leftTorso: 34, rightTorso: 34, leftArm: 23, rightArm: 23, leftLeg: 34, rightLeg: 34, total: 236 },
            weapons: ['PPC', 'PPC', 'SRM-6', 'Medium Laser'], ammo: ['SRM: 15'],
            quirks: ['Searchlight', 'Stable']
        },

        // ASSAULT MECHS (80-100 tons)
        {
            chassis: 'Atlas', variant: 'AS7-D', tonnage: 100, weightClass: 'Assault',
            movement: 3, jumpJets: 0, heatCapacity: 20, battleValue: 1557,
            armor: { head: 9, centerTorso: 62, leftTorso: 47, rightTorso: 47, leftArm: 34, rightArm: 34, leftLeg: 41, rightLeg: 41, total: 315 },
            weapons: ['AC/20', 'LRM-20', 'SRM-6', 'Medium Laser'], ammo: ['AC/20: 15', 'LRM: 6', 'SRM: 15'],
            quirks: ['Command Mech', 'Distracting']
        },
        {
            chassis: 'Banshee', variant: 'BNC-3E', tonnage: 95, weightClass: 'Assault',
            movement: 3, jumpJets: 0, heatCapacity: 16, battleValue: 1223,
            armor: { head: 9, centerTorso: 58, leftTorso: 44, rightTorso: 44, leftArm: 32, rightArm: 32, leftLeg: 40, rightLeg: 40, total: 299 },
            weapons: ['PPC', 'AC/5', 'Medium Laser', 'Small Laser'], ammo: ['AC/5: 20'],
            quirks: ['Command Mech']
        },
        {
            chassis: 'Stalker', variant: 'STK-3F', tonnage: 85, weightClass: 'Assault',
            movement: 3, jumpJets: 0, heatCapacity: 20, battleValue: 1152,
            armor: { head: 9, centerTorso: 54, leftTorso: 40, rightTorso: 40, leftArm: 28, rightArm: 28, leftLeg: 36, rightLeg: 36, total: 271 },
            weapons: ['LRM-10', 'LRM-10', 'SRM-6', 'SRM-6', 'Medium Laser', 'Medium Laser'], ammo: ['LRM: 24', 'SRM: 30'],
            quirks: ['Accurate Weapon (LRM)']
        },
        {
            chassis: 'Highlander', variant: 'HGN-732', tonnage: 90, weightClass: 'Assault',
            movement: 3, jumpJets: 3, heatCapacity: 16, battleValue: 1838,
            armor: { head: 9, centerTorso: 55, leftTorso: 42, rightTorso: 42, leftArm: 30, rightArm: 30, leftLeg: 37, rightLeg: 37, total: 282 },
            weapons: ['Gauss Rifle', 'SRM-6', 'Medium Laser', 'Medium Laser'], ammo: ['Gauss: 16', 'SRM: 15'],
            quirks: ['Command Mech', 'Improved Jump Jets']
        }
    ];
    
    // Add starting mechs with varied conditions and availability
    const selectedMechs = [];
    const numMechs = 8 + Math.floor(Math.random() * 7); // 8-14 starting mechs
    
    // Ensure we have mechs from each weight class
    const lightMechs = mechDatabase.filter(m => m.weightClass === 'Light');
    const mediumMechs = mechDatabase.filter(m => m.weightClass === 'Medium');
    const heavyMechs = mechDatabase.filter(m => m.weightClass === 'Heavy');
    const assaultMechs = mechDatabase.filter(m => m.weightClass === 'Assault');
    
    // Add at least one from each class
    selectedMechs.push(lightMechs[Math.floor(Math.random() * lightMechs.length)]);
    selectedMechs.push(mediumMechs[Math.floor(Math.random() * mediumMechs.length)]);
    selectedMechs.push(heavyMechs[Math.floor(Math.random() * heavyMechs.length)]);
    
    // Fill remaining slots randomly from all mechs
    while (selectedMechs.length < numMechs) {
        const randomMech = mechDatabase[Math.floor(Math.random() * mechDatabase.length)];
        // Avoid exact duplicates (same variant)
        if (!selectedMechs.find(m => m.chassis === randomMech.chassis && m.variant === randomMech.variant)) {
            selectedMechs.push(randomMech);
        }
    }
    
    selectedMechs.forEach(mechData => {
        const condition = Math.random() < 0.7 ? 100 : 60 + Math.floor(Math.random() * 40); // 70% chance of perfect condition
        const status = condition >= 90 ? 'Operational' : condition >= 60 ? 'Damaged' : 'Repairs Needed';
        
        gameState.mechs.push({
            id: generateId(),
            ...mechData,
            pilot: null,
            condition: condition,
            heat: 0,
            status: status,
            repairCost: condition < 100 ? Math.floor((100 - condition) * mechData.tonnage * 100) : 0,
            repairDays: condition < 100 ? Math.ceil((100 - condition) / 10) : 0,
            maintenanceCost: Math.floor(mechData.tonnage * 150) // Monthly maintenance
        });
    });
}

function generateContracts() {
    const contractTemplates = [
        // GARRISON DUTIES
        {
            name: 'Planetary Defense Contract', type: 'Garrison Duty', difficultyWeight: [40, 35, 20, 5],
            employers: ['Lyran Commonwealth', 'Federated Suns', 'Capellan Confederation', 'Free Worlds League', 'Draconis Combine'],
            planets: ['New Avalon', 'Tharkad', 'Sian', 'Atreus', 'Luthien', 'Solaris VII', 'Hesperus II', 'New Syrtis'],
            description: 'Provide planetary defense against potential hostile incursions. Maintain readiness and respond to threats.',
            paymentMod: 0.8, durationRange: [60, 120], mechsRange: [2, 4], salvageChance: 0.2
        },
        {
            name: 'Industrial Security', type: 'Garrison Duty', difficultyWeight: [50, 30, 15, 5],
            employers: ['Steiner Industries', 'Davion Heavy Industries', 'Capellan Confederation', 'Marik-Stewart Commonwealth'],
            planets: ['Hesperus II', 'New Syrtis', 'Capella', 'Atreus', 'Luthien'],
            description: 'Guard critical industrial facilities and supply lines from raiders and saboteurs.',
            paymentMod: 0.9, durationRange: [30, 90], mechsRange: [2, 3], salvageChance: 0.3
        },
        
        // RAID MISSIONS
        {
            name: 'Lightning Raid', type: 'Raid Mission', difficultyWeight: [20, 40, 30, 10],
            employers: ['Lyran Intelligence Corps', 'Davion Guards', 'Maskirovka', 'SAFE', 'ISF'],
            planets: ['Periphery Worlds', 'Border Systems', 'Contested Zones'],
            description: 'Execute fast strike against enemy installations. Primary objectives: destroy target, minimize losses.',
            paymentMod: 1.3, durationRange: [14, 30], mechsRange: [2, 4], salvageChance: 0.6
        },
        {
            name: 'Supply Depot Raid', type: 'Raid Mission', difficultyWeight: [25, 35, 30, 10],
            employers: ['House Military Commands', 'Mercenary Review Commission'],
            planets: ['Enemy Border Worlds', 'Contested Systems'],
            description: 'Strike enemy supply depot. Destroy munitions, capture intelligence, withdraw before reinforcements.',
            paymentMod: 1.2, durationRange: [7, 21], mechsRange: [3, 5], salvageChance: 0.7
        },
        
        // ESCORT MISSIONS
        {
            name: 'VIP Transport', type: 'Escort Mission', difficultyWeight: [30, 40, 25, 5],
            employers: ['Noble Houses', 'Corporate Executives', 'Military Commands'],
            planets: ['Major Trade Routes', 'Diplomatic Zones'],
            description: 'Provide armed escort for high-value personnel through potentially hostile territory.',
            paymentMod: 1.1, durationRange: [14, 30], mechsRange: [2, 4], salvageChance: 0.2
        },
        {
            name: 'Convoy Security', type: 'Escort Mission', difficultyWeight: [35, 35, 25, 5],
            employers: ['Trading Companies', 'Military Logistics', 'Corporate Interests'],
            planets: ['Trade Routes', 'Supply Lines'],
            description: 'Guard merchant convoys or military supply trains against pirate attacks and raiders.',
            paymentMod: 1.0, durationRange: [21, 45], mechsRange: [3, 5], salvageChance: 0.4
        },
        
        // PLANETARY ASSAULT
        {
            name: 'Planetary Invasion', type: 'Planetary Assault', difficultyWeight: [5, 25, 45, 25],
            employers: ['House Military Commands', 'Mercenary Review Commission'],
            planets: ['Strategic Worlds', 'Border Planets', 'Industrial Centers'],
            description: 'Large-scale military operation to seize control of enemy-held world. Expect heavy resistance.',
            paymentMod: 1.8, durationRange: [60, 120], mechsRange: [4, 8], salvageChance: 0.8
        },
        {
            name: 'Spaceport Assault', type: 'Planetary Assault', difficultyWeight: [10, 30, 40, 20],
            employers: ['House Commands', 'Regimental Combat Teams'],
            planets: ['Strategic Locations', 'Enemy Strongholds'],
            description: 'Assault and capture fortified spaceport facilities. Critical for follow-up operations.',
            paymentMod: 1.5, durationRange: [30, 60], mechsRange: [4, 6], salvageChance: 0.7
        },
        
        // RECONNAISSANCE
        {
            name: 'Deep Recon', type: 'Reconnaissance', difficultyWeight: [25, 40, 25, 10],
            employers: ['Military Intelligence', 'House Intelligence Services'],
            planets: ['Enemy Territory', 'Unexplored Regions', 'Border Zones'],
            description: 'Gather intelligence on enemy movements and installations. Stealth and survival priority.',
            paymentMod: 1.1, durationRange: [21, 45], mechsRange: [2, 3], salvageChance: 0.3
        },
        {
            name: 'Border Patrol', type: 'Reconnaissance', difficultyWeight: [40, 35, 20, 5],
            employers: ['Border Commands', 'Frontier Guards'],
            planets: ['Border Worlds', 'Periphery Systems'],
            description: 'Patrol contested border regions. Report enemy activity, engage only if necessary.',
            paymentMod: 0.9, durationRange: [30, 60], mechsRange: [2, 4], salvageChance: 0.2
        },
        
        // PIRATE HUNTING
        {
            name: 'Anti-Piracy Sweep', type: 'Pirate Hunting', difficultyWeight: [30, 40, 25, 5],
            employers: ['Mercenary Review Commission', 'Trading Guilds', 'Local Authorities'],
            planets: ['Pirate Havens', 'Trade Routes', 'Outer Colonies'],
            description: 'Eliminate pirate bands threatening commerce. Expect guerrilla tactics and hit-and-run attacks.',
            paymentMod: 1.2, durationRange: [30, 75], mechsRange: [3, 5], salvageChance: 0.6
        },
        {
            name: 'Bandit Elimination', type: 'Pirate Hunting', difficultyWeight: [25, 35, 30, 10],
            employers: ['Local Militias', 'Corporate Security', 'Planetary Governments'],
            planets: ['Outer Rim', 'Frontier Worlds', 'Badlands'],
            description: 'Hunt down notorious pirate band. High reward for confirmed elimination of leadership.',
            paymentMod: 1.4, durationRange: [21, 60], mechsRange: [2, 4], salvageChance: 0.8
        },
        
        // SPECIAL OPERATIONS
        {
            name: 'Demolition Mission', type: 'Special Operation', difficultyWeight: [15, 30, 35, 20],
            employers: ['Special Forces Commands', 'Intelligence Services'],
            planets: ['Enemy Installations', 'Strategic Targets'],
            description: 'Destroy specific high-value targets behind enemy lines. Infiltration and demolition required.',
            paymentMod: 1.6, durationRange: [14, 30], mechsRange: [2, 4], salvageChance: 0.5
        },
        {
            name: 'Asset Recovery', type: 'Special Operation', difficultyWeight: [20, 35, 30, 15],
            employers: ['Corporate Interests', 'Military Commands', 'Noble Houses'],
            planets: ['Hostile Territory', 'Crash Sites', 'Lost Colonies'],
            description: 'Recover valuable assets from hostile territory. Could be technology, personnel, or intelligence.',
            paymentMod: 1.5, durationRange: [21, 45], mechsRange: [3, 5], salvageChance: 0.9
        }
    ];
    
    // Reduce number of general contracts since we now have faction-specific ones
    const numGeneralContracts = 5 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < numGeneralContracts; i++) {
        const template = contractTemplates[Math.floor(Math.random() * contractTemplates.length)];
        
        // Enhanced contract generation with political context
        const contract = createContractFromTemplate(template);
        gameState.contracts.push(contract);
    }
}

function createContractFromTemplate(template) {
    const difficulties = ['Easy', 'Moderate', 'Hard', 'Extreme'];
    const operationNames = [
        'Thunderbolt', 'Steel Rain', 'Iron Fist', 'Lightning Strike', 'Hammer Fall', 'Storm Front',
        'Crimson Dawn', 'Silver Lance', 'Golden Eagle', 'Diamond Back', 'Phantom Strike', 'Viper Coil',
        'Thunder Hawk', 'Steel Wolf', 'Iron Phoenix', 'Battle Cry', 'War Hammer', 'Storm Rider',
        'Fire Lance', 'Blood Moon', 'Steel Talon', 'Ghost Wind', 'Iron Storm', 'Thunder Blade'
    ];

    // Select difficulty based on weighted probabilities
    let difficultyIndex = 0;
    const roll = Math.random() * 100;
    let cumulative = 0;
    for (let j = 0; j < template.difficultyWeight.length; j++) {
        cumulative += template.difficultyWeight[j];
        if (roll <= cumulative) {
            difficultyIndex = j;
            break;
        }
    }
    const difficulty = difficulties[difficultyIndex];

    // Calculate base payment with market conditions
    let basePayment = 40000;
    switch (difficulty) {
        case 'Easy': basePayment = 25000 + Math.floor(Math.random() * 15000); break;
        case 'Moderate': basePayment = 40000 + Math.floor(Math.random() * 20000); break;
        case 'Hard': basePayment = 70000 + Math.floor(Math.random() * 30000); break;
        case 'Extreme': basePayment = 120000 + Math.floor(Math.random() * 80000); break;
    }

    basePayment = Math.floor(basePayment * template.paymentMod);
    
    // Apply market conditions from political climate
    const marketMultiplier = (typeof POLITICAL_CONTEXT_3025 !== 'undefined' && POLITICAL_CONTEXT_3025.mercenaryMarket.demand === 'High') ? 1.2 : 1.0;
    basePayment = Math.floor(basePayment * marketMultiplier);

    const contract = {
        id: generateId(),
        name: `Operation ${operationNames[Math.floor(Math.random() * operationNames.length)]}`,
        type: template.type,
        employer: template.employers[Math.floor(Math.random() * template.employers.length)],
        planet: template.planets[Math.floor(Math.random() * template.planets.length)],
        difficulty: difficulty,
        basePayment: Math.floor(basePayment),
        bonus: Math.floor(basePayment * (0.4 + Math.random() * 0.4)), // 40-80% bonus
        advance: Math.floor(basePayment * (0.2 + Math.random() * 0.2)), // 20-40% advance
        duration: template.durationRange[0] + Math.floor(Math.random() * (template.durationRange[1] - template.durationRange[0] + 1)),
        requiredMechs: template.mechsRange[0] + Math.floor(Math.random() * (template.mechsRange[1] - template.mechsRange[0] + 1)),
        salvageRights: Math.random() < template.salvageChance,
        description: template.description,
        riskFactors: generateRiskFactors(difficulty, template.type),
        specialRequirements: generateSpecialRequirements(template.type),
        reputationEffects: generateReputationEffects(template.employer, difficulty),
        politicalContext: generatePoliticalBriefing(template.employer, difficulty)
    };

    return contract;
}

function generateRiskFactors(difficulty, type) {
    const riskPool = {
        'Easy': ['Minimal opposition expected', 'Good intelligence available', 'Friendly territory'],
        'Moderate': ['Moderate enemy presence', 'Limited intelligence', 'Contested zone', 'Potential for reinforcements'],
        'Hard': ['Heavy enemy presence', 'Poor intelligence', 'Hostile territory', 'Elite enemy units possible', 'Electronic warfare likely'],
        'Extreme': ['Overwhelming enemy forces', 'No intelligence available', 'Deep enemy territory', 'Elite enemy units confirmed', 'Advanced technology detected', 'Multiple enemy regiments']
    };
    
    const typeRisks = {
        'Garrison Duty': ['Potential for surprise attacks', 'Long deployment'],
        'Raid Mission': ['Time pressure', 'Extraction under fire', 'Behind enemy lines'],
        'Escort Mission': ['Ambush danger', 'Civilian casualties possible', 'Multiple route threats'],
        'Planetary Assault': ['Fortified positions', 'Air support opposition', 'Urban combat'],
        'Reconnaissance': ['Avoid detection', 'Limited support', 'Escape routes uncertain'],
        'Pirate Hunting': ['Guerrilla tactics', 'Unknown force strength', 'Civilian shields'],
        'Special Operation': ['Classified objectives', 'No backup available', 'Deniable operation']
    };

    const risks = [...(riskPool[difficulty] || [])];
    if (typeRisks[type]) {
        risks.push(...typeRisks[type]);
    }

    // Return 1-3 random risk factors
    const numRisks = 1 + Math.floor(Math.random() * 3);
    const selectedRisks = [];
    for (let i = 0; i < numRisks && risks.length > 0; i++) {
        const index = Math.floor(Math.random() * risks.length);
        selectedRisks.push(risks.splice(index, 1)[0]);
    }
    return selectedRisks;
}

function generateSpecialRequirements(type) {
    const requirements = {
        'Garrison Duty': ['Maintain communication protocols', 'Monthly status reports required'],
        'Raid Mission': ['Fast deployment required', 'Stealth approach preferred', 'Minimal collateral damage'],
        'Escort Mission': ['VIP protection protocols', 'Schedule adherence critical'],
        'Planetary Assault': ['Combined arms coordination', 'Air support available', 'Artillery support'],
        'Reconnaissance': ['Electronic warfare equipment recommended', 'Long-range communications required'],
        'Pirate Hunting': ['Bounty available for leaders', 'Local militia cooperation'],
        'Special Operation': ['Security clearance required', 'Specialized equipment provided']
    };

    return requirements[type] || ['Standard military protocols'];
}

function generateReputationEffects(employer, difficulty) {
    const effects = { positive: [], negative: [] };
    
    // Determine faction
    let faction = 'Mercenary';
    if (employer.includes('Lyran') || employer.includes('Steiner')) faction = 'Steiner';
    else if (employer.includes('Davion') || employer.includes('Federated')) faction = 'Davion';
    else if (employer.includes('Liao') || employer.includes('Capellan')) faction = 'Liao';
    else if (employer.includes('Marik') || employer.includes('Free Worlds')) faction = 'Marik';
    else if (employer.includes('Kurita') || employer.includes('Draconis')) faction = 'Kurita';

    // Calculate reputation gains/losses based on difficulty
    const reputationGain = difficulty === 'Easy' ? 5 : difficulty === 'Moderate' ? 10 : difficulty === 'Hard' ? 15 : 20;
    
    effects.positive.push(`+${reputationGain} ${faction} reputation`);
    effects.positive.push(`+${Math.floor(reputationGain / 2)} Mercenary reputation`);
    
    if (Math.random() < 0.3) {
        // Chance of negative reputation with opposing factions
        const opposingFactions = ['Steiner', 'Davion', 'Liao', 'Marik', 'Kurita'].filter(f => f !== faction);
        const enemyFaction = opposingFactions[Math.floor(Math.random() * opposingFactions.length)];
        effects.negative.push(`-${Math.floor(reputationGain / 2)} ${enemyFaction} reputation`);
    }

    return effects;
}

function generateContractDescription(type, difficulty) {
    const descriptions = {
        'Garrison Duty': 'Defend assigned territory from potential threats. Maintain peace and security in the region.',
        'Raid Mission': 'Conduct lightning strike against enemy forces. Hit hard and fast.',
        'Escort Mission': 'Provide security escort for critical personnel/cargo.',
        'Planetary Assault': 'Large-scale military operation. Expect heavy resistance.',
        'Reconnaissance': 'Gather intelligence on enemy activities. Stealth preferred.',
        'Pirate Hunting': 'Eliminate pirate activity threatening commerce.'
    };
    
    let desc = descriptions[type] || 'Standard mercenary contract.';
    
    switch (difficulty) {
        case 'Easy': desc += ' Intelligence suggests minimal opposition expected.'; break;
        case 'Moderate': desc += ' Moderate resistance anticipated.'; break;
        case 'Hard': desc += ' Heavy enemy presence confirmed. High risk operation.'; break;
        case 'Extreme': desc += ' EXTREME DANGER. Elite enemy forces detected. Casualties expected.'; break;
    }
    
    return desc;
}

// Display Updates
function updateCompanyDisplay() {
    document.getElementById('company-name').textContent = gameState.company.name;
    document.getElementById('company-funds').textContent = formatCurrency(gameState.company.funds);
    document.getElementById('company-rating').textContent = calculateCompanyRating();
    document.getElementById('current-date').textContent = formatDate();
    
    const monthlyExpenses = calculateMonthlyExpenses();
    document.getElementById('monthly-expenses').textContent = formatCurrency(monthlyExpenses);
    document.getElementById('monthly-income').textContent = formatCurrency(0);
    
    // Update political intelligence
    updatePoliticalIntel();
}

function updatePoliticalIntel() {
    const intelDiv = document.getElementById('political-intel');
    if (!intelDiv || typeof POLITICAL_CONTEXT_3025 === 'undefined') return;
    
    intelDiv.innerHTML = '';
    
    // Add current events
    if (POLITICAL_CONTEXT_3025.currentEvents) {
        POLITICAL_CONTEXT_3025.currentEvents.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = 'political-events';
            eventDiv.innerHTML = `
                <div class="event-title">${event.event}</div>
                <div class="event-description">${event.description}</div>
                <div class="event-impact">Impact: ${event.impact}</div>
            `;
            intelDiv.appendChild(eventDiv);
        });
    }
    
    // Add mercenary market conditions
    if (POLITICAL_CONTEXT_3025.mercenaryMarket) {
        const marketDiv = document.createElement('div');
        marketDiv.className = 'political-events';
        marketDiv.innerHTML = `
            <div class="event-title">Mercenary Market Status</div>
            <div class="event-description">${POLITICAL_CONTEXT_3025.mercenaryMarket.description}</div>
            <div class="event-impact">Demand: ${POLITICAL_CONTEXT_3025.mercenaryMarket.demand} | Risk: ${POLITICAL_CONTEXT_3025.mercenaryMarket.riskLevel}</div>
        `;
        intelDiv.appendChild(marketDiv);
    }
}

function updatePilotDisplay() {
    const pilotList = document.getElementById('pilot-list');
    pilotList.innerHTML = '';
    
    gameState.pilots.forEach(pilot => {
        const pilotDiv = document.createElement('div');
        pilotDiv.className = 'pilot-entry';
        pilotDiv.onclick = () => selectPilot(pilot.id);
        
        const displayName = pilot.callsign ? `"${pilot.callsign}" ${pilot.name}` : pilot.name;
        
        // Get experience level color
        const expClass = pilot.experience === 'Elite' ? 'text-elite' : 
                        pilot.experience === 'Veteran' ? 'text-veteran' : 
                        pilot.experience === 'Regular' ? 'text-regular' : 'text-green';
        
        pilotDiv.innerHTML = `
            <div class="pilot-name">${displayName}</div>
            <div class="pilot-skills">
                <span class="${expClass}">${pilot.experience}</span> | 
                Gun: ${pilot.gunnery} | Pilot: ${pilot.piloting} | 
                Age: ${pilot.age} | Salary: ${formatCurrency(pilot.salary)}/month
            </div>
            <div class="pilot-skills">Morale: ${pilot.morale}% | Loyalty: ${pilot.loyalty}%</div>
            ${pilot.traits.length > 0 ? `<div class="pilot-traits">Traits: ${pilot.traits.join(', ')}</div>` : ''}
            ${pilot.backstory ? `<div class="pilot-backstory">${pilot.backstory}</div>` : ''}
        `;
        
        pilotList.appendChild(pilotDiv);
    });
    
    // Update reputation display with enhanced version
    if (typeof updateReputationDisplay === 'function') {
        updateReputationDisplay();
    } else {
        // Fallback to original reputation display
        const reputationList = document.getElementById('reputation-list');
        if (reputationList) {
            reputationList.innerHTML = '';
            
            Object.entries(gameState.company.reputation).forEach(([faction, rep]) => {
                const repDiv = document.createElement('div');
                repDiv.className = 'stat-line';
                repDiv.innerHTML = `
                    <span>${faction}:</span>
                    <span class="${rep > 25 ? 'text-success' : rep < -25 ? 'text-danger' : ''}">${rep}</span>
                `;
                reputationList.appendChild(repDiv);
            });
        }
    }
}

function updateMechDisplay() {
    const mechList = document.getElementById('mech-list');
    mechList.innerHTML = '';
    
    gameState.mechs.forEach(mech => {
        const mechDiv = document.createElement('div');
        mechDiv.className = 'mech-entry';
        mechDiv.onclick = () => selectMech(mech.id);
        
        const pilot = gameState.pilots.find(p => p.currentMech === mech.id);
        const pilotName = pilot ? (pilot.callsign ? `"${pilot.callsign}" ${pilot.name}` : pilot.name) : 'Unassigned';
        
        // Get condition color
        const conditionClass = mech.condition >= 90 ? 'text-success' : 
                              mech.condition >= 60 ? 'text-warning' : 'text-danger';
        
        // Get weight class color
        const weightClass = mech.weightClass === 'Light' ? 'weight-light' :
                           mech.weightClass === 'Medium' ? 'weight-medium' :
                           mech.weightClass === 'Heavy' ? 'weight-heavy' : 'weight-assault';
        
        mechDiv.innerHTML = `
            <div class="mech-name">${mech.chassis} ${mech.variant}</div>
            <div class="mech-status">
                <span class="${weightClass}">${mech.weightClass}</span> | 
                ${mech.tonnage} tons | BV: ${mech.battleValue} | Move: ${mech.movement}${mech.jumpJets > 0 ? `/${mech.jumpJets}j` : ''}
            </div>
            <div class="mech-status">Pilot: ${pilotName}</div>
            <div class="mech-status">
                Status: ${mech.status} | 
                <span class="${conditionClass}">Condition: ${mech.condition}%</span>
                ${mech.repairCost > 0 ? ` | Repair: ${formatCurrency(mech.repairCost)}` : ''}
            </div>
            <div class="mech-weapons">Weapons: ${mech.weapons.join(', ')}</div>
        `;
        
        mechList.appendChild(mechDiv);
    });
}

function updateContractDisplay() {
    const contractList = document.getElementById('contract-list');
    contractList.innerHTML = '';
    
    gameState.contracts.forEach(contract => {
        const contractDiv = document.createElement('div');
        contractDiv.className = 'contract-entry';
        contractDiv.onclick = () => selectContract(contract.id);
        
        const totalPay = contract.basePayment + contract.bonus;
        
        contractDiv.innerHTML = `
            <div class="contract-name">${contract.name}</div>
            <div class="contract-summary">${contract.employer} - ${contract.type}</div>
            <div class="contract-summary">
                Pay: ${formatCurrency(contract.basePayment)} + ${formatCurrency(contract.bonus)} bonus | 
                <span class="difficulty-${contract.difficulty.toLowerCase()}">${contract.difficulty}</span>
            </div>
            <div class="contract-summary">
                ${contract.planet} | ${contract.duration} days | ${contract.requiredMechs} mechs required
                ${contract.salvageRights ? ' | <span class="text-success">Salvage Rights</span>' : ''}
            </div>
            <div class="contract-description">${contract.description}</div>
            ${contract.riskFactors?.length > 0 ? `<div class="risk-factors">Risks: ${contract.riskFactors.join(', ')}</div>` : ''}
        `;
        
        contractList.appendChild(contractDiv);
    });
}

// Selection Functions
function selectPilot(pilotId) {
    gameState.selectedPilot = pilotId;
    // Update UI to show selection
    document.querySelectorAll('.pilot-entry').forEach(entry => entry.classList.remove('selected'));
    event.target.closest('.pilot-entry').classList.add('selected');
}

function selectMech(mechId) {
    gameState.selectedMech = mechId;
    const mech = gameState.mechs.find(m => m.id === mechId);
    
    // Update UI selection
    document.querySelectorAll('.mech-entry').forEach(entry => entry.classList.remove('selected'));
    event.target.closest('.mech-entry').classList.add('selected');
    
    // Show mech details
    const detailsDiv = document.getElementById('mech-details');
    const pilot = gameState.pilots.find(p => p.currentMech === mechId);
    
    detailsDiv.innerHTML = `
        <h3>${mech.chassis} ${mech.variant}</h3>
        <div class="stat-line"><span>Tonnage:</span><span>${mech.tonnage} tons</span></div>
        <div class="stat-line"><span>Weight Class:</span><span>${mech.weightClass}</span></div>
        <div class="stat-line"><span>Movement:</span><span>${mech.movement}</span></div>
        <div class="stat-line"><span>Pilot:</span><span>${pilot ? pilot.name : 'Unassigned'}</span></div>
        <div class="stat-line"><span>Condition:</span><span>${mech.condition}%</span></div>
        <div class="stat-line"><span>Status:</span><span>${mech.status}</span></div>
        <hr>
        <h4>Weapons:</h4>
        <div>${mech.weapons.join(', ')}</div>
        <hr>
        <div style="margin-top: 15px;">
            <button class="btn btn-sm" onclick="assignPilot()">Assign Pilot</button>
            <button class="btn btn-sm" onclick="repairMech()">Repair</button>
        </div>
    `;
}

function selectContract(contractId) {
    gameState.selectedContract = contractId;
    const contract = gameState.contracts.find(c => c.id === contractId);
    
    // Update UI selection
    document.querySelectorAll('.contract-entry').forEach(entry => entry.classList.remove('selected'));
    event.target.closest('.contract-entry').classList.add('selected');
    
    // Show contract details
    const detailsDiv = document.getElementById('contract-details');
    const totalPay = contract.basePayment + contract.bonus;
    
    const faction = determineFactionFromEmployer(contract.employer);
    const currentRep = gameState.company.reputation[faction] || 0;
    const repLevel = (typeof getReputationLevel === 'function') ? getReputationLevel(currentRep) : { level: 'Unknown', description: 'Reputation unknown' };
    const house = (typeof GREAT_HOUSES !== 'undefined') ? GREAT_HOUSES[faction] : null;
    
    detailsDiv.innerHTML = `
        <h3>${contract.name}</h3>
        <div class="stat-line">
            <span>Employer:</span>
            <span>${contract.employer}${faction !== 'Mercenary' ? ` <span class="faction-tag faction-${faction.toLowerCase()}">${faction}</span>` : ''}</span>
        </div>
        <div class="stat-line"><span>Location:</span><span>${contract.planet}</span></div>
        <div class="stat-line"><span>Type:</span><span>${contract.type}</span></div>
        <div class="stat-line"><span>Difficulty:</span><span class="difficulty-${contract.difficulty.toLowerCase()}">${contract.difficulty}</span></div>
        <div class="stat-line"><span>Duration:</span><span>${contract.duration} days</span></div>
        ${faction !== 'Mercenary' ? `<div class="stat-line"><span>Your Standing:</span><span style="color: ${repLevel.color}" title="${repLevel.description}">${currentRep} (${repLevel.level})</span></div>` : ''}
        <hr>
        <div class="stat-line"><span>Base Payment:</span><span>${formatCurrency(contract.basePayment)}</span></div>
        <div class="stat-line"><span>Success Bonus:</span><span>${formatCurrency(contract.bonus)}</span></div>
        <div class="stat-line"><span>Advance:</span><span>${formatCurrency(contract.advance)}</span></div>
        <div class="stat-line"><span>Salvage Rights:</span><span>${contract.salvageRights ? 'Yes' : 'No'}</span></div>
        <div class="stat-line"><span>Total Potential:</span><span class="text-success">${formatCurrency(totalPay)}</span></div>
        <hr>
        <div class="stat-line"><span>Mechs Required:</span><span>${contract.requiredMechs}</span></div>
        ${house ? `
        <hr>
        <h4>Faction Intelligence:</h4>
        <div class="political-context">
            <strong>${house.fullName}</strong><br>
            Doctrine: ${house.militaryDoctrine}<br>
            Culture: ${house.culture}<br>
            ${house.description.substring(0, 200)}...
        </div>
        ` : ''}
        ${contract.politicalContext ? `
        <hr>
        <h4>Political Context:</h4>
        <div class="political-context">${contract.politicalContext}</div>
        ` : ''}
        <hr>
        <h4>Mission Brief:</h4>
        <p>${contract.description}</p>
        ${contract.riskFactors?.length > 0 ? `
        <hr>
        <h4>Risk Assessment:</h4>
        <ul>${contract.riskFactors.map(risk => `<li>${risk}</li>`).join('')}</ul>
        ` : ''}
        ${contract.specialRequirements?.length > 0 ? `
        <hr>
        <h4>Special Requirements:</h4>
        <ul>${contract.specialRequirements.map(req => `<li>${req}</li>`).join('')}</ul>
        ` : ''}
        ${contract.reputationEffects ? `
        <hr>
        <h4>Reputation Effects:</h4>
        <div class="rep-effects">
            ${contract.reputationEffects.positive?.length > 0 ? `<div>Success: ${contract.reputationEffects.positive.join(', ')}</div>` : ''}
            ${contract.reputationEffects.negative?.length > 0 ? `<div class="text-warning">Risks: ${contract.reputationEffects.negative.join(', ')}</div>` : ''}
        </div>
        ` : ''}
        <hr>
        <div style="margin-top: 15px;">
            <button class="btn btn-primary" onclick="acceptContract()"${currentRep < -40 ? ' title="Reputation too low - contract may be refused"' : ''}>Accept Contract</button>
        </div>
    `;
}

// Action Functions
function hirePilot() {
    if (gameState.company.funds < 5000) {
        alert('Insufficient funds to hire a pilot (5,000 C-Bills required for recruiting costs).');
        return;
    }
    
    // Generate a new pilot
    const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Taylor'];
    const lastNames = ['Steel', 'Wolf', 'Hawk', 'Cross', 'Stone', 'Blake'];
    const callsigns = ['Falcon', 'Viper', 'Thunder', 'Lightning', 'Ghost', 'Reaper'];
    
    const newPilot = {
        id: generateId(),
        name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        callsign: callsigns[Math.floor(Math.random() * callsigns.length)],
        age: 22 + Math.floor(Math.random() * 23),
        gunnery: 3 + Math.floor(Math.random() * 4),
        piloting: 4 + Math.floor(Math.random() * 4),
        tactics: 5 + Math.floor(Math.random() * 4),
        leadership: 6 + Math.floor(Math.random() * 4),
        salary: 4000 + Math.floor(Math.random() * 3000),
        morale: 60 + Math.floor(Math.random() * 30),
        loyalty: 30 + Math.floor(Math.random() * 30),
        traits: Math.random() < 0.3 ? [['Marksman', 'Steady Hands', 'Iron Will'][Math.floor(Math.random() * 3)]] : [],
        currentMech: null,
        injuries: []
    };
    
    if (confirm(`Hire ${newPilot.name} "${newPilot.callsign}"?\n\nSkills: Gun ${newPilot.gunnery}, Pilot ${newPilot.piloting}\nSalary: ${formatCurrency(newPilot.salary)}/month\nHiring Cost: 5,000 C-Bills`)) {
        gameState.pilots.push(newPilot);
        gameState.company.funds -= 5000;
        updateCompanyDisplay();
        updatePilotDisplay();
    }
}

function assignPilot() {
    if (!gameState.selectedMech) {
        alert('No mech selected.');
        return;
    }
    
    const availablePilots = gameState.pilots.filter(p => !p.currentMech);
    if (availablePilots.length === 0) {
        alert('No available pilots. All pilots are already assigned to mechs.');
        return;
    }
    
    // For now, just assign the first available pilot
    const pilot = availablePilots[0];
    pilot.currentMech = gameState.selectedMech;
    
    updateMechDisplay();
    selectMech(gameState.selectedMech); // Refresh details
    alert(`${pilot.name} assigned to mech.`);
}

function repairMech() {
    if (!gameState.selectedMech) {
        alert('No mech selected.');
        return;
    }
    
    const mech = gameState.mechs.find(m => m.id === gameState.selectedMech);
    if (mech.condition >= 100) {
        alert('Mech is already in perfect condition.');
        return;
    }
    
    const repairCost = Math.floor((100 - mech.condition) * mech.tonnage * 50);
    
    if (gameState.company.funds < repairCost) {
        alert(`Insufficient funds for repairs. Cost: ${formatCurrency(repairCost)}`);
        return;
    }
    
    if (confirm(`Repair ${mech.chassis} ${mech.variant}?\n\nCost: ${formatCurrency(repairCost)}\nTime: 3 days`)) {
        gameState.company.funds -= repairCost;
        mech.condition = 100;
        mech.status = 'Operational';
        
        updateCompanyDisplay();
        updateMechDisplay();
        selectMech(gameState.selectedMech); // Refresh details
        alert('Mech repaired successfully!');
    }
}

function refreshContracts() {
    generateContracts();
    updateContractDisplay();
    alert('New contracts available!');
}

function advanceTime() {
    if (confirm('Advance time by 7 days?\n\nThis will:\n• Refresh available contracts\n• Progress any ongoing repairs\n• Consume resources\n\nCannot be undone!')) {
        gameState.time.day += 7;
        if (gameState.time.day > 30) {
            gameState.time.day -= 30;
            gameState.time.month += 1;
            
            // Process monthly events
            const monthlyExpenses = calculateMonthlyExpenses();
            gameState.company.funds -= monthlyExpenses;
            
            if (gameState.time.month > 12) {
                gameState.time.month = 1;
                gameState.time.year += 1;
            }
        }
        
        // Refresh contracts
        generateContracts();
        
        updateCompanyDisplay();
        updateContractDisplay();
        
        alert(`Time advanced! Current date: ${formatDate()}`);
    }
}

function acceptContract() {
    if (!gameState.selectedContract) {
        alert('No contract selected.');
        return;
    }
    
    const contract = gameState.contracts.find(c => c.id === gameState.selectedContract);
    const operationalMechs = gameState.mechs.filter(m => m.condition > 50 && gameState.pilots.find(p => p.currentMech === m.id));
    
    if (operationalMechs.length < contract.requiredMechs) {
        alert(`Insufficient operational mechs. Required: ${contract.requiredMechs}, Available: ${operationalMechs.length}`);
        return;
    }
    
    if (confirm(`Accept "${contract.name}"?\n\nAdvance payment: ${formatCurrency(contract.advance)}\n\nThis will start the mission.`)) {
        gameState.company.funds += contract.advance;
        
        // Start tactical combat
        initializeTacticalCombat(contract, operationalMechs.slice(0, contract.requiredMechs));
        showTacticalCombat();
        
        alert(`Contract accepted! Advance payment of ${formatCurrency(contract.advance)} received.\n\nPreparing for tactical combat...`);
    }
}

// Tactical Combat System
let combatState = {
    currentTurn: 1,
    currentUnitIndex: 0,
    playerUnits: [],
    enemyUnits: [],
    turnOrder: [],
    selectedUnit: null,
    battlefield: null,
    ctx: null
};

function initializeTacticalCombat(contract, playerMechs) {
    console.log('Initializing tactical combat...');
    
    // Set up canvas
    const canvas = document.getElementById('battlefield');
    combatState.ctx = canvas.getContext('2d');
    combatState.battlefield = { width: canvas.width, height: canvas.height };
    
    // Create player units
    combatState.playerUnits = playerMechs.map((mech, index) => ({
        id: mech.id,
        name: mech.chassis + ' ' + mech.variant,
        isPlayer: true,
        x: 100 + index * 60,
        y: 500,
        health: 100,
        maxHealth: 100,
        heat: 0,
        maxHeat: 30,
        movement: mech.movement,
        movementLeft: mech.movement,
        hasActed: false,
        weapons: mech.weapons
    }));
    
    // Create enemy units
    combatState.enemyUnits = [];
    for (let i = 0; i < contract.requiredMechs + 1; i++) {
        combatState.enemyUnits.push({
            id: 'enemy_' + i,
            name: 'Enemy Mech ' + (i + 1),
            isPlayer: false,
            x: 600 + i * 60,
            y: 100,
            health: 80 + Math.floor(Math.random() * 40),
            maxHealth: 100,
            heat: 0,
            maxHeat: 30,
            movement: 4,
            movementLeft: 4,
            hasActed: false,
            weapons: ['Medium Laser', 'SRM-2']
        });
    }
    
    // Create turn order
    combatState.turnOrder = [...combatState.playerUnits, ...combatState.enemyUnits];
    combatState.currentUnitIndex = 0;
    combatState.selectedUnit = combatState.turnOrder[0];
    
    // Draw battlefield
    drawBattlefield();
    updateCombatUI();
    
    addCombatLog('Combat initialized!');
    addCombatLog(`${combatState.selectedUnit.name}'s turn`);
    
    // Set up canvas click handler
    canvas.onclick = handleBattlefieldClick;
}

function drawBattlefield() {
    const ctx = combatState.ctx;
    const canvas = document.getElementById('battlefield');
    
    // Clear battlefield
    ctx.fillStyle = '#001122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw hex grid (simplified)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    for (let x = 50; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 50; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Draw units
    [...combatState.playerUnits, ...combatState.enemyUnits].forEach(unit => {
        if (unit.health <= 0) return;
        
        // Unit circle
        ctx.fillStyle = unit.isPlayer ? '#4a9eff' : '#ff4444';
        ctx.beginPath();
        ctx.arc(unit.x, unit.y, 20, 0, 2 * Math.PI);
        ctx.fill();
        
        // Selected unit highlight
        if (unit === combatState.selectedUnit) {
            ctx.strokeStyle = '#ffff44';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Health bar
        const barWidth = 40;
        const barHeight = 6;
        const healthPercent = unit.health / unit.maxHealth;
        
        ctx.fillStyle = '#444';
        ctx.fillRect(unit.x - barWidth/2, unit.y - 35, barWidth, barHeight);
        
        ctx.fillStyle = healthPercent > 0.5 ? '#4a9eff' : healthPercent > 0.25 ? '#ffc107' : '#ff4444';
        ctx.fillRect(unit.x - barWidth/2, unit.y - 35, barWidth * healthPercent, barHeight);
        
        // Unit name
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(unit.name, unit.x, unit.y + 45);
    });
    
    // Draw movement range for current unit
    if (combatState.selectedUnit && combatState.selectedUnit.movementLeft > 0 && combatState.selectedUnit.isPlayer) {
        ctx.fillStyle = 'rgba(74, 158, 255, 0.2)';
        ctx.strokeStyle = 'rgba(74, 158, 255, 0.5)';
        ctx.lineWidth = 2;
        
        const range = combatState.selectedUnit.movementLeft * 50;
        ctx.beginPath();
        ctx.arc(combatState.selectedUnit.x, combatState.selectedUnit.y, range, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
}

function updateCombatUI() {
    document.getElementById('turn-number').textContent = combatState.currentTurn;
    document.getElementById('current-unit').textContent = combatState.selectedUnit ? combatState.selectedUnit.name : 'None';
    
    if (combatState.selectedUnit) {
        const unit = combatState.selectedUnit;
        document.getElementById('unit-info-title').textContent = unit.name;
        document.getElementById('unit-details').innerHTML = `
            <div class="stat-line">
                <span>Health:</span>
                <span class="${unit.health > 50 ? 'text-success' : unit.health > 25 ? 'text-warning' : 'text-danger'}">${unit.health}/${unit.maxHealth}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill health-bar" style="width: ${(unit.health/unit.maxHealth)*100}%"></div>
            </div>
            <div class="stat-line">
                <span>Heat:</span>
                <span class="${unit.heat < 15 ? 'text-success' : unit.heat < 25 ? 'text-warning' : 'text-danger'}">${unit.heat}/${unit.maxHeat}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill heat-bar" style="width: ${(unit.heat/unit.maxHeat)*100}%"></div>
            </div>
            <div class="stat-line">
                <span>Movement:</span>
                <span>${unit.movementLeft}/${unit.movement}</span>
            </div>
            <div class="stat-line">
                <span>Status:</span>
                <span>${unit.hasActed ? 'Acted' : 'Ready'}</span>
            </div>
            <hr>
            <h4>Weapons:</h4>
            <div>${unit.weapons.join(', ')}</div>
        `;
    }
    
    // Update end turn button
    const endTurnBtn = document.getElementById('end-turn-btn');
    endTurnBtn.disabled = !combatState.selectedUnit || !combatState.selectedUnit.isPlayer;
}

function handleBattlefieldClick(event) {
    const canvas = document.getElementById('battlefield');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    console.log(`Battlefield clicked at: ${x}, ${y}`);
    
    if (!combatState.selectedUnit || !combatState.selectedUnit.isPlayer) return;
    
    // Check if clicking on a unit
    const clickedUnit = [...combatState.playerUnits, ...combatState.enemyUnits].find(unit => {
        const distance = Math.sqrt((x - unit.x) ** 2 + (y - unit.y) ** 2);
        return distance <= 25 && unit.health > 0;
    });
    
    if (clickedUnit) {
        if (clickedUnit.isPlayer) {
            // Select friendly unit
            combatState.selectedUnit = clickedUnit;
            addCombatLog(`Selected: ${clickedUnit.name}`);
        } else {
            // Attack enemy unit
            attackUnit(combatState.selectedUnit, clickedUnit);
        }
    } else {
        // Move to location
        moveUnit(combatState.selectedUnit, x, y);
    }
    
    drawBattlefield();
    updateCombatUI();
}

function moveUnit(unit, targetX, targetY) {
    if (!unit.isPlayer || unit.movementLeft <= 0) return;
    
    const distance = Math.sqrt((targetX - unit.x) ** 2 + (targetY - unit.y) ** 2);
    const movementCost = Math.ceil(distance / 50);
    
    if (movementCost > unit.movementLeft) {
        addCombatLog(`${unit.name}: Not enough movement points!`);
        return;
    }
    
    unit.x = targetX;
    unit.y = targetY;
    unit.movementLeft -= movementCost;
    
    addCombatLog(`${unit.name} moved`);
    
    // Auto-end turn if no movement left and already acted
    if (unit.movementLeft <= 0 && unit.hasActed) {
        endTurn();
    }
}

function attackUnit(attacker, target) {
    if (!attacker.isPlayer || attacker.hasActed) return;
    
    const distance = Math.sqrt((target.x - attacker.x) ** 2 + (target.y - attacker.y) ** 2);
    const maxRange = 200; // Simplified range
    
    if (distance > maxRange) {
        addCombatLog(`${attacker.name}: Target out of range!`);
        return;
    }
    
    attacker.hasActed = true;
    attacker.heat += 5;
    
    // Simple hit calculation
    const hitChance = 0.7 - (distance / 1000);
    const hit = Math.random() < hitChance;
    
    if (hit) {
        const damage = 10 + Math.floor(Math.random() * 15);
        target.health -= damage;
        target.health = Math.max(0, target.health);
        
        addCombatLog(`${attacker.name} hits ${target.name} for ${damage} damage!`, 'damage');
        
        if (target.health <= 0) {
            addCombatLog(`${target.name} destroyed!`, 'important');
        }
    } else {
        addCombatLog(`${attacker.name} misses ${target.name}`);
    }
    
    // Check victory conditions
    checkCombatEnd();
    
    // Auto-end turn
    if (attacker.movementLeft <= 0) {
        endTurn();
    }
}

function endTurn() {
    if (combatState.selectedUnit) {
        // Reset unit for next turn
        const unit = combatState.selectedUnit;
        unit.movementLeft = unit.movement;
        unit.hasActed = false;
        unit.heat = Math.max(0, unit.heat - 5); // Cool down
    }
    
    // Next unit
    combatState.currentUnitIndex++;
    if (combatState.currentUnitIndex >= combatState.turnOrder.length) {
        combatState.currentUnitIndex = 0;
        combatState.currentTurn++;
    }
    
    // Skip destroyed units
    while (combatState.turnOrder[combatState.currentUnitIndex].health <= 0) {
        combatState.currentUnitIndex++;
        if (combatState.currentUnitIndex >= combatState.turnOrder.length) {
            combatState.currentUnitIndex = 0;
            combatState.currentTurn++;
        }
    }
    
    combatState.selectedUnit = combatState.turnOrder[combatState.currentUnitIndex];
    
    addCombatLog(`${combatState.selectedUnit.name}'s turn`);
    
    // AI turn
    if (!combatState.selectedUnit.isPlayer) {
        setTimeout(processAITurn, 1000);
    }
    
    drawBattlefield();
    updateCombatUI();
}

function processAITurn() {
    const aiUnit = combatState.selectedUnit;
    
    // Simple AI: Find nearest player unit and attack
    let nearestTarget = null;
    let nearestDistance = Infinity;
    
    combatState.playerUnits.forEach(unit => {
        if (unit.health <= 0) return;
        
        const distance = Math.sqrt((unit.x - aiUnit.x) ** 2 + (unit.y - aiUnit.y) ** 2);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestTarget = unit;
        }
    });
    
    if (nearestTarget) {
        // Move closer if needed
        if (nearestDistance > 200 && aiUnit.movementLeft > 0) {
            const moveX = aiUnit.x + (nearestTarget.x - aiUnit.x) * 0.3;
            const moveY = aiUnit.y + (nearestTarget.y - aiUnit.y) * 0.3;
            
            aiUnit.x = moveX;
            aiUnit.y = moveY;
            aiUnit.movementLeft = 0;
            
            addCombatLog(`${aiUnit.name} moves closer`);
        }
        
        // Attack if in range
        const finalDistance = Math.sqrt((nearestTarget.x - aiUnit.x) ** 2 + (nearestTarget.y - aiUnit.y) ** 2);
        if (finalDistance <= 200) {
            attackUnit(aiUnit, nearestTarget);
        }
    }
    
    // End AI turn
    setTimeout(() => {
        endTurn();
    }, 500);
}

function checkCombatEnd() {
    const alivePlayerUnits = combatState.playerUnits.filter(u => u.health > 0);
    const aliveEnemyUnits = combatState.enemyUnits.filter(u => u.health > 0);
    
    if (alivePlayerUnits.length === 0) {
        endCombat(false);
    } else if (aliveEnemyUnits.length === 0) {
        endCombat(true);
    }
}

function endCombat(victory) {
    const resultText = victory ? 'VICTORY!' : 'DEFEAT!';
    addCombatLog(`Combat ended - ${resultText}`, 'important');
    
    setTimeout(() => {
        alert(`Combat Complete!\n\n${resultText}\n\nReturning to company management...`);
        showCompanyOverview();
        
        // TODO: Process combat results, pilot experience, mech damage, etc.
        if (victory) {
            gameState.company.funds += 50000; // Simple reward
            updateCompanyDisplay();
        }
    }, 1000);
}

function exitCombat() {
    if (confirm('Exit combat? This will forfeit the mission.')) {
        showCompanyOverview();
    }
}

function addCombatLog(message, type = '') {
    const logDiv = document.getElementById('combat-log');
    const entryDiv = document.createElement('div');
    entryDiv.className = `log-entry ${type}`;
    entryDiv.textContent = `[${combatState.currentTurn}] ${message}`;
    logDiv.appendChild(entryDiv);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// Utility Functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat().format(amount) + ' C-Bills';
}

function formatDate() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[gameState.time.month - 1]} ${gameState.time.day}, ${gameState.time.year}`;
}

function calculateCompanyRating() {
    // Use MRBC system if available, otherwise fallback to original
    if (typeof MRBC_SYSTEM !== 'undefined' && MRBC_SYSTEM.calculateCompanyRating) {
        const rating = MRBC_SYSTEM.calculateCompanyRating(gameState);
        gameState.company.mrbcRating = rating;
        return rating;
    }
    
    // Original system as fallback
    const totalPilots = gameState.pilots.length;
    const avgGunnery = gameState.pilots.reduce((sum, p) => sum + p.gunnery, 0) / totalPilots;
    
    if (totalPilots >= 12 && avgGunnery <= 3) return 'Elite';
    if (totalPilots >= 8 && avgGunnery <= 4) return 'Veteran';
    if (totalPilots >= 4 && avgGunnery <= 5) return 'Regular';
    return 'Green';
}

function calculateMonthlyExpenses() {
    let total = 0;
    
    // Pilot salaries
    gameState.pilots.forEach(pilot => {
        total += pilot.salary || 0;
    });
    
    // Mech maintenance - use new maintenanceCost if available, otherwise fallback
    gameState.mechs.forEach(mech => {
        total += mech.maintenanceCost || (mech.tonnage * 150);
    });
    
    // Base operating costs (facilities, support staff, etc.)
    const baseOperatingCosts = 30000 + (gameState.pilots.length * 2000); // Scales with company size
    total += baseOperatingCosts;
    
    return total;
}

// Enhanced faction system integration functions
function determineFactionFromEmployer(employer) {
    if (employer.includes('Lyran') || employer.includes('Steiner')) return 'Steiner';
    if (employer.includes('Davion') || employer.includes('Federated')) return 'Davion';
    if (employer.includes('Liao') || employer.includes('Capellan') || employer.includes('Maskirovka')) return 'Liao';
    if (employer.includes('Marik') || employer.includes('Free Worlds')) return 'Marik';
    if (employer.includes('Kurita') || employer.includes('Draconis')) return 'Kurita';
    return 'Mercenary';
}

function generatePoliticalBriefing(employer, difficulty) {
    const faction = determineFactionFromEmployer(employer);
    
    // Use faction system if available
    if (typeof GREAT_HOUSES !== 'undefined') {
        const house = GREAT_HOUSES[faction];
        
        if (house) {
            const briefings = [
                `Intelligence Brief: ${house.fullName} military doctrine emphasizes ${house.militaryDoctrine.toLowerCase()}. Expect operations consistent with this approach.`,
                `Political Context: Current tensions with rival factions may affect mission parameters and local security.`,
                `Strategic Note: This operation supports ${house.fullName}'s broader military objectives in the region.`,
                `Cultural Advisory: ${house.culture} influences local military customs and operational expectations.`
            ];
            
            return briefings[Math.floor(Math.random() * briefings.length)];
        }
    }
    
    return 'Standard mercenary operation in politically neutral territory.';
}

function getRandomEnemyFaction(faction) {
    if (typeof GREAT_HOUSES !== 'undefined') {
        const house = GREAT_HOUSES[faction];
        if (house && house.relationshipModifiers) {
            const enemies = Object.keys(house.relationshipModifiers)
                .filter(f => f !== 'Mercenary' && house.relationshipModifiers[f] < -20);
            
            if (enemies.length > 0) {
                const enemyFaction = enemies[Math.floor(Math.random() * enemies.length)];
                return GREAT_HOUSES[enemyFaction] ? GREAT_HOUSES[enemyFaction].fullName : enemyFaction;
            }
        }
    }
    
    return 'rival factions';
}

// Enhanced reputation display
function updateReputationDisplay() {
    const reputationList = document.getElementById('reputation-list');
    if (reputationList && typeof getReputationLevel === 'function') {
        reputationList.innerHTML = '';
        
        Object.entries(gameState.company.reputation).forEach(([faction, rep]) => {
            const repLevel = getReputationLevel(rep);
            const repDiv = document.createElement('div');
            repDiv.className = 'stat-line';
            repDiv.innerHTML = `
                <span>${faction}:</span>
                <span style="color: ${repLevel.color}" title="${repLevel.description}">${rep} (${repLevel.level})</span>
            `;
            reputationList.appendChild(repDiv);
        });
        
        // Add MRBC rating if available
        if (gameState.company.mrbcRating) {
            const mrbcDiv = document.createElement('div');
            mrbcDiv.className = 'stat-line';
            mrbcDiv.innerHTML = `
                <span><strong>MRBC Rating:</strong></span>
                <span class="mrbc-rating">${gameState.company.mrbcRating}</span>
            `;
            reputationList.appendChild(mrbcDiv);
        }
    }
}

// Enhanced contract display with political context
function updateContractDisplayEnhanced() {
    const contractList = document.getElementById('contract-list');
    contractList.innerHTML = '';
    
    gameState.contracts.forEach(contract => {
        const contractDiv = document.createElement('div');
        const faction = determineFactionFromEmployer(contract.employer);
        contractDiv.className = `contract-entry${faction !== 'Mercenary' ? ` faction-${faction.toLowerCase()}` : ''}`;
        contractDiv.onclick = () => selectContract(contract.id);
        
        const totalPay = contract.basePayment + contract.bonus;
        const currentRep = gameState.company.reputation[faction] || 0;
        
        contractDiv.innerHTML = `
            <div class="contract-name">${contract.name}</div>
            <div class="contract-summary">
                ${contract.employer} - ${contract.type}
                ${faction !== 'Mercenary' ? `<span class="faction-tag faction-${faction.toLowerCase()}">${faction}</span>` : ''}
            </div>
            <div class="contract-summary">
                Pay: ${formatCurrency(contract.basePayment)} + ${formatCurrency(contract.bonus)} bonus | 
                <span class="difficulty-${contract.difficulty.toLowerCase()}">${contract.difficulty}</span>
                ${currentRep < 0 ? '<span class="rep-warning"> (Reputation Risk)</span>' : ''}
            </div>
            <div class="contract-summary">
                ${contract.planet} | ${contract.duration} days | ${contract.requiredMechs} mechs required
                ${contract.salvageRights ? ' | <span class="text-success">Salvage Rights</span>' : ''}
            </div>
            <div class="contract-description">${contract.description}</div>
            ${contract.politicalContext ? `<div class="political-context">${contract.politicalContext}</div>` : ''}
            ${contract.riskFactors?.length > 0 ? `<div class="risk-factors">Risks: ${contract.riskFactors.join(', ')}</div>` : ''}
        `;
        
        contractList.appendChild(contractDiv);
    });
}

// Override original contract display if enhanced version is available
function updateContractDisplay() {
    if (typeof updateContractDisplayEnhanced === 'function') {
        updateContractDisplayEnhanced();
    } else {
        // Original implementation remains as fallback
        const contractList = document.getElementById('contract-list');
        contractList.innerHTML = '';
        
        gameState.contracts.forEach(contract => {
            const contractDiv = document.createElement('div');
            contractDiv.className = 'contract-entry';
            contractDiv.onclick = () => selectContract(contract.id);
            
            contractDiv.innerHTML = `
                <div class="contract-name">${contract.name}</div>
                <div class="contract-summary">${contract.employer} - ${contract.type}</div>
                <div class="contract-summary">
                    Pay: ${formatCurrency(contract.basePayment)} + ${formatCurrency(contract.bonus)} bonus | 
                    <span class="difficulty-${contract.difficulty.toLowerCase()}">${contract.difficulty}</span>
                </div>
            `;
            
            contractList.appendChild(contractDiv);
        });
    }
}

console.log('Battletech Mercenary Command game script loaded successfully!');