// BattleTech Faction & Reputation System
// Deep lore integration for the Inner Sphere political landscape of 3025

// ===== GREAT HOUSES DATA =====

const GREAT_HOUSES = {
    'Steiner': {
        fullName: 'Lyran Commonwealth',
        ruler: 'Archon Katrina Steiner',
        capital: 'Tharkad',
        government: 'Constitutional Monarchy',
        culture: 'Industrial Efficiency',
        militaryDoctrine: 'Technology Supremacy',
        colors: ['Blue', 'White'],
        description: `The Lyran Commonwealth stands as the industrial powerhouse of the Inner Sphere. 
        Under Archon Katrina Steiner's rule, the realm prioritizes technological advancement and 
        overwhelming firepower over tactical finesse. The Commonwealth's vast industrial complexes 
        on worlds like Hesperus II and Coventry produce some of the finest BattleMechs in known space.`,
        
        strengths: [
            'Advanced technology and manufacturing capabilities',
            'Wealthy industrial base with superior logistics',
            'Elite Steiner Guards regiments with cutting-edge equipment',
            'Strong ties with mercenary units like the Wolf\'s Dragoons'
        ],
        
        weaknesses: [
            'Tactical doctrine often relies on brute force over finesse',
            'Political intrigue from ambitious nobles',
            'Stretched supply lines across vast territories',
            'Overconfidence in technological solutions'
        ],
        
        majorWorlds: [
            { name: 'Tharkad', type: 'Capital', importance: 'Political center, Royal court' },
            { name: 'Hesperus II', type: 'Industrial', importance: 'Primary BattleMech production' },
            { name: 'Coventry', type: 'Industrial', importance: 'Weapons manufacturing hub' },
            { name: 'Solaris VII', type: 'Entertainment', importance: 'Gladiatorial games, mercenary recruitment' },
            { name: 'Arc-Royal', type: 'Military', importance: 'Wolf\'s Dragoons base of operations' }
        ],
        
        military: {
            doctrine: 'Overwhelming technological superiority and firepower concentration',
            eliteUnits: ['Steiner Guards', 'Lyran Guards', 'Donegal Guards'],
            preferredMechs: ['Atlas', 'Banshee', 'Zeus', 'Thunderbolt'],
            specialization: 'Heavy and Assault mechs with advanced technology'
        },
        
        relationshipModifiers: {
            'Davion': -20, // Historical rivalry, but current cold peace
            'Liao': -30,   // Border tensions and territorial disputes
            'Marik': -10,  // Neutral but competitive
            'Kurita': -40, // Deep-seated enmity from succession wars
            'Mercenary': 15 // Generally favorable to mercenaries
        }
    },
    
    'Davion': {
        fullName: 'Federated Suns',
        ruler: 'Prince Hanse Davion',
        capital: 'New Avalon',
        government: 'Feudal Monarchy',
        culture: 'Military Excellence',
        militaryDoctrine: 'Combined Arms Mastery',
        colors: ['Red', 'Gold'],
        description: `The Federated Suns epitomizes military professionalism under Prince Hanse Davion's 
        strategic leadership. Home to the prestigious New Avalon Institute of Science, the realm 
        balances military might with technological innovation. The Davion Guards represent the 
        pinnacle of Inner Sphere military doctrine and training.`,
        
        strengths: [
            'Superior military training and officer education',
            'New Avalon Institute of Science for R&D',
            'Disciplined combined arms tactics',
            'Strong intelligence network (MIIO)',
            'Excellent mercenary relationships'
        ],
        
        weaknesses: [
            'Constant pressure from Capellan raids',
            'Resource constraints compared to Lyran wealth',
            'Stretched defenses across multiple fronts',
            'Reliance on aging Star League technology'
        ],
        
        majorWorlds: [
            { name: 'New Avalon', type: 'Capital', importance: 'Political center, NAIS headquarters' },
            { name: 'New Syrtis', type: 'Military', importance: 'Regional capital, Capellan March' },
            { name: 'Robinson', type: 'Military', importance: 'Draconis March capital, border fortress' },
            { name: 'Panpour', type: 'Industrial', importance: 'Secondary manufacturing center' },
            { name: 'Kathil', type: 'Military', importance: 'War College, military academy' }
        ],
        
        military: {
            doctrine: 'Combined arms coordination with emphasis on mobility and intelligence',
            eliteUnits: ['Davion Guards', 'New Avalon Hussars', 'Crucis Lancers'],
            preferredMechs: ['JagerMech', 'Rifleman', 'Wolverine', 'Centurion'],
            specialization: 'Balanced forces with superior tactical coordination'
        },
        
        relationshipModifiers: {
            'Steiner': -20, // Traditional rivalry, recent cooling
            'Liao': -50,    // Bitter enemies, constant warfare
            'Marik': -25,   // Territorial disputes and raids
            'Kurita': -35,  // Long-standing conflict
            'Mercenary': 20 // Excellent mercenary relationships
        }
    },
    
    'Liao': {
        fullName: 'Capellan Confederation',
        ruler: 'Chancellor Maximilian Liao',
        capital: 'Sian',
        government: 'Centralized Autocracy',
        culture: 'Political Intrigue',
        militaryDoctrine: 'Asymmetric Warfare',
        colors: ['Green', 'Black'],
        description: `The Capellan Confederation, smallest of the Great Houses, survives through cunning, 
        espionage, and ruthless political maneuvering. Chancellor Maximilian Liao's erratic leadership 
        masks the deadly efficiency of the Maskirovka secret service. What they lack in resources, 
        they compensate with guile and unconventional tactics.`,
        
        strengths: [
            'Maskirovka intelligence network',
            'Warrior Lodge infiltration capabilities',
            'Unconventional warfare expertise',
            'Political manipulation and espionage',
            'Desperate but innovative tactics'
        ],
        
        weaknesses: [
            'Smallest military of the Great Houses',
            'Limited industrial capacity',
            'Internal political instability',
            'Surrounded by hostile neighbors',
            'Aging and outdated equipment'
        ],
        
        majorWorlds: [
            { name: 'Sian', type: 'Capital', importance: 'Political center, Maskirovka headquarters' },
            { name: 'Capella', type: 'Cultural', importance: 'Historical heart of Confederation' },
            { name: 'St. Ives', type: 'Industrial', importance: 'Manufacturing and shipping hub' },
            { name: 'Menke', type: 'Military', importance: 'Border fortress world' },
            { name: 'Tikonov', type: 'Strategic', importance: 'Recently lost to Davion forces' }
        ],
        
        military: {
            doctrine: 'Guerrilla warfare, espionage, and psychological operations',
            eliteUnits: ['Capellan Guards', 'Warrior Lodge', 'Death Commandos'],
            preferredMechs: ['Catapult', 'Centurion', 'Vindicator', 'Raven'],
            specialization: 'Stealth, electronic warfare, and rapid strikes'
        },
        
        relationshipModifiers: {
            'Steiner': -30, // Border tensions and resource competition
            'Davion': -50,  // Bitter enemies, recent territorial losses
            'Marik': 10,    // Occasional alliance of convenience
            'Kurita': 5,    // Limited cooperation against common foes
            'Mercenary': -10 // Distrustful, but occasionally hiring
        }
    },
    
    'Marik': {
        fullName: 'Free Worlds League',
        ruler: 'Captain-General Janos Marik',
        capital: 'Atreus',
        government: 'Federal Parliamentary',
        culture: 'Political Fragmentation',
        militaryDoctrine: 'Mercenary Reliance',
        colors: ['Purple', 'White'],
        description: `The Free Worlds League struggles with chronic political fragmentation under 
        Captain-General Janos Marik's tenuous leadership. Provincial rivalries and mercenary 
        dependencies define this fractured realm. Despite internal divisions, member states 
        maintain fierce independence and surprising military capabilities when unified.`,
        
        strengths: [
            'Extensive mercenary relationships',
            'Industrial diversity across member states',
            'Political flexibility and adaptability',
            'Independent provincial military forces',
            'Strategic position in Inner Sphere center'
        ],
        
        weaknesses: [
            'Chronic political instability',
            'Fractured military command structure',
            'Provincial rivalries and infighting',
            'Over-reliance on mercenary forces',
            'Inconsistent military doctrine'
        ],
        
        majorWorlds: [
            { name: 'Atreus', type: 'Capital', importance: 'Parliamentary seat, military headquarters' },
            { name: 'Oriente', type: 'Provincial', importance: 'Oriente Protectorate capital' },
            { name: 'Regulus', type: 'Provincial', importance: 'Marik-Stewart Commonwealth center' },
            { name: 'Andurien', type: 'Provincial', importance: 'Duchy of Andurien capital' },
            { name: 'Irian', type: 'Industrial', importance: 'BattleMech manufacturing' }
        ],
        
        military: {
            doctrine: 'Mercenary augmented provincial forces with flexible tactics',
            eliteUnits: ['Marik Guards', 'Knights of the Inner Sphere', 'Free Worlds Guards'],
            preferredMechs: ['Orion', 'Centurion', 'Griffin', 'Shadow Hawk'],
            specialization: 'Mixed technology and mercenary coordination'
        },
        
        relationshipModifiers: {
            'Steiner': -10, // Neutral competition
            'Davion': -25,  // Territorial disputes
            'Liao': 10,     // Occasional cooperation
            'Kurita': -5,   // Limited conflict
            'Mercenary': 25 // Heavily dependent on mercenaries
        }
    },
    
    'Kurita': {
        fullName: 'Draconis Combine',
        ruler: 'Coordinator Takashi Kurita',
        capital: 'Luthien',
        government: 'Absolute Monarchy',
        culture: 'Bushido Honor',
        militaryDoctrine: 'Disciplined Formation',
        colors: ['Red', 'Black'],
        description: `The Draconis Combine maintains strict adherence to Bushido principles under 
        Coordinator Takashi Kurita's iron rule. This martial culture produces disciplined 
        warriors and rigid military hierarchy. The DCMS represents the most traditional and 
        honor-bound military force in the Inner Sphere.`,
        
        strengths: [
            'Rigid military discipline and loyalty',
            'Bushido warrior tradition',
            'Excellent unit cohesion and morale',
            'ISF intelligence service',
            'Strong defensive positions'
        ],
        
        weaknesses: [
            'Inflexible military doctrine',
            'Honor-bound tactical limitations',
            'Internal political tensions',
            'Technological stagnation',
            'Costly honor duels and traditions'
        ],
        
        majorWorlds: [
            { name: 'Luthien', type: 'Capital', importance: 'Imperial seat, cultural center' },
            { name: 'Dieron', type: 'Military', importance: 'District capital, fortress world' },
            { name: 'Algedi', type: 'Industrial', importance: 'Manufacturing and shipyards' },
            { name: 'Proserpina', type: 'Military', importance: 'Regional military command' },
            { name: 'Buckminster', type: 'Strategic', importance: 'Border defense fortress' }
        ],
        
        military: {
            doctrine: 'Honorable combat with disciplined formation tactics',
            eliteUnits: ['Sword of Light', 'Genyosha', 'Ryuken'],
            preferredMechs: ['Dragon', 'Quickdraw', 'Panther', 'Catapult'],
            specialization: 'Close combat and disciplined unit tactics'
        },
        
        relationshipModifiers: {
            'Steiner': -40, // Historical enemies
            'Davion': -35,  // Long territorial conflict
            'Liao': 5,      // Limited cooperation
            'Marik': -5,    // Minimal contact
            'Mercenary': -15 // Dishonorable gaijin mercenaries
        }
    }
};

