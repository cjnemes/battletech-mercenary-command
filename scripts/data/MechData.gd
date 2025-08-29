class_name MechData extends Resource

enum WeightClass { LIGHT, MEDIUM, HEAVY, ASSAULT }
enum MechType { BIPED, QUAD }

@export var chassis_name: String = ""
@export var variant_name: String = ""
@export var tonnage: int = 50
@export var weight_class: WeightClass = WeightClass.MEDIUM
@export var mech_type: MechType = MechType.BIPED

@export var base_movement: int = 4
@export var jump_movement: int = 0
@export var max_heat_sinks: int = 10

@export var armor_head: int = 9
@export var armor_center_torso: int = 18
@export var armor_left_torso: int = 12
@export var armor_right_torso: int = 12
@export var armor_left_arm: int = 8
@export var armor_right_arm: int = 8
@export var armor_left_leg: int = 10
@export var armor_right_leg: int = 10

@export var structure_head: int = 3
@export var structure_center_torso: int = 8
@export var structure_left_torso: int = 6
@export var structure_right_torso: int = 6
@export var structure_left_arm: int = 4
@export var structure_right_arm: int = 4
@export var structure_left_leg: int = 5
@export var structure_right_leg: int = 5

@export var hardpoints: Dictionary = {
	"left_arm": {"energy": 1, "ballistic": 0, "missile": 0},
	"right_arm": {"energy": 1, "ballistic": 0, "missile": 0},
	"left_torso": {"energy": 0, "ballistic": 0, "missile": 1},
	"right_torso": {"energy": 0, "ballistic": 0, "missile": 1},
	"center_torso": {"energy": 0, "ballistic": 0, "missile": 0}
}

@export var base_cost: int = 1000000

func get_full_name() -> String:
	return chassis_name + " " + variant_name

func get_weight_class_string() -> String:
	match weight_class:
		WeightClass.LIGHT: return "Light"
		WeightClass.MEDIUM: return "Medium"
		WeightClass.HEAVY: return "Heavy"
		WeightClass.ASSAULT: return "Assault"
		_: return "Unknown"

func get_total_armor() -> int:
	return armor_head + armor_center_torso + armor_left_torso + armor_right_torso + \
		   armor_left_arm + armor_right_arm + armor_left_leg + armor_right_leg

func get_total_structure() -> int:
	return structure_head + structure_center_torso + structure_left_torso + structure_right_torso + \
		   structure_left_arm + structure_right_arm + structure_left_leg + structure_right_leg