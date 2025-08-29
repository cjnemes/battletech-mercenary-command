class_name PilotData extends Resource

enum Skill { GUNNERY, PILOTING, TACTICS, LEADERSHIP }

@export var pilot_name: String = ""
@export var callsign: String = ""
@export var age: int = 25
@export var gender: String = ""
@export var portrait_path: String = ""

@export var gunnery_skill: int = 4
@export var piloting_skill: int = 5
@export var tactics_skill: int = 6
@export var leadership_skill: int = 7

@export var experience_points: int = 0
@export var missions_completed: int = 0
@export var kills_confirmed: int = 0

@export var morale: int = 100
@export var fatigue: int = 0
@export var injuries: Array[String] = []

@export var salary_monthly: int = 5000
@export var contract_length_months: int = 12
@export var loyalty: int = 50

@export var traits: Array[String] = []
@export var background: String = ""

var current_mech: String = ""

func get_skill_value(skill: Skill) -> int:
	match skill:
		Skill.GUNNERY: return gunnery_skill
		Skill.PILOTING: return piloting_skill
		Skill.TACTICS: return tactics_skill
		Skill.LEADERSHIP: return leadership_skill
		_: return 10

func set_skill_value(skill: Skill, value: int) -> void:
	var clamped_value = clamp(value, 1, 10)
	match skill:
		Skill.GUNNERY: gunnery_skill = clamped_value
		Skill.PILOTING: piloting_skill = clamped_value
		Skill.TACTICS: tactics_skill = clamped_value
		Skill.LEADERSHIP: leadership_skill = clamped_value

func get_monthly_cost() -> int:
	var base_cost = salary_monthly
	
	# Injured pilots cost extra for medical care
	if not injuries.is_empty():
		base_cost += 2000
	
	# Low morale pilots might demand bonuses
	if morale < 50:
		base_cost += 1000
	
	return base_cost

func improve_skill(skill: Skill, amount: int = 1) -> bool:
	var current_value = get_skill_value(skill)
	if current_value >= 10:
		return false
	
	set_skill_value(skill, current_value - amount)  # Lower is better in Battletech
	return true

func add_trait(trait: String) -> void:
	if not traits.has(trait):
		traits.append(trait)

func remove_trait(trait: String) -> void:
	traits.erase(trait)

func has_trait(trait: String) -> bool:
	return traits.has(trait)

func is_injured() -> bool:
	return not injuries.is_empty()

func is_combat_ready() -> bool:
	return not is_injured() and morale > 25 and fatigue < 75

func get_display_name() -> String:
	if callsign != "":
		return "\"%s\" %s" % [callsign, pilot_name]
	return pilot_name