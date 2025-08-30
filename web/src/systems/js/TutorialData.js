/**
 * Tutorial Data - Comprehensive Tutorial Content and Configuration
 * Contains all tutorial steps, content, and interactive elements for the onboarding system
 */

export class TutorialData {
  constructor() {
    // Common tutorial settings
    this.defaultSettings = {
      skippable: true,
      repeatable: true,
      autoStart: false
    };
  }

  /**
   * Get main onboarding tutorial
   */
  getMainTutorial() {
    return {
      title: "Welcome to BattleTech: Mercenary Command",
      description: "Learn the basics of running your mercenary company in the Inner Sphere",
      category: "onboarding",
      priority: 1,
      requiredScreen: "main-menu",
      autoStart: true,
      ...this.defaultSettings,
      steps: [
        {
          title: "Welcome, MechWarrior",
          content: `
            <p>Welcome to the dangerous and profitable world of mercenary warfare in the BattleTech universe!</p>
            <p>As a mercenary commander, you'll manage pilots, customize BattleMechs, negotiate contracts, and lead your forces in tactical combat across the Inner Sphere.</p>
            <p>This tutorial will guide you through the essential systems you'll need to master to build a successful mercenary company.</p>
          `,
          tip: "Take your time with this tutorial - understanding these systems is crucial to your success as a mercenary commander.",
          highlight: null,
          actions: null
        },
        {
          title: "Understanding the Mercenary Life",
          content: `
            <p><strong>The Inner Sphere</strong> is a war-torn galaxy where the Great Houses constantly vie for power. As an independent mercenary, you offer your services to the highest bidder.</p>
            <p><strong>Your goals:</strong></p>
            <ul>
              <li>Build and maintain a roster of skilled MechWarriors</li>
              <li>Acquire and customize powerful BattleMechs</li>
              <li>Accept contracts that balance risk and reward</li>
              <li>Manage your company's finances and reputation</li>
              <li>Survive the battlefield to fight another day</li>
            </ul>
          `,
          tip: "Remember: Dead MechWarriors earn no C-Bills, and destroyed 'Mechs are expensive to replace!",
          highlight: null,
          actions: null
        },
        {
          title: "Creating Your Company",
          content: `
            <p>Let's start by creating your mercenary company. Click the <strong>"New Company"</strong> button to begin your journey.</p>
            <p>You'll be able to name your company and select starting resources. Choose wisely - your initial decisions will shape your early campaigns.</p>
          `,
          tip: "Company names in BattleTech often reflect military units (like 'Wolf's Dragoons') or geographic origins.",
          highlight: {
            target: "#new-company-btn",
            style: "pulse",
            scrollIntoView: true
          },
          actions: [
            {
              type: "wait",
              duration: 1000
            }
          ],
          interactive: true
        },
        {
          title: "Company Overview - Your Command Center",
          content: `
            <p>Excellent! You're now in the <strong>Company Overview</strong> screen - your primary command interface.</p>
            <p>Here you can see:</p>
            <ul>
              <li><strong>Company Finances:</strong> Your C-Bills (currency) and monthly expenses</li>
              <li><strong>Reputation:</strong> Your standing with various factions</li>
              <li><strong>Pilot Roster:</strong> Your MechWarriors and their skills</li>
              <li><strong>Unit Status:</strong> Combat readiness of your forces</li>
            </ul>
          `,
          tip: "Keep an eye on your monthly expenses - they'll drain your funds even between contracts!",
          highlight: {
            target: ".company-stats",
            style: "glow",
            scrollIntoView: true
          },
          requiredScreen: "company-overview"
        },
        {
          title: "Managing Your Finances",
          content: `
            <p>C-Bills are the lifeblood of your mercenary company. Notice your current funds and monthly expenses in the financial summary.</p>
            <p><strong>Income sources:</strong></p>
            <ul>
              <li>Contract payments (your primary income)</li>
              <li>Salvage rights from defeated enemies</li>
              <li>Bonus payments for exceptional performance</li>
            </ul>
            <p><strong>Expenses include:</strong></p>
            <ul>
              <li>MechWarrior salaries</li>
              <li>BattleMech maintenance</li>
              <li>Ammunition and repairs</li>
              <li>Insurance and overhead</li>
            </ul>
          `,
          tip: "A good rule of thumb: keep enough reserves to cover 3-4 months of expenses for emergencies.",
          highlight: {
            target: ".funds-display",
            style: "pulse",
            scrollIntoView: true
          }
        },
        {
          title: "Your Pilot Roster",
          content: `
            <p>Your MechWarriors are your most valuable assets. Each pilot has unique skills that affect combat performance:</p>
            <ul>
              <li><strong>Gunnery:</strong> Accuracy with weapons</li>
              <li><strong>Piloting:</strong> Mech control and movement</li>
              <li><strong>Experience:</strong> Overall combat knowledge</li>
              <li><strong>Specializations:</strong> Unique abilities and weapon preferences</li>
            </ul>
            <p>Click on a pilot to view their detailed statistics and history.</p>
          `,
          tip: "Lower skill numbers are better! A 2/3 pilot (Gunnery 2, Piloting 3) is more skilled than a 4/5 pilot.",
          highlight: {
            target: ".pilot-list",
            style: "glow",
            scrollIntoView: true
          },
          interactive: true,
          actions: [
            {
              type: "click",
              target: ".pilot-card:first-child"
            }
          ]
        },
        {
          title: "Pilot Details and Management",
          content: `
            <p>Great! You can see detailed information about your pilot, including:</p>
            <ul>
              <li>Current skill ratings and experience</li>
              <li>Combat history and achievements</li>
              <li>Injury status and recovery time</li>
              <li>Salary requirements and contract status</li>
            </ul>
            <p>Managing your pilots effectively is crucial - experienced MechWarriors can make the difference between victory and defeat.</p>
          `,
          tip: "Injured pilots need time to recover. Always maintain a reserve of pilots for continuous operations.",
          highlight: {
            target: ".pilot-details",
            style: "pulse",
            scrollIntoView: true
          }
        },
        {
          title: "Navigating to the Mech Bay",
          content: `
            <p>Now let's examine your BattleMechs - the armored giants that define battlefield supremacy.</p>
            <p>Click the <strong>"Mech Bay"</strong> button to access your 'Mech hangar and customization systems.</p>
          `,
          tip: "The Mech Bay is where you'll spend much of your time customizing loadouts and managing repairs.",
          highlight: {
            target: "#mech-bay-btn",
            style: "pulse",
            scrollIntoView: true
          },
          interactive: true,
          actions: [
            {
              type: "click",
              target: "#mech-bay-btn"
            }
          ]
        },
        {
          title: "The Mech Bay - Your Technical Heart",
          content: `
            <p>Welcome to the Mech Bay! This is where you manage your BattleMech inventory and customization.</p>
            <p>Here you can:</p>
            <ul>
              <li><strong>View 'Mech status:</strong> Armor, weapons, and damage</li>
              <li><strong>Assign pilots:</strong> Match MechWarriors to appropriate machines</li>
              <li><strong>Repair damage:</strong> Fix battle damage and maintain systems</li>
              <li><strong>Customize loadouts:</strong> Install new weapons and equipment</li>
            </ul>
          `,
          tip: "Each 'Mech has weight limits and critical slot restrictions for customization.",
          highlight: {
            target: ".mech-list",
            style: "glow",
            scrollIntoView: true
          },
          requiredScreen: "mech-bay"
        },
        {
          title: "Understanding BattleMech Classes",
          content: `
            <p>BattleMechs are classified by weight and role:</p>
            <ul>
              <li><strong>Light 'Mechs (20-35 tons):</strong> Fast scouts and harassers</li>
              <li><strong>Medium 'Mechs (40-55 tons):</strong> Versatile workhorses</li>
              <li><strong>Heavy 'Mechs (60-75 tons):</strong> Main battle units with serious firepower</li>
              <li><strong>Assault 'Mechs (80-100 tons):</strong> Slow but devastating juggernauts</li>
            </ul>
            <p>Each class has specific tactical roles and advantages on the battlefield.</p>
          `,
          tip: "A balanced force with multiple weight classes gives you tactical flexibility.",
          highlight: {
            target: ".mech-card:first-child",
            style: "pulse",
            scrollIntoView: true
          }
        },
        {
          title: "Accessing the Star Map",
          content: `
            <p>Now let's find some work! The Star Map shows available contracts across the Inner Sphere.</p>
            <p>Click the <strong>"Star Map"</strong> button to view current contract opportunities.</p>
          `,
          tip: "Different regions offer different types of contracts and varying levels of danger.",
          highlight: {
            target: "#star-map-btn",
            style: "pulse",
            scrollIntoView: true
          },
          interactive: true,
          actions: [
            {
              type: "click",
              target: "#star-map-btn"
            }
          ]
        },
        {
          title: "The Star Map - Finding Work",
          content: `
            <p>The Star Map displays the Inner Sphere with available contracts marked by faction colors.</p>
            <p>Contract information includes:</p>
            <ul>
              <li><strong>Employer:</strong> Which faction is hiring</li>
              <li><strong>Mission Type:</strong> Recon, assault, defense, etc.</li>
              <li><strong>Payment:</strong> C-Bills offered for completion</li>
              <li><strong>Difficulty:</strong> Expected opposition level</li>
              <li><strong>Risk Factors:</strong> Special conditions or hazards</li>
            </ul>
          `,
          tip: "Higher-paying contracts usually involve greater risk. Balance profit against potential losses.",
          highlight: {
            target: ".contract-list",
            style: "glow",
            scrollIntoView: true
          },
          requiredScreen: "star-map"
        },
        {
          title: "Contract Selection Strategy",
          content: `
            <p>Choosing contracts wisely is crucial for long-term success:</p>
            <ul>
              <li><strong>Match difficulty to your capability:</strong> Don't bite off more than you can chew</li>
              <li><strong>Consider reputation effects:</strong> Some contracts may anger other factions</li>
              <li><strong>Factor in travel costs:</strong> Distant contracts cost more to reach</li>
              <li><strong>Read special conditions:</strong> Some missions have unique requirements or restrictions</li>
            </ul>
            <p>Click on a contract to view detailed briefing information.</p>
          `,
          tip: "Early in your career, focus on lower-risk contracts to build experience and reputation.",
          highlight: {
            target: ".contract-card:first-child",
            style: "pulse",
            scrollIntoView: true
          },
          interactive: true,
          actions: [
            {
              type: "click",
              target: ".contract-card:first-child"
            }
          ]
        },
        {
          title: "Contract Briefings and Terms",
          content: `
            <p>Contract briefings provide essential mission details:</p>
            <ul>
              <li><strong>Objectives:</strong> What you need to accomplish</li>
              <li><strong>Opposition:</strong> Expected enemy forces</li>
              <li><strong>Terrain:</strong> Battlefield conditions</li>
              <li><strong>Payment Terms:</strong> Base pay, bonuses, and salvage rights</li>
              <li><strong>Time Limits:</strong> Deadlines for completion</li>
            </ul>
            <p>Study each contract carefully before accepting - your company's survival depends on it.</p>
          `,
          tip: "Salvage rights can be more valuable than the base payment if you can capture enemy equipment.",
          highlight: {
            target: ".contract-details",
            style: "glow",
            scrollIntoView: true
          }
        },
        {
          title: "Reputation and Faction Relations",
          content: `
            <p>Your actions affect your reputation with the Great Houses and other factions:</p>
            <ul>
              <li><strong>Positive reputation:</strong> Better contracts, higher pay, exclusive opportunities</li>
              <li><strong>Negative reputation:</strong> Fewer contracts, hostile encounters, travel restrictions</li>
              <li><strong>Neutral standing:</strong> Basic access to most services</li>
            </ul>
            <p>Some contracts may improve your standing with one faction while damaging it with their enemies.</p>
          `,
          tip: "Maintaining good relations with multiple factions keeps your options open during political shifts.",
          highlight: {
            target: ".reputation-display",
            style: "pulse",
            scrollIntoView: true
          }
        },
        {
          title: "Combat Preparation",
          content: `
            <p>Before accepting a contract, ensure your unit is combat-ready:</p>
            <ul>
              <li><strong>Pilot Assignment:</strong> Match skilled pilots to appropriate 'Mechs</li>
              <li><strong>Mech Condition:</strong> Repair all damage and maintain equipment</li>
              <li><strong>Ammunition:</strong> Stock up on ammo for energy-hungry weapons</li>
              <li><strong>Medical Status:</strong> Ensure pilots are healthy and uninjured</li>
            </ul>
            <p>A well-prepared unit has a much higher chance of completing the mission successfully.</p>
          `,
          tip: "Always carry repair equipment and spare parts when operating far from friendly facilities.",
          highlight: null
        },
        {
          title: "Tutorial Complete - Ready for Command",
          content: `
            <p>Congratulations! You've completed the basic tutorial and learned the fundamentals of mercenary command:</p>
            <ul>
              <li>✓ Company management and finances</li>
              <li>✓ Pilot roster and skills</li>
              <li>✓ BattleMech operations and customization</li>
              <li>✓ Contract selection and negotiation</li>
              <li>✓ Reputation and faction relations</li>
            </ul>
            <p>You're now ready to begin your career as a mercenary commander. Good hunting, MechWarrior!</p>
            <p><em>Additional tutorials are available for specific systems - check the settings menu to replay or access advanced topics.</em></p>
          `,
          tip: "The Inner Sphere is a dangerous place, but with skill and cunning, your mercenary company can thrive.",
          highlight: null,
          actions: [
            {
              type: "emit",
              event: "tutorial:mainCompleted",
              data: { firstTime: true }
            }
          ]
        }
      ]
    };
  }