// ===== MERCENARY UNITS DATABASE =====

const FAMOUS_MERCENARY_UNITS = {
    'Wolf\'s Dragoons': {
        rating: 'A',
        specialty: 'Combined Arms Excellence',
        homeBase: 'Arc-Royal (Lyran Commonwealth)',
        strength: 'Regiment+',
        reputation: 'Legendary',
        founded: '3005',
        commander: 'Colonel Jaime Wolf',
        description: `The most prestigious mercenary unit in the Inner Sphere. Known for their 
        mysterious origins and unparalleled combat effectiveness. Currently under exclusive 
        contract with the Lyran Commonwealth.`,
        notable: 'Suspected of Clan origins, superior technology and training',
        contractPreference: ['Steiner'],
        averageContract: 2000000, // 2 million C-Bills
        ratingModifier: 50
    },
    
    'Gray Death Legion': {
        rating: 'A',
        specialty: 'Reconnaissance and Raids',
        homeBase: 'Glengarry',
        strength: 'Reinforced Battalion',
        reputation: 'Elite',
        founded: '3024',
        commander: 'Colonel Grayson Death Carlyle',
        description: `Rising star mercenary unit known for innovative tactics and technological 
        discoveries. Recently discovered Star League memory core technology.`,
        notable: 'Inventors of combined-arms coordination tactics',
        contractPreference: ['Any'],
        averageContract: 800000, // 800k C-Bills
        ratingModifier: 35
    },
    
    'McCarron\'s Armored Cavalry': {
        rating: 'B',
        specialty: 'Armor Tactics',
        homeBase: 'Menke (Capellan Confederation)',
        strength: 'Regiment',
        reputation: 'Reliable',
        founded: '2920',
        commander: 'Colonel Archibald McCarron',
        description: `Long-serving mercenary regiment with strong ties to the Capellan Confederation. 
        Specialists in combined BattleMech and conventional armor operations.`,
        notable: 'Exclusive Capellan contracts, family dynasty leadership',
        contractPreference: ['Liao'],
        averageContract: 600000, // 600k C-Bills
        ratingModifier: 25
    },
    
    'Northwind Highlanders': {
        rating: 'B',
        specialty: 'Defensive Operations',
        homeBase: 'Northwind',
        strength: 'Regiment',
        reputation: 'Honorable',
        founded: 'Star League Era',
        commander: 'Colonel William MacLeod',
        description: `Ancient mercenary unit with strong Scottish traditions. Known for defensive 
        expertise and unwavering honor codes.`,
        notable: 'Celtic traditions, bagpipe-playing warriors',
        contractPreference: ['Steiner', 'Davion'],
        averageContract: 500000, // 500k C-Bills
        ratingModifier: 20
    },
    
    'Waco Rangers': {
        rating: 'C',
        specialty: 'Rapid Deployment',
        homeBase: 'Mobile',
        strength: 'Battalion',
        reputation: 'Competent',
        founded: '3006',
        commander: 'Colonel Wayne Waco',
        description: `Fast-moving mercenary battalion specializing in rapid deployment and hit-and-run 
        tactics. Known for mobility and flexible operations.`,
        notable: 'All-hover vehicle support, rapid deployment specialists',
        contractPreference: ['Any'],
        averageContract: 300000, // 300k C-Bills
        ratingModifier: 10
    }
};

