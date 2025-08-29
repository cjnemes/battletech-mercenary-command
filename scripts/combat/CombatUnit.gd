class_name CombatUnit extends Node

signal unit_destroyed(unit: CombatUnit)
signal heat_changed(current_heat: int, max_heat: int)
signal status_changed(status: String)

var unit_id: String = ""
var unit_name: String = ""
var mech_data: MechData
var pilot_data: PilotData

var is_player_unit: bool = false
var hex_position: Vector2i = Vector2i(0, 0)
var facing_angle: float = 0.0  # In radians

var current_health: int = 100
var max_health: int = 100
var current_heat: int = 0
var max_heat: int = 30

var movement_points: int = 0
var max_movement_points: int = 4
var has_acted: bool = false
var has_moved: bool = false

var weight_class: MechData.WeightClass = MechData.WeightClass.MEDIUM

var armor_sections: Dictionary = {}
var structure_sections: Dictionary = {}
var critical_hits: Array[String] = []
var status_effects: Array[String] = []

func _init(mech_unit: MechUnit = null, pilot: PilotData = null) -> void:
	if mech_unit and mech_unit.mech_data:
		initialize_from_mech_unit(mech_unit, pilot)
	else:
		# Default initialization for testing
		unit_id = "test_unit_" + str(randi())
		unit_name = "Test Mech"
		current_health = 100
		max_health = 100
		weight_class = MechData.WeightClass.MEDIUM

func initialize_from_mech_unit(mech_unit: MechUnit, pilot: PilotData = null) -> void:
	unit_id = mech_unit.unit_id
	mech_data = mech_unit.mech_data
	pilot_data = pilot
	
	unit_name = mech_unit.get_display_name()
	if pilot:
		unit_name += " (" + pilot.get_display_name() + ")"
	
	weight_class = mech_data.weight_class
	max_movement_points = mech_data.base_movement
	max_heat = 30  # Standard heat threshold
	
	# Initialize armor and structure from mech unit
	armor_sections = mech_unit.current_armor.duplicate()
	structure_sections = mech_unit.current_structure.duplicate()
	
	# Calculate total health
	calculate_total_health()

func calculate_total_health() -> void:
	var total = 0
	for armor_value in armor_sections.values():
		total += armor_value
	for structure_value in structure_sections.values():
		total += structure_value
	
	current_health = total
	max_health = mech_data.get_total_armor() + mech_data.get_total_structure() if mech_data else total

func start_turn() -> void:
	movement_points = max_movement_points
	has_acted = false
	has_moved = false
	
	# Cool down heat
	current_heat = max(0, current_heat - get_heat_dissipation())
	heat_changed.emit(current_heat, max_heat)

func end_turn() -> void:
	# Apply heat effects
	apply_heat_effects()
	
	# Check for shutdown
	if current_heat >= max_heat:
		add_status_effect("shutdown")
	else:
		remove_status_effect("shutdown")

func can_move() -> bool:
	return not has_moved and movement_points > 0 and not has_status_effect("shutdown")

func can_act() -> bool:
	return not has_acted and not has_status_effect("shutdown")

func move_to(new_position: Vector2i, cost: int = 1) -> bool:
	if not can_move() or cost > movement_points:
		return false
	
	hex_position = new_position
	movement_points -= cost
	has_moved = true
	
	# Generate heat from movement
	var movement_heat = max(1, cost - 1)  # Walking generates less heat than running
	add_heat(movement_heat, "movement")
	
	return true

func attack_target(target: CombatUnit, weapon_type: String = "basic") -> bool:
	if not can_act():
		return false
	
	has_acted = true
	
	# Calculate attack based on pilot skills
	var to_hit_chance = calculate_to_hit(target)
	var attack_roll = randf()
	
	if attack_roll <= to_hit_chance:
		# Hit! Calculate damage
		var damage = calculate_weapon_damage(weapon_type)
		var heat_generated = get_weapon_heat(weapon_type)
		
		target.take_damage(damage)
		add_heat(heat_generated, "weapons")
		
		# Emit attack event
		var event_bus = get_node("/root/GameManager").event_bus
		if event_bus:
			event_bus.weapon_fired.emit(unit_id, target.unit_id, weapon_type)
			event_bus.damage_dealt.emit(target.unit_id, damage, "center_torso")
		
		return true
	else:
		# Miss
		add_heat(get_weapon_heat(weapon_type), "weapons")
		return false