  /**
   * Get pilot management tutorial
   */
  getPilotTutorial() {
    return {
      title: "Advanced Pilot Management",
      description: "Master the recruitment, training, and deployment of MechWarriors",
      category: "management",
      priority: 2,
      requiredScreen: "company-overview",
      prerequisites: ["main-onboarding"],
      ...this.defaultSettings,
      steps: [
        {
          title: "The Art of MechWarrior Leadership",
          content: `
            <p>Managing MechWarriors is both an art and a science. Each pilot brings unique skills, personality traits, and combat specializations to your unit.</p>
            <p>In this advanced tutorial, you'll learn:</p>
            <ul>
              <li>How to evaluate pilot performance and potential</li>
              <li>Recruitment strategies and pilot development</li>
              <li>Managing pilot morale and loyalty</li>
              <li>Optimal pilot-to-'Mech assignments</li>
            </ul>
          `,
          tip: "Great commanders know that elite pilots can overcome inferior equipment, but the reverse is rarely true.",
          highlight: {
            target: ".pilot-list",
            style: "glow"
          }
        },
        {
          title: "Understanding Pilot Attributes",
          content: `
            <p>Each MechWarrior has several key attributes that affect combat performance:</p>
            <ul>
              <li><strong>Gunnery (1-8):</strong> Weapon accuracy and target acquisition</li>
              <li><strong>Piloting (1-8):</strong> Mech control, movement, and physical attacks</li>
              <li><strong>Experience Level:</strong> Overall combat knowledge and battlefield awareness</li>
              <li><strong>Special Abilities:</strong> Unique skills like tactics, leadership, or weapon specialization</li>
              <li><strong>Psychological Profile:</strong> Traits affecting morale and unit cohesion</li>
            </ul>
          `,
          tip: "A pilot with Gunnery 2/Piloting 3 is significantly more effective than one with 4/5 ratings.",
          highlight: {
            target: ".pilot-stats",
            style: "pulse"
          }
        },
        {
          title: "Pilot Specializations and Roles",
          content: `
            <p>Smart commanders assign pilots to roles that match their strengths:</p>
            <ul>
              <li><strong>Sharpshooters:</strong> High gunnery, excel with precision weapons (AC, PPC)</li>
              <li><strong>Brawlers:</strong> High piloting, effective in close combat</li>
              <li><strong>Scouts:</strong> Light 'Mech specialists, reconnaissance experts</li>
              <li><strong>Fire Support:</strong> Long-range specialists, LRM and artillery</li>
              <li><strong>Leaders:</strong> Command abilities, boost unit performance</li>
            </ul>
          `,
          tip: "Match pilot strengths to 'Mech capabilities for maximum effectiveness.",
          highlight: {
            target: ".pilot-specializations",
            style: "glow"
          }
        }
        // Additional pilot management steps would continue here...
      ]
    };
  }

