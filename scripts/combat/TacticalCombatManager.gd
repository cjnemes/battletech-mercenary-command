class_name TacticalCombatManager extends Node

signal turn_started(unit: CombatUnit)
signal turn_ended(unit: CombatUnit)
signal combat_ended(victory: bool)
signal unit_selected(unit: CombatUnit)

enum CombatPhase { 
	DEPLOYMENT, 
	INITIATIVE, 
	MOVEMENT, 
	COMBAT, 
	END_TURN 
}

var current_phase: CombatPhase = CombatPhase.DEPLOYMENT
var current_turn: int = 1
var current_unit_index: int = 0

var player_units: Array[CombatUnit] = []
var enemy_units: Array[CombatUnit] = []
var all_units: Array[CombatUnit] = []
var turn_order: Array[CombatUnit] = []

var selected_unit: CombatUnit = null
var hex_grid: HexGrid
var event_bus: EventBus

var combat_active: bool = false

func _ready() -> void:
	var game_manager = get_node("/root/GameManager")
	event_bus = game_manager.event_bus
	
	# Connect to hex grid events
	hex_grid = get_node("HexGrid")
	if hex_grid:
		hex_grid.hex_clicked.connect(_on_hex_clicked)
		hex_grid.hex_hovered.connect(_on_hex_hovered)

func initialize_combat(player_mechs: Array[MechUnit], mission_data: Dictionary) -> void:
	combat_active = true
	current_turn = 1
	current_phase = CombatPhase.DEPLOYMENT
	
	# Create player units
	var company_manager = get_node("/root/CompanyManager")
	player_units.clear()
	
	for i in range(min(player_mechs.size(), 4)):  # Limit to 4 player units
		var mech_unit = player_mechs[i]
		var pilot = null
		
		if mech_unit.pilot_id != "":
			pilot = company_manager.get_pilot_by_id(mech_unit.pilot_id)
		
		var combat_unit = CombatUnit.new(mech_unit, pilot)
		combat_unit.is_player_unit = true
		combat_unit.hex_position = Vector2i(2 + i, 12)  # Deploy at bottom
		
		combat_unit.unit_destroyed.connect(_on_unit_destroyed)
		add_child(combat_unit)
		player_units.append(combat_unit)
	
	# Generate enemy units
	generate_enemy_units(mission_data)
	
	# Combine all units
	all_units = player_units + enemy_units
	
	# Place units on grid
	for unit in all_units:
		hex_grid.place_unit(unit.hex_position, unit)
	
	# Calculate initiative order
	calculate_initiative()
	start_combat()

func generate_enemy_units(mission_data: Dictionary) -> void:
	enemy_units.clear()
	
	# Generate 2-4 enemy units based on difficulty
	var num_enemies = randi_range(2, 4)
	
	for i in range(num_enemies):
		var enemy_unit = CombatUnit.new()
		enemy_unit.unit_name = "Enemy Mech " + str(i + 1)
		enemy_unit.is_player_unit = false
		enemy_unit.hex_position = Vector2i(8 + i, 2)  # Deploy at top
		enemy_unit.current_health = randi_range(60, 100)
		enemy_unit.max_health = enemy_unit.current_health
		enemy_unit.weight_class = MechData.WeightClass.values().pick_random()
		
		enemy_unit.unit_destroyed.connect(_on_unit_destroyed)
		add_child(enemy_unit)
		enemy_units.append(enemy_unit)

func calculate_initiative() -> void:
	turn_order = all_units.duplicate()
	
	# Sort by pilot skill (if available) and random factor
	turn_order.sort_custom(func(a: CombatUnit, b: CombatUnit):
		var a_init = get_unit_initiative(a)
		var b_init = get_unit_initiative(b)
		return a_init > b_init
	)

func get_unit_initiative(unit: CombatUnit) -> int:
	var base_init = 10
	
	if unit.pilot_data:
		base_init += (6 - unit.pilot_data.piloting_skill)  # Better pilots go first
	
	base_init += randi_range(-2, 2)  # Random factor
	return base_init

func start_combat() -> void:
	current_phase = CombatPhase.INITIATIVE
	current_unit_index = 0
	
	if not turn_order.is_empty():
		start_unit_turn(turn_order[current_unit_index])
	
	event_bus.combat_started.emit({"turn": current_turn})

func start_unit_turn(unit: CombatUnit) -> void:
	selected_unit = unit
	unit.start_turn()
	
	current_phase = CombatPhase.MOVEMENT
	turn_started.emit(unit)
	event_bus.turn_started.emit(unit.unit_id)
	
	# Show movement range for current unit
	if unit.can_move():
		var movement_hexes = calculate_movement_range(unit)
		hex_grid.set_movement_range(movement_hexes)
	
	# If AI unit, process AI turn
	if not unit.is_player_unit:
		process_ai_turn(unit)

func end_unit_turn() -> void:
	if selected_unit:
		selected_unit.end_turn()
		turn_ended.emit(selected_unit)
		event_bus.turn_ended.emit(selected_unit.unit_id)
	
	hex_grid.clear_overlays()
	
	# Move to next unit
	current_unit_index += 1
	if current_unit_index >= turn_order.size():
		end_turn()
	else:
		start_unit_turn(turn_order[current_unit_index])

func end_turn() -> void:
	current_turn += 1
	current_unit_index = 0
	
	# Remove destroyed units from turn order
	turn_order = turn_order.filter(func(unit): return not unit.is_destroyed())
	
	# Check for combat end conditions
	if check_victory_conditions():
		return
	
	# Start next turn
	if not turn_order.is_empty():
		start_unit_turn(turn_order[current_unit_index])