// ===== INNER SPHERE WORLDS AND STRATEGIC LOCATIONS =====

const INNER_SPHERE_WORLDS = {
    // Lyran Commonwealth Major Worlds
    'Tharkad': {
        faction: 'Steiner',
        type: 'Capital',
        population: 'Billions',
        industry: 'Government, Light Manufacturing',
        strategic: 'Political Center',
        defenses: 'Heavy - Royal Guards',
        jumpPoints: 'Multiple',
        description: 'Ice-bound capital world of the Lyran Commonwealth. Center of political power and aristocratic intrigue.',
        contractTypes: ['Garrison Duty', 'VIP Escort', 'Corporate Security']
    },
    
    'Hesperus II': {
        faction: 'Steiner',
        type: 'Industrial',
        population: 'Hundreds of Millions',
        industry: 'BattleMech Manufacturing',
        strategic: 'Critical Industrial Asset',
        defenses: 'Fortress - Hesperus Guards',
        jumpPoints: 'Secured',
        description: 'Premier BattleMech manufacturing world. Home to advanced Steiner production facilities.',
        contractTypes: ['Industrial Security', 'Anti-Sabotage', 'Convoy Escort']
    },
    
    'Solaris VII': {
        faction: 'Steiner',
        type: 'Entertainment',
        population: 'Millions',
        industry: 'Gaming, Entertainment',
        strategic: 'Mercenary Recruitment Hub',
        defenses: 'Light - Police Forces',
        jumpPoints: 'Open',
        description: 'The Game World - center of gladiatorial BattleMech combat and mercenary hiring.',
        contractTypes: ['Gladiator Matches', 'Security Escort', 'Anti-Crime']
    },
    
    // Federated Suns Major Worlds
    'New Avalon': {
        faction: 'Davion',
        type: 'Capital',
        population: 'Billions',
        industry: 'Government, Research',
        strategic: 'Political and Scientific Center',
        defenses: 'Fortress - Davion Guards',
        jumpPoints: 'Multiple Secured',
        description: 'Capital of the Federated Suns. Home to NAIS and center of military innovation.',
        contractTypes: ['Garrison Duty', 'Research Security', 'Honor Guard']
    },
    
    'Robinson': {
        faction: 'Davion',
        type: 'Military',
        population: 'Tens of Millions',
        industry: 'Military Equipment',
        strategic: 'Border Fortress',
        defenses: 'Heavy - Robinson Rangers',
        jumpPoints: 'Fortified',
        description: 'Capital of the Draconis March. Primary fortress world facing Kurita aggression.',
        contractTypes: ['Border Patrol', 'Reconnaissance', 'Defensive Operations']
    },
    
    // Capellan Confederation Major Worlds
    'Sian': {
        faction: 'Liao',
        type: 'Capital',
        population: 'Hundreds of Millions',
        industry: 'Government, Espionage',
        strategic: 'Political Center',
        defenses: 'Heavy - Capellan Guards',
        jumpPoints: 'Secured',
        description: 'Capellan capital world. Center of Maskirovka operations and political intrigue.',
        contractTypes: ['Counter-Intelligence', 'Political Security', 'Stealth Operations']
    },
    
    // Free Worlds League Major Worlds
    'Atreus': {
        faction: 'Marik',
        type: 'Capital',
        population: 'Hundreds of Millions',
        industry: 'Government, Light Manufacturing',
        strategic: 'Political Center',
        defenses: 'Moderate - Free Worlds Guards',
        jumpPoints: 'Open',
        description: 'Parliamentary capital of the Free Worlds League. Center of fractious political debates.',
        contractTypes: ['Parliamentary Security', 'Provincial Mediation', 'Garrison Duty']
    },
    
    // Draconis Combine Major Worlds
    'Luthien': {
        faction: 'Kurita',
        type: 'Capital',
        population: 'Billions',
        industry: 'Government, Traditional Crafts',
        strategic: 'Cultural and Political Center',
        defenses: 'Fortress - Imperial Guards',
        jumpPoints: 'Multiple Secured',
        description: 'Imperial capital of the Draconis Combine. Heart of Bushido culture and military tradition.',
        contractTypes: ['Honor Guard', 'Ceremonial Duty', 'Traditional Combat']
    },
    
    // Periphery and Border Worlds
    'Galatea': {
        faction: 'Independent',
        type: 'Mercenary Hub',
        population: 'Millions',
        industry: 'Mercenary Services',
        strategic: 'Hiring Hall Central',
        defenses: 'Light - Mercenary Units',
        jumpPoints: 'Open',
        description: 'The Mercenary Star - primary hiring hall and coordination center for mercenary units.',
        contractTypes: ['All Types', 'Mercenary Coordination', 'Hiring Hall']
    }
};

