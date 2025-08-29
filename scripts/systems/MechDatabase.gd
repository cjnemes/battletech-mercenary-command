class_name MechDatabase extends Node

var mech_chassis: Dictionary = {}

func _ready() -> void:
	initialize_database()

func initialize_database() -> void:
	create_light_mechs()
	create_medium_mechs()
	create_heavy_mechs()
	create_assault_mechs()

func create_light_mechs() -> void:
	# Locust LCT-1V
	var locust = MechData.new()
	locust.chassis_name = "Locust"
	locust.variant_name = "LCT-1V"
	locust.tonnage = 20
	locust.weight_class = MechData.WeightClass.LIGHT
	locust.base_movement = 8
	locust.jump_movement = 0
	locust.max_heat_sinks = 10
	
	locust.armor_head = 6
	locust.armor_center_torso = 8
	locust.armor_left_torso = 6
	locust.armor_right_torso = 6
	locust.armor_left_arm = 4
	locust.armor_right_arm = 4
	locust.armor_left_leg = 6
	locust.armor_right_leg = 6
	
	locust.structure_head = 3
	locust.structure_center_torso = 6
	locust.structure_left_torso = 5
	locust.structure_right_torso = 5
	locust.structure_left_arm = 3
	locust.structure_right_arm = 3
	locust.structure_left_leg = 4
	locust.structure_right_leg = 4
	
	locust.base_cost = 1574400
	mech_chassis["LCT-1V"] = locust
	
	# Commando COM-2D
	var commando = MechData.new()
	commando.chassis_name = "Commando"
	commando.variant_name = "COM-2D"
	commando.tonnage = 25
	commando.weight_class = MechData.WeightClass.LIGHT
	commando.base_movement = 6
	commando.jump_movement = 6
	commando.max_heat_sinks = 10
	
	commando.armor_head = 8
	commando.armor_center_torso = 12
	commando.armor_left_torso = 8
	commando.armor_right_torso = 8
	commando.armor_left_arm = 6
	commando.armor_right_arm = 6
	commando.armor_left_leg = 8
	commando.armor_right_leg = 8
	
	commando.structure_head = 3
	commando.structure_center_torso = 8
	commando.structure_left_torso = 6
	commando.structure_right_torso = 6
	commando.structure_left_arm = 4
	commando.structure_right_arm = 4
	commando.structure_left_leg = 6
	commando.structure_right_leg = 6
	
	commando.base_cost = 2674060
	mech_chassis["COM-2D"] = commando

func create_medium_mechs() -> void:
	# Centurion CN9-A
	var centurion = MechData.new()
	centurion.chassis_name = "Centurion"
	centurion.variant_name = "CN9-A"
	centurion.tonnage = 50
	centurion.weight_class = MechData.WeightClass.MEDIUM
	centurion.base_movement = 4
	centurion.jump_movement = 0
	centurion.max_heat_sinks = 13
	
	centurion.armor_head = 9
	centurion.armor_center_torso = 16
	centurion.armor_left_torso = 12
	centurion.armor_right_torso = 12
	centurion.armor_left_arm = 8
	centurion.armor_right_arm = 8
	centurion.armor_left_leg = 12
	centurion.armor_right_leg = 12
	
	centurion.structure_head = 3
	centurion.structure_center_torso = 16
	centurion.structure_left_torso = 12
	centurion.structure_right_torso = 12
	centurion.structure_left_arm = 8
	centurion.structure_right_arm = 8
	centurion.structure_left_leg = 12
	centurion.structure_right_leg = 12
	
	centurion.hardpoints = {
		"left_arm": {"energy": 0, "ballistic": 0, "missile": 0},
		"right_arm": {"energy": 0, "ballistic": 1, "missile": 1},
		"left_torso": {"energy": 1, "ballistic": 0, "missile": 1},
		"right_torso": {"energy": 0, "ballistic": 0, "missile": 0},
		"center_torso": {"energy": 0, "ballistic": 0, "missile": 0}
	}
	
	centurion.base_cost = 4175375
	mech_chassis["CN9-A"] = centurion
	
	# Hunchback HBK-4G
	var hunchback = MechData.new()
	hunchback.chassis_name = "Hunchback"
	hunchback.variant_name = "HBK-4G"
	hunchback.tonnage = 50
	hunchback.weight_class = MechData.WeightClass.MEDIUM
	hunchback.base_movement = 4
	hunchback.jump_movement = 0
	hunchback.max_heat_sinks = 13
	
	hunchback.armor_head = 9
	hunchback.armor_center_torso = 20
	hunchback.armor_left_torso = 13
	hunchback.armor_right_torso = 13
	hunchback.armor_left_arm = 8
	hunchback.armor_right_arm = 8
	hunchback.armor_left_leg = 11
	hunchback.armor_right_leg = 11
	
	hunchback.structure_head = 3
	hunchback.structure_center_torso = 16
	hunchback.structure_left_torso = 12
	hunchback.structure_right_torso = 12
	hunchback.structure_left_arm = 8
	hunchback.structure_right_arm = 8
	hunchback.structure_left_leg = 12
	hunchback.structure_right_leg = 12
	
	hunchback.hardpoints = {
		"left_arm": {"energy": 2, "ballistic": 0, "missile": 0},
		"right_arm": {"energy": 0, "ballistic": 0, "missile": 0},
		"left_torso": {"energy": 0, "ballistic": 0, "missile": 0},
		"right_torso": {"energy": 0, "ballistic": 1, "missile": 0},
		"center_torso": {"energy": 0, "ballistic": 0, "missile": 0}
	}
	
	hunchback.base_cost = 3467876
	mech_chassis["HBK-4G"] = hunchback