func check_victory_conditions() -> bool:
	var active_players = player_units.filter(func(unit): return not unit.is_destroyed())
	var active_enemies = enemy_units.filter(func(unit): return not unit.is_destroyed())
	
	if active_players.is_empty():
		end_combat(false)  # Defeat
		return true
	elif active_enemies.is_empty():
		end_combat(true)   # Victory
		return true
	
	return false

func end_combat(victory: bool) -> void:
	combat_active = false
	hex_grid.clear_overlays()
	combat_ended.emit(victory)
	event_bus.combat_ended.emit({"victory": victory, "turn": current_turn})

func process_ai_turn(unit: CombatUnit) -> void:
	# Simple AI: Move towards nearest enemy and attack if possible
	await get_tree().create_timer(1.0).timeout  # AI "thinking" delay
	
	var nearest_target = find_nearest_enemy(unit)
	if nearest_target:
		# Try to move closer to target
		if unit.can_move():
			var target_hex = find_movement_towards_target(unit, nearest_target)
			if target_hex != Vector2i(-1, -1):
				move_unit_to_hex(unit, target_hex)
		
		# Try to attack if in range
		if unit.can_act() and unit.get_distance_to(nearest_target) <= 3:
			unit.attack_target(nearest_target, "basic")
	
	# End AI turn after a delay
	await get_tree().create_timer(0.5).timeout
	end_unit_turn()

func find_nearest_enemy(unit: CombatUnit) -> CombatUnit:
	var nearest: CombatUnit = null
	var min_distance = 999
	
	var targets = player_units if not unit.is_player_unit else enemy_units
	
	for target in targets:
		if not target.is_destroyed():
			var distance = unit.get_distance_to(target)
			if distance < min_distance:
				min_distance = distance
				nearest = target
	
	return nearest

func find_movement_towards_target(unit: CombatUnit, target: CombatUnit) -> Vector2i:
	var movement_hexes = calculate_movement_range(unit)
	var best_hex = Vector2i(-1, -1)
	var best_distance = 999
	
	for hex in movement_hexes:
		var temp_distance = hex_grid.get_hex_distance(hex, target.hex_position)
		if temp_distance < best_distance:
			best_distance = temp_distance
			best_hex = hex
	
	return best_hex

func calculate_movement_range(unit: CombatUnit) -> Array[Vector2i]:
	var reachable: Array[Vector2i] = []
	var movement_range = unit.movement_points
	
	# Simple movement calculation - get hexes within range
	var hexes_in_range = hex_grid.get_hexes_in_range(unit.hex_position, movement_range)
	
	for hex in hexes_in_range:
		# Skip occupied hexes
		if hex_grid.unit_positions.has(hex) and hex != unit.hex_position:
			continue
		
		# Check if movement cost is within range
		var movement_cost = calculate_path_cost(unit.hex_position, hex)
		if movement_cost <= movement_range:
			reachable.append(hex)
	
	return reachable

func calculate_path_cost(from: Vector2i, to: Vector2i) -> int:
	# Simplified pathfinding - just use hex distance for now
	var distance = hex_grid.get_hex_distance(from, to)
	return distance

func _on_hex_clicked(hex_pos: Vector2i) -> void:
	if not combat_active or not selected_unit or not selected_unit.is_player_unit:
		return
	
	# If unit is on the clicked hex, select it
	if hex_grid.unit_positions.has(hex_pos):
		var clicked_unit = hex_grid.unit_positions[hex_pos]
		if clicked_unit.is_player_unit:
			select_unit(clicked_unit)
			return
		elif selected_unit.can_act():
			# Attack enemy unit
			attempt_attack(selected_unit, clicked_unit)
			return
	
	# Otherwise, try to move to the hex
	if selected_unit.can_move():
		attempt_move(selected_unit, hex_pos)

func _on_hex_hovered(hex_pos: Vector2i) -> void:
	# Could show preview information here
	pass

func select_unit(unit: CombatUnit) -> void:
	if unit != selected_unit:
		selected_unit = unit
		unit_selected.emit(unit)
		
		hex_grid.clear_overlays()
		hex_grid.set_highlighted_hexes([unit.hex_position])
		
		if unit.can_move():
			var movement_hexes = calculate_movement_range(unit)
			hex_grid.set_movement_range(movement_hexes)

func attempt_move(unit: CombatUnit, target_hex: Vector2i) -> void:
	var movement_cost = calculate_path_cost(unit.hex_position, target_hex)
	
	if unit.move_to(target_hex, movement_cost):
		hex_grid.move_unit(unit.hex_position, target_hex)
		
		# Update overlays
		hex_grid.clear_overlays()
		if unit.can_move():
			var movement_hexes = calculate_movement_range(unit)
			hex_grid.set_movement_range(movement_hexes)
		
		# Auto-end turn if unit can't do anything else
		if not unit.can_move() and not unit.can_act():
			end_unit_turn()

func move_unit_to_hex(unit: CombatUnit, target_hex: Vector2i) -> bool:
	var movement_cost = calculate_path_cost(unit.hex_position, target_hex)
	
	if unit.move_to(target_hex, movement_cost):
		hex_grid.move_unit(unit.hex_position, target_hex)
		return true
	
	return false

func attempt_attack(attacker: CombatUnit, target: CombatUnit) -> void:
	if attacker.attack_target(target, "basic"):
		print("%s hit %s!" % [attacker.unit_name, target.unit_name])
	else:
		print("%s missed %s!" % [attacker.unit_name, target.unit_name])
	
	# End turn after attack
	end_unit_turn()

func _on_unit_destroyed(unit: CombatUnit) -> void:
	print("%s destroyed!" % unit.unit_name)
	hex_grid.remove_unit(unit.hex_position)
	
	# Remove from arrays
	player_units.erase(unit)
	enemy_units.erase(unit)
	all_units.erase(unit)
	
	# Check victory conditions
	check_victory_conditions()