// ===== POLITICAL EVENTS AND TIMELINE INTEGRATION (3025) =====

const POLITICAL_CONTEXT_3025 = {
    currentEvents: [
        {
            event: 'Fourth Succession War Buildup',
            description: 'Tensions escalating across the Inner Sphere as the Great Houses prepare for renewed conflict.',
            affectedFactions: ['All'],
            impact: 'Increased military contracts and mercenary demand'
        },
        {
            event: 'Hanse-Melissa Engagement',
            description: 'Secret betrothal between Prince Hanse Davion and Melissa Steiner creates potential Lyran-Davion alliance.',
            affectedFactions: ['Steiner', 'Davion'],
            impact: 'Improved Steiner-Davion relations, concerns other Houses'
        },
        {
            event: 'Wolf\'s Dragoons on Solaris',
            description: 'Mysterious elite mercenaries demonstrate superior technology and tactics on the Game World.',
            affectedFactions: ['Steiner'],
            impact: 'Increased mercenary recruitment and technological speculation'
        },
        {
            event: 'Capellan Confederation Struggles',
            description: 'Maximilian Liao\'s erratic leadership creates instability and territorial losses.',
            affectedFactions: ['Liao', 'Davion'],
            impact: 'Desperate Capellan contracts, Davion expansion opportunities'
        }
    ],
    
    activeConflicts: [
        {
            name: 'Steiner-Kurita Border Raids',
            participants: ['Steiner', 'Kurita'],
            intensity: 'Low',
            description: 'Ongoing skirmishes along the Lyran-Kurita border'
        },
        {
            name: 'Davion-Liao Territorial Disputes',
            participants: ['Davion', 'Liao'],
            intensity: 'Medium',
            description: 'Federated Suns pressure on weakened Capellan worlds'
        },
        {
            name: 'Free Worlds Internal Conflicts',
            participants: ['Marik'],
            intensity: 'Low',
            description: 'Provincial rivalries and succession disputes'
        }
    ],
    
    mercenaryMarket: {
        demand: 'High',
        primaryEmployers: ['Steiner', 'Davion', 'Liao'],
        averageContractValue: 500000,
        riskLevel: 'Moderate',
        description: 'Growing tensions create strong mercenary market with increasing contract values'
    }
};