func create_heavy_mechs() -> void:
	# Catapult CPLT-C1
	var catapult = MechData.new()
	catapult.chassis_name = "Catapult"
	catapult.variant_name = "CPLT-C1"
	catapult.tonnage = 65
	catapult.weight_class = MechData.WeightClass.HEAVY
	catapult.base_movement = 4
	catapult.jump_movement = 4
	catapult.max_heat_sinks = 14
	
	catapult.armor_head = 9
	catapult.armor_center_torso = 18
	catapult.armor_left_torso = 15
	catapult.armor_right_torso = 15
	catapult.armor_left_arm = 10
	catapult.armor_right_arm = 10
	catapult.armor_left_leg = 15
	catapult.armor_right_leg = 15
	
	catapult.structure_head = 3
	catapult.structure_center_torso = 21
	catapult.structure_left_torso = 16
	catapult.structure_right_torso = 16
	catapult.structure_left_arm = 11
	catapult.structure_right_arm = 11
	catapult.structure_left_leg = 16
	catapult.structure_right_leg = 16
	
	catapult.hardpoints = {
		"left_arm": {"energy": 0, "ballistic": 0, "missile": 1},
		"right_arm": {"energy": 0, "ballistic": 0, "missile": 1},
		"left_torso": {"energy": 2, "ballistic": 0, "missile": 0},
		"right_torso": {"energy": 2, "ballistic": 0, "missile": 0},
		"center_torso": {"energy": 0, "ballistic": 0, "missile": 0}
	}
	
	catapult.base_cost = 5790376
	mech_chassis["CPLT-C1"] = catapult
	
	# Warhammer WHM-6R
	var warhammer = MechData.new()
	warhammer.chassis_name = "Warhammer"
	warhammer.variant_name = "WHM-6R"
	warhammer.tonnage = 70
	warhammer.weight_class = MechData.WeightClass.HEAVY
	warhammer.base_movement = 4
	warhammer.jump_movement = 0
	warhammer.max_heat_sinks = 17
	
	warhammer.armor_head = 9
	warhammer.armor_center_torso = 22
	warhammer.armor_left_torso = 15
	warhammer.armor_right_torso = 15
	warhammer.armor_left_arm = 14
	warhammer.armor_right_arm = 14
	warhammer.armor_left_leg = 18
	warhammer.armor_right_leg = 18
	
	warhammer.structure_head = 3
	warhammer.structure_center_torso = 22
	warhammer.structure_left_torso = 17
	warhammer.structure_right_torso = 17
	warhammer.structure_left_arm = 11
	warhammer.structure_right_arm = 11
	warhammer.structure_left_leg = 17
	warhammer.structure_right_leg = 17
	
	warhammer.hardpoints = {
		"left_arm": {"energy": 1, "ballistic": 0, "missile": 1},
		"right_arm": {"energy": 1, "ballistic": 0, "missile": 1},
		"left_torso": {"energy": 1, "ballistic": 0, "missile": 0},
		"right_torso": {"energy": 1, "ballistic": 0, "missile": 0},
		"center_torso": {"energy": 0, "ballistic": 0, "missile": 0}
	}
	
	warhammer.base_cost = 5431425
	mech_chassis["WHM-6R"] = warhammer