  /**
   * Get mech customization tutorial
   */
  getMechTutorial() {
    return {
      title: "BattleMech Customization",
      description: "Learn to modify and optimize your 'Mechs for maximum battlefield effectiveness",
      category: "technical",
      priority: 3,
      requiredScreen: "mech-bay",
      prerequisites: ["main-onboarding"],
      ...this.defaultSettings,
      steps: [
        {
          title: "The Art of 'Mech Modification",
          content: `
            <p>BattleMech customization is a complex art that can mean the difference between victory and scrap metal.</p>
            <p>In this tutorial, you'll master:</p>
            <ul>
              <li>Understanding weight limits and critical slots</li>
              <li>Weapon systems and their trade-offs</li>
              <li>Heat management and cooling systems</li>
              <li>Armor placement and protection strategies</li>
              <li>Creating specialized 'Mech variants</li>
            </ul>
          `,
          tip: "A well-customized 'Mech adapted to your tactics is worth two stock configurations.",
          highlight: {
            target: ".mech-customization",
            style: "glow"
          }
        },
        {
          title: "Weight Classes and Tonnage Limits",
          content: `
            <p>Every 'Mech has strict weight limits that govern what equipment it can carry:</p>
            <ul>
              <li><strong>Internal Structure:</strong> The 'Mech's skeleton - cannot be changed</li>
              <li><strong>Engine:</strong> Provides movement and power - affects available tonnage</li>
              <li><strong>Armor:</strong> Protection that can be redistributed for optimal coverage</li>
              <li><strong>Available Tonnage:</strong> Remaining weight for weapons and equipment</li>
            </ul>
            <p>Heavier weapons provide more firepower but consume more tonnage and critical slots.</p>
          `,
          tip: "Always max out armor within weight limits - dead 'Mechs deal no damage.",
          highlight: {
            target: ".weight-display",
            style: "pulse"
          }
        }
        // Additional mech customization steps would continue here...
      ]
    };
  }