// ===== REPUTATION SYSTEM FUNCTIONS =====

function getReputationLevel(reputationValue) {
    if (reputationValue >= 80) return { level: 'Legendary', color: 'gold', description: 'Renowned throughout the Inner Sphere' };
    if (reputationValue >= 60) return { level: 'Excellent', color: 'green', description: 'Highly trusted and respected' };
    if (reputationValue >= 40) return { level: 'Good', color: 'lightgreen', description: 'Well-regarded and reliable' };
    if (reputationValue >= 20) return { level: 'Neutral', color: 'yellow', description: 'Known but unremarkable' };
    if (reputationValue >= 0) return { level: 'Poor', color: 'orange', description: 'Questionable reliability' };
    if (reputationValue >= -20) return { level: 'Bad', color: 'red', description: 'Untrustworthy and unreliable' };
    return { level: 'Hostile', color: 'darkred', description: 'Active enemy of the faction' };
}

function calculateContractModifier(faction, reputation) {
    const baseRep = reputation || 0;
    
    // Reputation affects contract availability and payment
    let availabilityModifier = 1.0;
    let paymentModifier = 1.0;
    
    if (baseRep >= 60) {
        availabilityModifier = 1.5; // More contracts available
        paymentModifier = 1.3; // 30% bonus payment
    } else if (baseRep >= 40) {
        availabilityModifier = 1.2;
        paymentModifier = 1.15; // 15% bonus
    } else if (baseRep >= 20) {
        availabilityModifier = 1.0;
        paymentModifier = 1.0; // Standard
    } else if (baseRep >= 0) {
        availabilityModifier = 0.8;
        paymentModifier = 0.9; // 10% penalty
    } else if (baseRep >= -20) {
        availabilityModifier = 0.5;
        paymentModifier = 0.8; // 20% penalty
    } else {
        availabilityModifier = 0.2; // Very few contracts
        paymentModifier = 0.7; // 30% penalty
    }
    
    return { availabilityModifier, paymentModifier };
}