func create_assault_mechs() -> void:
	# Atlas AS7-D
	var atlas = MechData.new()
	atlas.chassis_name = "Atlas"
	atlas.variant_name = "AS7-D"
	atlas.tonnage = 100
	atlas.weight_class = MechData.WeightClass.ASSAULT
	atlas.base_movement = 3
	atlas.jump_movement = 0
	atlas.max_heat_sinks = 20
	
	atlas.armor_head = 9
	atlas.armor_center_torso = 47
	atlas.armor_left_torso = 32
	atlas.armor_right_torso = 32
	atlas.armor_left_arm = 34
	atlas.armor_right_arm = 34
	atlas.armor_left_leg = 41
	atlas.armor_right_leg = 41
	
	atlas.structure_head = 3
	atlas.structure_center_torso = 31
	atlas.structure_left_torso = 24
	atlas.structure_right_torso = 24
	atlas.structure_left_arm = 17
	atlas.structure_right_arm = 17
	atlas.structure_left_leg = 24
	atlas.structure_right_leg = 24
	
	atlas.hardpoints = {
		"left_arm": {"energy": 0, "ballistic": 0, "missile": 1},
		"right_arm": {"energy": 1, "ballistic": 1, "missile": 0},
		"left_torso": {"energy": 1, "ballistic": 0, "missile": 1},
		"right_torso": {"energy": 1, "ballistic": 0, "missile": 0},
		"center_torso": {"energy": 0, "ballistic": 0, "missile": 0}
	}
	
	atlas.base_cost = 9682000
	mech_chassis["AS7-D"] = atlas
	
	# BattleMaster BLR-1G
	var battlemaster = MechData.new()
	battlemaster.chassis_name = "BattleMaster"
	battlemaster.variant_name = "BLR-1G"
	battlemaster.tonnage = 85
	battlemaster.weight_class = MechData.WeightClass.ASSAULT
	battlemaster.base_movement = 4
	battlemaster.jump_movement = 0
	battlemaster.max_heat_sinks = 16
	
	battlemaster.armor_head = 9
	battlemaster.armor_center_torso = 31
	battlemaster.armor_left_torso = 24
	battlemaster.armor_right_torso = 24
	battlemaster.armor_left_arm = 28
	battlemaster.armor_right_arm = 28
	battlemaster.armor_left_leg = 36
	battlemaster.armor_right_leg = 36
	
	battlemaster.structure_head = 3
	battlemaster.structure_center_torso = 27
	battlemaster.structure_left_torso = 21
	battlemaster.structure_right_torso = 21
	battlemaster.structure_left_arm = 14
	battlemaster.structure_right_arm = 14
	battlemaster.structure_left_leg = 21
	battlemaster.structure_right_leg = 21
	
	battlemaster.hardpoints = {
		"left_arm": {"energy": 0, "ballistic": 0, "missile": 0},
		"right_arm": {"energy": 1, "ballistic": 0, "missile": 0},
		"left_torso": {"energy": 1, "ballistic": 0, "missile": 1},
		"right_torso": {"energy": 1, "ballistic": 0, "missile": 1},
		"center_torso": {"energy": 0, "ballistic": 0, "missile": 0}
	}
	
	battlemaster.base_cost = 8103676
	mech_chassis["BLR-1G"] = battlemaster

func get_chassis_by_variant(variant: String) -> MechData:
	return mech_chassis.get(variant, null)

func get_all_chassis() -> Array[MechData]:
	var chassis_array: Array[MechData] = []
	for mech_data in mech_chassis.values():
		chassis_array.append(mech_data)
	return chassis_array

func get_chassis_by_weight_class(weight_class: MechData.WeightClass) -> Array[MechData]:
	var filtered_chassis: Array[MechData] = []
	for mech_data in mech_chassis.values():
		if mech_data.weight_class == weight_class:
			filtered_chassis.append(mech_data)
	return filtered_chassis

func get_random_chassis() -> MechData:
	var chassis_list = get_all_chassis()
	if chassis_list.is_empty():
		return null
	return chassis_list.pick_random()

func get_random_chassis_by_weight(weight_class: MechData.WeightClass) -> MechData:
	var chassis_list = get_chassis_by_weight_class(weight_class)
	if chassis_list.is_empty():
		return null
	return chassis_list.pick_random()