  /**
   * Get contract selection tutorial
   */
  getContractTutorial() {
    return {
      title: "Advanced Contract Strategy",
      description: "Master the business side of mercenary operations",
      category: "strategy",
      priority: 4,
      requiredScreen: "star-map",
      prerequisites: ["main-onboarding"],
      ...this.defaultSettings,
      steps: [
        {
          title: "The Business of War",
          content: `
            <p>Successful mercenary commanders are equal parts warrior and businessperson. Contract selection determines your unit's survival and prosperity.</p>
            <p>This tutorial covers:</p>
            <ul>
              <li>Risk assessment and profit analysis</li>
              <li>Negotiation strategies and payment terms</li>
              <li>Long-term reputation management</li>
              <li>Market analysis and opportunity recognition</li>
            </ul>
          `,
          tip: "The most profitable contract isn't always the best choice for your unit's long-term success.",
          highlight: {
            target: ".contract-list",
            style: "glow"
          }
        }
        // Additional contract strategy steps would continue here...
      ]
    };
  }

  /**
   * Get combat basics tutorial
   */
  getCombatTutorial() {
    return {
      title: "Tactical Combat Fundamentals",
      description: "Learn the basics of hex-based tactical combat",
      category: "combat",
      priority: 5,
      requiredScreen: "tactical-combat",
      prerequisites: ["main-onboarding", "pilot-management"],
      ...this.defaultSettings,
      steps: [
        {
          title: "Welcome to the Battlefield",
          content: `
            <p>Combat in BattleTech is turn-based and tactical, fought on a hexagonal grid that represents terrain and positioning.</p>
            <p>You'll learn:</p>
            <ul>
              <li>Movement and positioning strategies</li>
              <li>Weapon ranges and targeting</li>
              <li>Heat management during combat</li>
              <li>Terrain advantages and cover</li>
              <li>Victory conditions and objectives</li>
            </ul>
          `,
          tip: "Position and timing are often more important than raw firepower.",
          highlight: {
            target: "#battlefield",
            style: "glow"
          }
        }
        // Additional combat tutorial steps would continue here...
      ]
    };
  }

