class_name MechUnit extends Resource

@export var unit_id: String = ""
@export var mech_data: MechData
@export var pilot_id: String = ""  # ID of assigned pilot

@export var current_armor: Dictionary = {}
@export var current_structure: Dictionary = {}
@export var current_heat: int = 0

@export var installed_weapons: Dictionary = {}  # location -> Array[WeaponData]
@export var installed_equipment: Dictionary = {}  # location -> Array[EquipmentData]
@export var heat_sinks: int = 10

@export var damage_conditions: Array[String] = []  # "head_damaged", "left_arm_destroyed", etc.
@export var critical_hits: Dictionary = {}  # location -> Array[String]

@export var maintenance_status: String = "operational"  # "operational", "needs_repair", "in_repair"
@export var repair_days_remaining: int = 0

var experience_points: int = 0
var missions_completed: int = 0
var kills_confirmed: int = 0

func _init(chassis_data: MechData = null) -> void:
	if chassis_data:
		mech_data = chassis_data
		unit_id = generate_unit_id()
		initialize_condition()

func initialize_condition() -> void:
	if not mech_data:
		return
	
	# Initialize armor to full
	current_armor = {
		"head": mech_data.armor_head,
		"center_torso": mech_data.armor_center_torso,
		"left_torso": mech_data.armor_left_torso,
		"right_torso": mech_data.armor_right_torso,
		"left_arm": mech_data.armor_left_arm,
		"right_arm": mech_data.armor_right_arm,
		"left_leg": mech_data.armor_left_leg,
		"right_leg": mech_data.armor_right_leg
	}
	
	# Initialize structure to full
	current_structure = {
		"head": mech_data.structure_head,
		"center_torso": mech_data.structure_center_torso,
		"left_torso": mech_data.structure_left_torso,
		"right_torso": mech_data.structure_right_torso,
		"left_arm": mech_data.structure_left_arm,
		"right_arm": mech_data.structure_right_arm,
		"left_leg": mech_data.structure_left_leg,
		"right_leg": mech_data.structure_right_leg
	}
	
	heat_sinks = mech_data.max_heat_sinks
	maintenance_status = "operational"

func get_display_name() -> String:
	if mech_data:
		return mech_data.get_full_name()
	return "Unknown Mech"

func get_pilot_name() -> String:
	if pilot_id == "":
		return "Unassigned"
	
	# Get pilot data from CompanyManager
	var company_manager = get_node_or_null("/root/CompanyManager")
	if company_manager:
		var pilot_data = company_manager.get_pilot_by_id(pilot_id)
		if pilot_data:
			return pilot_data.get_display_name()
	
	return "Unknown Pilot"

func assign_pilot(new_pilot_id: String) -> void:
	pilot_id = new_pilot_id

func unassign_pilot() -> void:
	pilot_id = ""

func is_operational() -> bool:
	return maintenance_status == "operational" and not is_destroyed()

func is_destroyed() -> bool:
	# Mech is destroyed if center torso is destroyed or head is destroyed
	return (damage_conditions.has("center_torso_destroyed") or 
			damage_conditions.has("head_destroyed"))

func needs_repair() -> bool:
	return maintenance_status == "needs_repair" or get_total_damage_percent() > 0

func get_armor_percent(location: String) -> float:
	if not mech_data or not current_armor.has(location):
		return 0.0
	
	var max_armor = get_max_armor(location)
	if max_armor == 0:
		return 0.0
	
	return float(current_armor[location]) / float(max_armor)

func get_structure_percent(location: String) -> float:
	if not mech_data or not current_structure.has(location):
		return 0.0
	
	var max_structure = get_max_structure(location)
	if max_structure == 0:
		return 0.0
	
	return float(current_structure[location]) / float(max_structure)

func get_max_armor(location: String) -> int:
	if not mech_data:
		return 0
	
	match location:
		"head": return mech_data.armor_head
		"center_torso": return mech_data.armor_center_torso
		"left_torso": return mech_data.armor_left_torso
		"right_torso": return mech_data.armor_right_torso
		"left_arm": return mech_data.armor_left_arm
		"right_arm": return mech_data.armor_right_arm
		"left_leg": return mech_data.armor_left_leg
		"right_leg": return mech_data.armor_right_leg
		_: return 0

func get_max_structure(location: String) -> int:
	if not mech_data:
		return 0
	
	match location:
		"head": return mech_data.structure_head
		"center_torso": return mech_data.structure_center_torso
		"left_torso": return mech_data.structure_left_torso
		"right_torso": return mech_data.structure_right_torso
		"left_arm": return mech_data.structure_left_arm
		"right_arm": return mech_data.structure_right_arm
		"left_leg": return mech_data.structure_left_leg
		"right_leg": return mech_data.structure_right_leg
		_: return 0

func get_total_damage_percent() -> float:
	var total_damage = 0.0
	var total_capacity = 0.0
	
	for location in current_armor.keys():
		var max_armor = get_max_armor(location)
		var max_structure = get_max_structure(location)
		var current_total = current_armor[location] + current_structure[location]
		var max_total = max_armor + max_structure
		
		total_damage += max_total - current_total
		total_capacity += max_total
	
	if total_capacity == 0:
		return 0.0
	
	return total_damage / total_capacity

func get_monthly_maintenance_cost() -> int:
	if not mech_data:
		return 0
	
	var base_cost = mech_data.tonnage * 100  # 100 C-Bills per ton base cost
	
	# Damaged mechs cost more to maintain
	var damage_multiplier = 1.0 + get_total_damage_percent()
	
	# In-repair mechs have additional costs
	if maintenance_status == "in_repair":
		damage_multiplier *= 1.5
	
	return int(base_cost * damage_multiplier)

func start_repairs() -> void:
	if maintenance_status != "needs_repair":
		return
	
	maintenance_status = "in_repair"
	
	# Calculate repair time based on damage
	var damage_percent = get_total_damage_percent()
	repair_days_remaining = max(1, int(damage_percent * 30))  # Up to 30 days for full repair

func complete_repairs() -> void:
	if maintenance_status != "in_repair":
		return
	
	# Restore armor and structure
	initialize_condition()
	maintenance_status = "operational"
	repair_days_remaining = 0
	damage_conditions.clear()
	critical_hits.clear()

func generate_unit_id() -> String:
	return "mech_" + str(Time.get_unix_time_from_system()) + "_" + str(randi())

func get_battle_value() -> int:
	if not mech_data:
		return 0
	
	# Simple BV calculation based on tonnage and weapons
	var base_bv = mech_data.tonnage * 10
	
	# Add weapon values (will implement when weapons are added)
	# for weapons in installed_weapons.values():
	#     for weapon in weapons:
	#         base_bv += weapon.battle_value
	
	# Reduce BV based on damage
	var damage_modifier = 1.0 - (get_total_damage_percent() * 0.5)
	
	return int(base_bv * damage_modifier)