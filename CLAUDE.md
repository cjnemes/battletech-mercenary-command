# Claude Development Notes

This file contains development information for Claude to better assist with this project.

## Project Overview
- **Type**: Battletech-style tactical mercenary company RPG
- **Engine**: Godot 4.3
- **Platform**: macOS (primary target)
- **Inspiration**: Battle Brothers gameplay with Battletech universe

## Build Commands
```bash
# Debug build
./build.sh debug

# Release build  
./build.sh release [version]

# Example: ./build.sh release 1.0.1
```

## Testing Commands
```bash
# Run project in Godot (when available)
godot --path . 

# Export without opening editor
godot --headless --export-release "macOS" exports/game.app
```

## Key Development Standards
- Use snake_case for variables and functions
- Use PascalCase for classes
- All scripts should extend from appropriate Godot classes
- Follow the project structure documented in docs/DEVELOPMENT.md
- Use the EventBus for cross-system communication
- Implement proper save/load through SaveSystem

## Important File Locations
- Core systems: `scripts/core/`
- Game data structures: `scripts/data/` 
- UI controllers: `scripts/ui/`
- Scene files: `scenes/`
- Documentation: `docs/`

## Current Development Phase
Phase 1: Foundation - Basic architecture and core systems implemented
Next: Implement company management and basic combat systems

## Git Workflow
- Use descriptive commit messages
- Include "🤖 Generated with [Claude Code](https://claude.ai/code)" in commits
- Feature branches for major additions
- Professional development practices

## Architecture Notes
- GameManager handles state transitions
- SceneManager handles scene loading
- EventBus for decoupled communication  
- SaveSystem handles persistence
- TimeManager tracks game calendar

The project follows professional game development practices with comprehensive documentation and proper version control.