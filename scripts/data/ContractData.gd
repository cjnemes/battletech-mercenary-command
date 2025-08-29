class_name ContractData extends Resource

enum ContractType { 
	GARRISON_DUTY, 
	RAID_MISSION, 
	ESCORT_MISSION, 
	PLANETARY_ASSAULT, 
	RECONNAISSANCE,
	PIRATE_HUNTING
}

enum DifficultyLevel { EASY, MODERATE, HARD, EXTREME }

@export var contract_id: String = ""
@export var contract_name: String = ""
@export var description: String = ""
@export var contract_type: ContractType = ContractType.GARRISON_DUTY
@export var difficulty: DifficultyLevel = DifficultyLevel.MODERATE

@export var employer_faction: String = ""
@export var target_faction: String = ""
@export var planet_name: String = ""
@export var system_name: String = ""

@export var base_payment: int = 50000
@export var success_bonus: int = 25000
@export var salvage_rights: bool = false
@export var advance_payment: float = 0.25  # 25% advance

@export var duration_days: int = 30
@export var travel_days: int = 7
@export var reputation_reward: int = 5
@export var reputation_penalty: int = -10

@export var required_mechs: int = 2
@export var max_mechs: int = 8
@export var battle_value_limit: int = 6000

@export var special_conditions: Array[String] = []
@export var objectives: Array[String] = []

func _init() -> void:
	contract_id = generate_contract_id()

func generate_contract_id() -> String:
	return "contract_" + str(Time.get_unix_time_from_system()) + "_" + str(randi())

func get_total_payment() -> int:
	return base_payment + success_bonus

func get_advance_amount() -> int:
	return int(base_payment * advance_payment)

func get_difficulty_string() -> String:
	match difficulty:
		DifficultyLevel.EASY: return "Easy"
		DifficultyLevel.MODERATE: return "Moderate"  
		DifficultyLevel.HARD: return "Hard"
		DifficultyLevel.EXTREME: return "Extreme"
		_: return "Unknown"

func get_type_string() -> String:
	match contract_type:
		ContractType.GARRISON_DUTY: return "Garrison Duty"
		ContractType.RAID_MISSION: return "Raid Mission"
		ContractType.ESCORT_MISSION: return "Escort Mission"
		ContractType.PLANETARY_ASSAULT: return "Planetary Assault"
		ContractType.RECONNAISSANCE: return "Reconnaissance"
		ContractType.PIRATE_HUNTING: return "Pirate Hunting"
		_: return "Unknown"

func get_difficulty_color() -> Color:
	match difficulty:
		DifficultyLevel.EASY: return Color.GREEN
		DifficultyLevel.MODERATE: return Color.YELLOW
		DifficultyLevel.HARD: return Color.ORANGE
		DifficultyLevel.EXTREME: return Color.RED
		_: return Color.WHITE

func is_available() -> bool:
	# Check if company meets requirements
	var company_manager = get_node_or_null("/root/CompanyManager")
	if not company_manager:
		return false
	
	var operational_mechs = company_manager.get_operational_mechs()
	return operational_mechs.size() >= required_mechs

func get_risk_assessment() -> String:
	match difficulty:
		DifficultyLevel.EASY: 
			return "Low risk operation. Minimal casualties expected."
		DifficultyLevel.MODERATE: 
			return "Standard mercenary work. Some risk of damage."
		DifficultyLevel.HARD: 
			return "High risk mission. Significant casualties possible."
		DifficultyLevel.EXTREME: 
			return "Extreme danger. Heavy losses likely."
		_: 
			return "Risk assessment unavailable."