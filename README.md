# Battletech Mercenary Command

A tactical mercenary company RPG set in the Battletech universe, inspired by Battle Brothers.

## 🎮 Play Now - Web Version Available!

**[▶️ Launch Game](web/index.html)** - Complete web-based version ready to play!

## Overview

Lead your own mercenary company through the dangerous Inner Sphere. Manage resources, recruit MechWarriors and support personnel, customize BattleMechs, and engage in tactical combat across diverse worlds and conflicts.

This repository contains both a **completed web version** (ready to play) and a **Godot 4 project** (in development).

## 🌟 Web Version Features (Completed)

### ✅ Fully Playable Game
- **Company Management**: Complete personnel and financial management system
- **Pilot System**: Hire, manage, and view detailed pilot statistics with experience levels
- **Mech Bay**: Browse mech inventory with detailed specifications and pilot assignments  
- **Contract System**: Browse, select, and accept mercenary contracts with full details
- **Visual Polish**: Professional UI with selection states, color coding, and responsive design
- **Progressive Web App**: Install and play offline on mobile devices
- **Bulletproof Architecture**: Modular design that never breaks during development

### 🎯 Game Mechanics
- **Dynamic Contracts**: Varied missions with difficulty levels, payment, and salvage rights
- **Reputation Tracking**: Monitor standing with major Inner Sphere factions
- **Time Progression**: Advance time to generate new contracts and opportunities
- **Financial Management**: Track company funds, expenses, and income
- **Pilot Management**: Individual pilot skills, experience levels, and status tracking

### 🔧 Technical Excellence
- **Professional Architecture**: Bulletproof modular system built for scalability
- **Mobile Optimized**: Responsive design works perfectly on all devices
- **Error Handling**: Comprehensive error boundaries prevent crashes
- **State Management**: Centralized game state with save/load functionality
- **Performance**: Optimized for smooth gameplay across all platforms

## Features (Godot Version - In Development)

### Core Gameplay
- **Company Management**: Hire and manage MechWarriors, technicians, and support staff
- **Financial Management**: Contract negotiations, equipment costs, repairs, and salaries
- **Tactical Combat**: Turn-based hex-grid battles with authentic Battletech mechanics
- **Mech Customization**: Modify loadouts, armor, and equipment
- **Dynamic Campaign**: Procedurally generated contracts and events
- **Reputation System**: Build relationships with major factions

### Battletech Elements
- **Authentic Mechs**: Classic designs from the Battletech universe
- **Heat Management**: Critical tactical element affecting performance
- **Damage Systems**: Detailed component damage and critical hits
- **Inner Sphere Politics**: Navigate complex faction relationships
- **Mercenary Codes**: Honor, reputation, and unit traditions

## Technical Stack

- **Engine**: Godot 4.3
- **Platform**: macOS (primary), with potential for cross-platform expansion
- **Language**: GDScript
- **Version Control**: Git with professional commit practices

## 🚀 How to Play (Web Version)

### Quick Start
1. **[Click here to play](web/index.html)** or open `web/index.html` in your browser
2. Click **"New Company"** to begin your mercenary career
3. Explore your company status in the **Company Overview**
4. Visit the **Star Map** to browse and accept contracts
5. Manage your pilots in the **Personnel Roster**
6. Inspect your mechs in the **Mech Bay**

### Game Flow
1. **Company Setup**: Start with pilots, mechs, and 500,000 C-Bills
2. **Accept Contracts**: Browse missions on the Star Map, select for details, then Accept
3. **Manage Resources**: Monitor funds, pilot status, and mech condition
4. **Combat**: Accepted contracts lead to tactical combat scenarios
5. **Progression**: Build reputation, earn funds, expand your company

### Controls
- **Click** to select pilots, mechs, or contracts
- **Visual Feedback**: Selected items highlight with blue borders
- **Navigation**: Use screen buttons to move between Company, Mech Bay, and Star Map
- **Contract Details**: Click contracts to view employer, payment, difficulty, and description

## Project Structure

```
├── web/                     # 🎮 Complete Web Game (Ready to Play!)
│   ├── index.html          # Main game interface
│   ├── styles.css          # Professional UI styling
│   ├── game_bulletproof_v2.js  # Integrated game system
│   ├── src_v2/             # Bulletproof modular architecture
│   │   ├── core/           # Event system, logging, orchestration
│   │   ├── state/          # Game state and save management
│   │   ├── systems/        # Pilot and mech management systems
│   │   ├── ui/             # Screen management and components
│   │   └── utils/          # Error handling and utilities
│   ├── ARCHITECTURE_PLAN.md # Detailed technical documentation
│   └── manifest.json       # Progressive Web App configuration
├── scripts/                 # 🏗️ Godot Project (In Development)
│   ├── core/               # Core game systems and managers
│   ├── systems/            # Gameplay systems (combat, economy, etc.)
│   ├── ui/                 # User interface controllers
│   └── data/               # Data structures and models
├── scenes/
│   ├── main/               # Main menu and core scenes
│   ├── combat/             # Tactical combat scenes
│   ├── management/         # Company management scenes
│   └── ui/                 # UI components and dialogs
├── assets/
│   ├── sprites/            # 2D artwork and animations
│   ├── audio/              # Music and sound effects
│   ├── fonts/              # Typography
│   └── ui/                 # UI assets and themes
├── docs/                   # Design documents and specifications
├── tests/                  # Unit and integration tests
└── exports/                # Build outputs
```

## Development Roadmap

### Phase 1: Foundation (Current)
- [x] Project setup and structure
- [x] Git repository initialization
- [ ] Core architecture design
- [ ] Basic UI framework
- [ ] Data models

### Phase 2: Core Systems
- [ ] Company management system
- [ ] Basic combat mechanics
- [ ] Mech database and stats
- [ ] Save/load functionality

### Phase 3: Gameplay Features
- [ ] Contract system
- [ ] Tactical combat implementation
- [ ] Mech customization
- [ ] Economic simulation

### Phase 4: Polish & Balance
- [ ] AI improvements
- [ ] Balance testing
- [ ] Audio implementation
- [ ] Final UI polish

## Getting Started

### Prerequisites
- Godot 4.3 or later
- macOS development environment
- Git for version control

### Setup
1. Clone this repository
2. Open the project in Godot Engine
3. Press F5 to run the project

## Contributing

This project follows professional development practices:
- Descriptive commit messages
- Feature branch workflow
- Code review process
- Comprehensive documentation

## License

This project is developed for educational and entertainment purposes. Battletech is a trademark of Catalyst Game Labs. This project is not affiliated with or endorsed by Catalyst Game Labs.

## Contact

For questions or collaboration opportunities, please open an issue on this repository.