  /**
   * Get contextual hints for various game elements
   */
  getContextualHints() {
    return {
      // Main Menu hints
      "main-menu": {
        "#new-company-btn": {
          title: "Start Your Mercenary Career",
          content: "Create a new mercenary company and begin your journey in the Inner Sphere.",
          trigger: "hover",
          delay: 1000
        },
        "#load-game-btn": {
          title: "Continue Your Campaign",
          content: "Resume an existing mercenary company from your saved games.",
          trigger: "hover",
          delay: 1000
        }
      },

      // Company Overview hints
      "company-overview": {
        ".funds-display": {
          title: "Company Treasury",
          content: "Your available C-Bills. Keep enough reserves to cover several months of expenses.",
          trigger: "hover",
          delay: 500
        },
        ".pilot-card": {
          title: "MechWarrior Profile",
          content: "Click to view detailed pilot statistics, skills, and combat history.",
          trigger: "hover",
          delay: 800
        },
        ".reputation-meter": {
          title: "Faction Standing",
          content: "Your reputation affects available contracts and services from this faction.",
          trigger: "hover",
          delay: 600
        }
      },

      // Mech Bay hints
      "mech-bay": {
        ".mech-card": {
          title: "BattleMech Status",
          content: "Shows 'Mech condition, assigned pilot, and customization options.",
          trigger: "hover",
          delay: 500
        },
        ".repair-btn": {
          title: "Repair Systems",
          content: "Repair battle damage and maintain 'Mech systems. Costs time and C-Bills.",
          trigger: "hover",
          delay: 700
        },
        ".customize-btn": {
          title: "Customize Loadout",
          content: "Modify weapons, armor, and equipment to suit your tactical needs.",
          trigger: "hover",
          delay: 700
        }
      },

      // Star Map hints
      "star-map": {
        ".contract-card": {
          title: "Available Contract",
          content: "Click to view detailed mission briefing, payment, and risk assessment.",
          trigger: "hover",
          delay: 600
        },
        ".faction-territory": {
          title: "Faction Territory",
          content: "Different factions offer different types of contracts and payment rates.",
          trigger: "hover",
          delay: 800
        }
      }
    };
  }