function generateFactionSpecificContract(faction, reputation) {
    const house = GREAT_HOUSES[faction];
    if (!house) return null;
    
    const modifiers = calculateContractModifier(faction, reputation);
    
    // Generate faction-appropriate contract
    const contractTemplates = getFactionContractTemplates(faction);
    const template = contractTemplates[Math.floor(Math.random() * contractTemplates.length)];
    
    return {
        ...template,
        paymentModifier: modifiers.paymentModifier,
        faction: faction,
        politicalContext: generatePoliticalContext(faction)
    };
}

function getFactionContractTemplates(faction) {
    const factionContracts = {
        'Steiner': [
            {
                name: 'Industrial Defense Contract',
                type: 'Garrison Duty',
                description: 'Protect vital Lyran manufacturing facilities from sabotage and raids. The Commonwealth\'s industrial might must be preserved.',
                paymentMod: 1.1,
                specialRequirements: ['High-tech equipment familiarity', 'Corporate security protocols'],
                employer: 'Lyran Commonwealth',
                politicalImportance: 'Critical to Steiner war machine'
            },
            {
                name: 'Technology Recovery',
                type: 'Special Operation',
                description: 'Recover advanced Star League technology from contested sites. The Lyrans will pay handsomely for technological advantages.',
                paymentMod: 1.8,
                specialRequirements: ['Technological expertise', 'Salvage rights negotiable'],
                employer: 'Lyran Intelligence Corps'
            }
        ],
        
        'Davion': [
            {
                name: 'Combined Arms Training',
                type: 'Military Exercise',
                description: 'Assist AFFS units in combined arms exercises. Help refine the legendary Davion military doctrine.',
                paymentMod: 1.0,
                specialRequirements: ['Military professionalism', 'Combined arms experience'],
                employer: 'Armed Forces of the Federated Suns'
            },
            {
                name: 'Border Reconnaissance',
                type: 'Reconnaissance',
                description: 'Gather intelligence on Capellan and Kurita military movements. Information is power in Prince Hanse\'s strategy.',
                paymentMod: 1.2,
                specialRequirements: ['Stealth capabilities', 'Intelligence gathering'],
                employer: 'MIIO'
            }
        ],
        
        'Liao': [
            {
                name: 'Covert Operations',
                type: 'Special Operation',
                description: 'Conduct deniable operations against Confederation enemies. The Maskirovka requires absolute discretion.',
                paymentMod: 1.4,
                specialRequirements: ['Absolute secrecy', 'Plausible deniability'],
                employer: 'Maskirovka'
            },
            {
                name: 'Desperate Defense',
                type: 'Planetary Defense',
                description: 'Hold critical Capellan worlds against overwhelming odds. Every world lost weakens the Confederation further.',
                paymentMod: 1.6,
                specialRequirements: ['Defensive expertise', 'Against-the-odds operations'],
                employer: 'Capellan Confederation Armed Forces'
            }
        ],
        
        'Marik': [
            {
                name: 'Provincial Mediation',
                type: 'Peacekeeping',
                description: 'Mediate disputes between Free Worlds member states. Political solutions backed by military presence.',
                paymentMod: 0.9,
                specialRequirements: ['Political neutrality', 'Diplomatic protocols'],
                employer: 'Free Worlds League Parliament'
            },
            {
                name: 'Mercenary Coordination',
                type: 'Military Support',
                description: 'Coordinate with other mercenary units in League service. The FWL depends on mercenary cooperation.',
                paymentMod: 1.0,
                specialRequirements: ['Mercenary liaison experience', 'Multi-unit coordination'],
                employer: 'Free Worlds League Military'
            }
        ],
        
        'Kurita': [
            {
                name: 'Honorable Combat',
                type: 'Ceremonial Duty',
                description: 'Participate in traditional Kuritan military ceremonies and honor duels. Bushido demands proper respect.',
                paymentMod: 0.8,
                specialRequirements: ['Honor code adherence', 'Ceremonial protocols'],
                employer: 'Draconis Combine Mustered Soldiery'
            },
            {
                name: 'Border Fortress Defense',
                type: 'Garrison Duty',
                description: 'Reinforce Kurita border fortresses against Steiner and Davion aggression. Honor demands steadfast defense.',
                paymentMod: 1.0,
                specialRequirements: ['Defensive operations', 'Honor code compliance'],
                employer: 'DCMS Regional Command'
            }
        ]
    };
    
    return factionContracts[faction] || [];
}

