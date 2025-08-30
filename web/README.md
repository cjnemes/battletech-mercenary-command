# Battletech Mercenary Command - Professional Architecture

## Overview
A professional web-based Battletech mercenary management game built with vanilla JavaScript, following enterprise-grade architecture patterns and best practices.

## Architecture Features

### 🏗️ **Modular Architecture**
- Component-based UI system
- Separation of concerns (MVC/MVP)
- Event-driven communication
- Plugin-ready architecture

### 🔧 **Development Tools**
- Modern build system with Webpack
- ESLint for code quality
- Hot reload development server
- Source maps for debugging
- Asset optimization pipeline

### 💾 **Data Management**
- IndexedDB for persistent game saves
- State management system
- Data validation and migrations
- Backup and recovery system

### 🧪 **Testing Infrastructure**
- Unit testing with Jest
- Integration tests for game systems
- Browser compatibility testing
- Performance benchmarking

### 📱 **Mobile Ready**
- Responsive design patterns
- Touch-friendly interfaces
- Performance optimized
- Progressive Web App capabilities

## Directory Structure

```
web/
├── src/                     # Source code
│   ├── components/          # Reusable UI components
│   │   ├── js/             # Component logic
│   │   └── css/            # Component styles
│   ├── systems/            # Game system modules
│   │   ├── js/             # System implementations
│   │   └── css/            # System-specific styles
│   ├── utils/              # Utility functions
│   ├── data/               # Game data and schemas
│   └── assets/             # Static assets
│       ├── images/
│       ├── audio/
│       └── fonts/
├── config/                 # Build and environment config
├── tests/                  # Test files
├── docs/                   # Documentation
├── dist/                   # Production build output
├── build/                  # Development build output
└── index.html             # Entry point
```

## Getting Started

### Development
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check code quality
```

### Production
```bash
npm run build:prod   # Production build
npm run serve        # Serve production build
```

## Game Systems

### Core Modules
- **Company Management**: Financial, personnel, reputation systems
- **Mech Bay**: Mech customization, maintenance, pilot assignments
- **Contract System**: Mission generation, risk assessment, rewards
- **Tactical Combat**: Turn-based combat with rich tactical options
- **Political System**: Faction relationships, Inner Sphere politics

### Technology Stack
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tools**: Webpack, Babel, PostCSS
- **Testing**: Jest, Playwright
- **Code Quality**: ESLint, Prettier
- **Storage**: IndexedDB, LocalStorage fallback

## Code Quality Standards
- Comprehensive error handling
- Performance monitoring
- Memory leak prevention
- Browser compatibility (modern browsers)
- Accessibility compliance (WCAG 2.1)

## Performance Features
- Lazy loading for large assets
- Code splitting for optimal loading
- Memory-efficient game state management
- Optimized rendering loops
- Asset compression and caching

Built with ❤️ for BattleTech fans everywhere.