func calculate_to_hit(target: CombatUnit) -> float:
	var base_chance = 0.7  # 70% base hit chance
	
	# Pilot gunnery skill modifier (lower is better)
	if pilot_data:
		base_chance += (5.0 - pilot_data.gunnery_skill) * 0.05
	
	# Range modifier (simplified)
	var distance = get_distance_to(target)
	base_chance -= distance * 0.05
	
	# Movement modifier
	if has_moved:
		base_chance -= 0.15
	
	# Target movement modifier
	if target.has_moved:
		base_chance -= 0.1
	
	return clamp(base_chance, 0.1, 0.95)

func calculate_weapon_damage(weapon_type: String) -> int:
	match weapon_type:
		"laser": return randi_range(8, 12)
		"autocannon": return randi_range(15, 20)
		"missile": return randi_range(12, 18)
		"basic": return randi_range(6, 10)
		_: return randi_range(5, 8)

func get_weapon_heat(weapon_type: String) -> int:
	match weapon_type:
		"laser": return 6
		"autocannon": return 2
		"missile": return 4
		"basic": return 3
		_: return 2

func get_heat_dissipation() -> int:
	var base_dissipation = 10  # Standard 10 heat sinks
	
	# Terrain effects (could be implemented)
	# if in_water: base_dissipation += 5
	
	return base_dissipation

func add_heat(amount: int, source: String = "") -> void:
	current_heat += amount
	current_heat = min(current_heat, 50)  # Cap at 50 for extreme heat
	heat_changed.emit(current_heat, max_heat)
	
	# Log heat addition for debugging
	print("%s gained %d heat from %s (Total: %d)" % [unit_name, amount, source, current_heat])

func apply_heat_effects() -> void:
	if current_heat >= max_heat:
		# Shutdown risk
		var shutdown_roll = randf()
		if shutdown_roll < 0.5:  # 50% chance to shut down at critical heat
			add_status_effect("shutdown")
			status_changed.emit("Emergency shutdown due to overheating!")

func take_damage(damage: int, location: String = "center_torso") -> void:
	# Apply damage to armor first, then structure
	if armor_sections.has(location):
		var armor_absorbed = min(damage, armor_sections[location])
		armor_sections[location] -= armor_absorbed
		damage -= armor_absorbed
	
	# Remaining damage goes to structure
	if damage > 0 and structure_sections.has(location):
		structure_sections[location] -= damage
		if structure_sections[location] <= 0:
			structure_sections[location] = 0
			add_critical_hit(location)
	
	# Recalculate health
	calculate_total_health()
	
	# Check for destruction
	if is_destroyed():
		unit_destroyed.emit(self)

func is_destroyed() -> bool:
	# Destroyed if center torso or head structure is gone
	var ct_structure = structure_sections.get("center_torso", 0)
	var head_structure = structure_sections.get("head", 0)
	return ct_structure <= 0 or head_structure <= 0

func add_critical_hit(location: String) -> void:
	var crit_description = location + "_destroyed"
	if not critical_hits.has(crit_description):
		critical_hits.append(crit_description)
		
		match location:
			"left_arm", "right_arm":
				status_changed.emit("Arm destroyed! Weapon systems offline.")
			"left_leg", "right_leg":
				max_movement_points = max(1, max_movement_points - 1)
				status_changed.emit("Leg destroyed! Movement reduced.")
			"head":
				status_changed.emit("Head critical! Pilot in extreme danger!")
			"center_torso":
				status_changed.emit("Center torso critical! Mech near destruction!")

func add_status_effect(effect: String) -> void:
	if not status_effects.has(effect):
		status_effects.append(effect)

func remove_status_effect(effect: String) -> void:
	status_effects.erase(effect)

func has_status_effect(effect: String) -> bool:
	return status_effects.has(effect)

func get_distance_to(other_unit: CombatUnit) -> int:
	# Use hex distance calculation
	var hex_grid = get_node_or_null("../HexGrid")
	if hex_grid:
		return hex_grid.get_hex_distance(hex_position, other_unit.hex_position)
	
	# Fallback to simple distance
	var diff = hex_position - other_unit.hex_position
	return max(abs(diff.x), abs(diff.y))

func get_status_summary() -> Dictionary:
	return {
		"health": current_health,
		"max_health": max_health,
		"health_percent": float(current_health) / float(max_health),
		"heat": current_heat,
		"max_heat": max_heat,
		"heat_percent": float(current_heat) / float(max_heat),
		"movement": movement_points,
		"max_movement": max_movement_points,
		"can_move": can_move(),
		"can_act": can_act(),
		"status_effects": status_effects.duplicate(),
		"critical_hits": critical_hits.duplicate()
	}