function generatePoliticalContext(faction) {
    const currentEvents = POLITICAL_CONTEXT_3025.currentEvents.filter(event => 
        event.affectedFactions.includes(faction) || event.affectedFactions.includes('All')
    );
    
    if (currentEvents.length === 0) return 'Standard peacetime operations';
    
    const relevantEvent = currentEvents[Math.floor(Math.random() * currentEvents.length)];
    return `Political Context: ${relevantEvent.description}`;
}

// ===== MRBC (MERCENARY REVIEW AND BONDING COMMISSION) SYSTEM =====

const MRBC_SYSTEM = {
    ratings: {
        'A': { description: 'Elite units with proven track record', contractBonus: 1.5, requirements: 'Exceptional performance' },
        'B': { description: 'Reliable veteran units', contractBonus: 1.2, requirements: 'Consistent performance' },
        'C': { description: 'Competent mercenary units', contractBonus: 1.0, requirements: 'Standard performance' },
        'D': { description: 'Unreliable or new units', contractBonus: 0.8, requirements: 'Poor or no track record' },
        'F': { description: 'Dishonorable units', contractBonus: 0.5, requirements: 'Contract violations' }
    },
    
    calculateCompanyRating: function(gameState) {
        const { company, pilots, mechs } = gameState;
        let ratingScore = 0;
        
        // Base rating from pilot quality
        const avgGunnery = pilots.reduce((sum, p) => sum + p.gunnery, 0) / pilots.length;
        const avgPiloting = pilots.reduce((sum, p) => sum + p.piloting, 0) / pilots.length;
        
        if (avgGunnery <= 2.5 && avgPiloting <= 2.5) ratingScore += 40; // Elite pilots
        else if (avgGunnery <= 3.5 && avgPiloting <= 3.5) ratingScore += 30; // Veteran
        else if (avgGunnery <= 4.5 && avgPiloting <= 4.5) ratingScore += 20; // Regular
        else ratingScore += 10; // Green
        
        // Unit size factor
        const totalBV = mechs.reduce((sum, m) => sum + (m.battleValue || 1000), 0);
        if (totalBV >= 15000) ratingScore += 25; // Regiment-sized
        else if (totalBV >= 8000) ratingScore += 20; // Battalion
        else if (totalBV >= 4000) ratingScore += 15; // Company
        else ratingScore += 10; // Lance
        
        // Reputation factor
        const totalReputation = Object.values(company.reputation).reduce((sum, rep) => sum + Math.max(0, rep), 0);
        ratingScore += Math.floor(totalReputation / 50);
        
        // Equipment condition
        const avgCondition = mechs.reduce((sum, m) => sum + m.condition, 0) / mechs.length;
        if (avgCondition >= 90) ratingScore += 15;
        else if (avgCondition >= 70) ratingScore += 10;
        else ratingScore += 5;
        
        // Determine letter rating
        if (ratingScore >= 85) return 'A';
        if (ratingScore >= 65) return 'B';
        if (ratingScore >= 45) return 'C';
        if (ratingScore >= 25) return 'D';
        return 'F';
    }
};

// Export the faction system for use in main game
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GREAT_HOUSES,
        FAMOUS_MERCENARY_UNITS,
        INNER_SPHERE_WORLDS,
        POLITICAL_CONTEXT_3025,
        MRBC_SYSTEM,
        getReputationLevel,
        calculateContractModifier,
        generateFactionSpecificContract,
        generatePoliticalContext
    };
}