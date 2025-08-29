# Development Guidelines

## Code Standards

### GDScript Style Guide

#### Naming Conventions
```gdscript
# Classes: PascalCase
class_name MechWarrior extends Node

# Variables and functions: snake_case
var heat_level: int = 0
var max_heat_capacity: int = 30

func calculate_heat_buildup() -> int:
    return heat_level + weapon_heat

# Constants: SCREAMING_SNAKE_CASE
const MAX_MECH_TONNAGE: int = 100
const DEFAULT_HEAT_SINKS: int = 10

# Signals: snake_case with descriptive names
signal heat_threshold_exceeded(current_heat: int)
signal mech_destroyed(mech_id: String)
```

#### File Organization
```gdscript
# 1. Tool declaration (if needed)
@tool

# 2. Class name and inheritance
class_name CombatUnit extends Node2D

# 3. Signals
signal health_changed(new_health: int, max_health: int)
signal unit_destroyed()

# 4. Enums
enum UnitType { MECH, VEHICLE, INFANTRY }
enum DamageType { PHYSICAL, ENERGY, MISSILE }

# 5. Constants
const MAX_ARMOR_POINTS: int = 100

# 6. Exported variables
@export var unit_name: String = ""
@export var tonnage: int = 50

# 7. Public variables
var current_health: int
var max_health: int

# 8. Private variables
var _internal_id: String
var _damage_modifiers: Dictionary

# 9. Onready variables
@onready var sprite: Sprite2D = $Sprite2D
@onready var health_bar: ProgressBar = $UI/HealthBar

# 10. Built-in virtual methods
func _ready() -> void:
    initialize_unit()

func _process(delta: float) -> void:
    update_animations(delta)

# 11. Public methods
func take_damage(amount: int, damage_type: DamageType) -> void:
    # Implementation here

# 12. Private methods
func _calculate_damage_reduction(damage_type: DamageType) -> float:
    # Implementation here
```

### Project Structure Standards

#### Script Organization
- `scripts/core/`: Fundamental game systems (GameManager, SaveSystem, etc.)
- `scripts/systems/`: Gameplay systems (CombatSystem, EconomyManager, etc.)
- `scripts/ui/`: UI controllers and components
- `scripts/data/`: Data models and structures

#### Scene Organization
- `scenes/main/`: Core scenes (MainMenu, GameWorld, etc.)
- `scenes/combat/`: Combat-related scenes
- `scenes/management/`: Company management scenes
- `scenes/ui/`: Reusable UI components

## Git Workflow

### Branch Strategy
```bash
main                    # Production-ready code
├── develop            # Integration branch for features
├── feature/combat-system    # Individual feature development
├── feature/ui-redesign     # UI improvements
└── hotfix/save-bug         # Critical bug fixes
```

### Commit Message Format
```
type(scope): brief description

Detailed explanation of changes made and reasoning.
Include any breaking changes or important notes.

Fixes #123
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Example Commits
```bash
feat(combat): add heat management system

Implements heat buildup and cooling mechanics for mechs.
- Heat increases with weapon fire and movement
- Automatic shutdown at critical levels
- Cooling rates affected by environment and heat sinks

Closes #45
```

## Testing Strategy

### Unit Tests
```gdscript
# tests/unit/test_heat_system.gd
extends GutTest

func test_heat_buildup():
    var heat_system = HeatSystem.new()
    heat_system.add_heat(10)
    assert_eq(heat_system.current_heat, 10)

func test_critical_heat_shutdown():
    var heat_system = HeatSystem.new()
    heat_system.add_heat(35)  # Over critical threshold
    assert_true(heat_system.is_shutdown)
```

### Integration Tests
- Combat system interactions
- Save/load functionality
- UI component integration

### Manual Testing Checklist
- [ ] Combat scenarios play correctly
- [ ] Company management features work
- [ ] Save/load preserves game state
- [ ] UI remains responsive under load
- [ ] Performance acceptable on target hardware

## Performance Guidelines

### Memory Management
```gdscript
# Prefer object pooling for frequently created/destroyed objects
var projectile_pool: Array[Projectile] = []

func get_projectile() -> Projectile:
    if projectile_pool.is_empty():
        return Projectile.new()
    return projectile_pool.pop_back()

func return_projectile(projectile: Projectile) -> void:
    projectile.reset()
    projectile_pool.push_back(projectile)
```

### Optimization Targets
- 60 FPS during normal gameplay
- 30 FPS minimum during intense combat
- Memory usage under 1GB on target hardware
- Level load times under 5 seconds

## Debugging Tools

### Custom Debug Commands
```gdscript
# Debug overlay for development builds
func _input(event: InputEvent) -> void:
    if OS.is_debug_build() and event is InputEventKey:
        match event.keycode:
            KEY_F1: toggle_debug_overlay()
            KEY_F2: spawn_test_mech()
            KEY_F3: add_debug_resources()
```

### Logging Standards
```gdscript
# Use consistent logging levels
func attack_target(target: CombatUnit) -> void:
    Logger.info("Combat", "Unit %s attacking %s" % [unit_name, target.unit_name])
    
    var damage = calculate_damage()
    Logger.debug("Combat", "Calculated damage: %d" % damage)
    
    if damage > target.armor:
        Logger.warning("Combat", "Attack will penetrate armor!")
```

## Build and Deployment

### Export Presets
- **Development**: Debug build with console access
- **Release**: Optimized build for distribution
- **Demo**: Limited feature set for showcasing

### Mac Distribution
```bash
# Code signing for macOS
codesign --force --verify --verbose --sign "Developer ID Application: Your Name" YourGame.app

# Create DMG for distribution
create-dmg --volname "Battletech Mercenary Command" --window-pos 200 120 --window-size 600 300 --icon-size 100 --app-drop-link 425 120 "BattletechMercenaryCommand.dmg" "YourGame.app"
```

## Documentation Standards

### Code Documentation
```gdscript
## Manages heat generation and cooling for combat units.
##
## The HeatSystem tracks heat buildup from weapons and movement,
## applies cooling each turn, and handles shutdown mechanics.
class_name HeatSystem extends RefCounted

## Emitted when unit reaches critical heat levels
signal critical_heat_reached(current_heat: int)

## Maximum heat before automatic shutdown
const SHUTDOWN_THRESHOLD: int = 30

## Adds heat to the system from various sources.
##
## @param amount: Heat points to add
## @param source: Description of heat source for debugging
func add_heat(amount: int, source: String = "") -> void:
    current_heat += amount
    Logger.debug("Heat", "Added %d heat from %s" % [amount, source])
    
    if current_heat >= SHUTDOWN_THRESHOLD:
        critical_heat_reached.emit(current_heat)
```

### Design Documents
- Keep design documents updated with implementation
- Include rationale for major design decisions
- Document known limitations and future improvements
- Maintain changelog for significant design changes

This document will be updated as the project evolves and new standards are established.