  /**
   * Get tutorial trigger conditions
   */
  getTutorialTriggers() {
    return {
      // Automatic tutorial triggers based on game state
      "first-contract-available": {
        tutorialId: "contract-selection",
        condition: "contracts.length > 0 && !tutorialProgress.contract-selection",
        delay: 2000
      },
      
      "first-pilot-injured": {
        tutorialId: "pilot-management",
        condition: "pilots.some(p => p.injured) && !tutorialProgress.pilot-management",
        delay: 1000
      },
      
      "first-mech-damaged": {
        tutorialId: "mech-customization", 
        condition: "mechs.some(m => m.damaged) && !tutorialProgress.mech-customization",
        delay: 1500
      },
      
      "entering-combat": {
        tutorialId: "combat-basics",
        condition: "screen === 'tactical-combat' && !tutorialProgress.combat-basics",
        delay: 500
      }
    };
  }

  /**
   * Get adaptive tutorial content based on player actions
   */
  getAdaptiveContent() {
    return {
      // Content that changes based on player behavior
      "pilot-selection": {
        "high-skill-preference": {
          condition: "userActions.pilot_select.high_skill > userActions.pilot_select.low_skill",
          content: "I see you prefer experienced pilots. Elite MechWarriors are expensive but worth the investment for crucial missions."
        },
        "budget-conscious": {
          condition: "company.funds < 100000",
          content: "With limited funds, consider recruiting green pilots and training them over time. It's more economical than hiring veterans."
        }
      },
      
      "mech-customization": {
        "weapon-heavy": {
          condition: "customizations.weapons > customizations.armor",
          content: "You favor firepower over protection. Remember that destroyed 'Mechs deal no damage - consider armor balance."
        },
        "defensive-focus": {
          condition: "customizations.armor > customizations.weapons",
          content: "Your defensive approach is wise. Durable 'Mechs stay in the fight longer and preserve your investment."
        }
      }
    };
  }

  /**
   * Get tutorial achievements and milestones
   */
  getTutorialAchievements() {
    return {
      "tutorial-novice": {
        title: "Academy Graduate",
        description: "Complete the main onboarding tutorial",
        condition: "tutorialProgress.main-onboarding.status === 'completed'",
        reward: "Unlock advanced tutorials"
      },
      
      "tutorial-scholar": {
        title: "Technical Expert",
        description: "Complete 3 advanced tutorials",
        condition: "Object.values(tutorialProgress).filter(p => p.status === 'completed').length >= 4",
        reward: "+5% repair efficiency"
      },
      
      "tutorial-master": {
        title: "Master Commander",
        description: "Complete all available tutorials",
        condition: "Object.values(tutorialProgress).every(p => p.status === 'completed')",
        reward: "Tutorial Master badge and +10% negotiation bonus"
      }
    };
  }
}