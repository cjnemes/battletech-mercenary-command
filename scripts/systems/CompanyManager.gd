class_name CompanyManager extends Node

signal company_data_changed()
signal funds_changed(old_amount: int, new_amount: int)
signal personnel_hired(pilot_data: PilotData)
signal personnel_fired(pilot_id: String)
signal monthly_expenses_calculated(total: int)

var company_name: String = "Wolf's Dragoons"
var company_funds: int = 500000  # Starting funds: 500K C-Bills
var company_reputation: Dictionary = {
	"Steiner": 0,
	"Davion": 0,
	"Liao": 0,
	"Marik": 0,
	"Kurita": 0,
	"Mercenary": 25
}

var pilots: Dictionary = {}  # pilot_id -> PilotData
var mechs: Dictionary = {}   # mech_id -> MechUnit
var mech_database: MechDatabase
var contracts: Array[ContractData] = []
var completed_missions: int = 0

var monthly_income: int = 0
var monthly_expenses: int = 0

var event_bus: EventBus
var time_manager: TimeManager

func _ready() -> void:
	event_bus = get_node("/root/GameManager").event_bus
	time_manager = get_node("/root/GameManager").time_manager
	
	# Create mech database
	mech_database = MechDatabase.new()
	add_child(mech_database)
	
	if time_manager:
		time_manager.month_passed.connect(_on_month_passed)
	
	# Generate starting personnel
	generate_starting_company()

func generate_starting_company() -> void:
	# Create the player's starting pilot
	var player_pilot = PilotData.new()
	player_pilot.pilot_name = "Commander"
	player_pilot.callsign = "Boss"
	player_pilot.gunnery_skill = 3
	player_pilot.piloting_skill = 4
	player_pilot.tactics_skill = 3
	player_pilot.leadership_skill = 2
	player_pilot.salary_monthly = 10000
	player_pilot.loyalty = 100
	player_pilot.add_trait("Natural Leader")
	player_pilot.add_trait("Veteran")
	
	hire_pilot(player_pilot)
	
	# Add a few starting pilots
	for i in range(3):
		var pilot = generate_random_pilot()
		hire_pilot(pilot)
	
	# Add starting mechs
	generate_starting_mechs()

func generate_random_pilot() -> PilotData:
	var pilot = PilotData.new()
	
	var first_names = ["Alex", "Jordan", "Casey", "Morgan", "Riley", "Taylor", "Cameron", "Avery"]
	var last_names = ["Steel", "Wolf", "Hawk", "Cross", "Stone", "Blake", "Steiner", "Davion"]
	var callsigns = ["Falcon", "Viper", "Thunder", "Lightning", "Ghost", "Reaper", "Phantom", "Storm"]
	
	pilot.pilot_name = first_names.pick_random() + " " + last_names.pick_random()
	pilot.callsign = callsigns.pick_random()
	pilot.age = randi_range(22, 45)
	pilot.gender = ["Male", "Female", "Non-binary"].pick_random()
	
	# Generate skills (lower is better in Battletech)
	pilot.gunnery_skill = randi_range(3, 6)
	pilot.piloting_skill = randi_range(4, 7)
	pilot.tactics_skill = randi_range(5, 8)
	pilot.leadership_skill = randi_range(6, 9)
	
	# Base salary on skill level
	var skill_avg = (pilot.gunnery_skill + pilot.piloting_skill) / 2.0
	pilot.salary_monthly = int(8000 - (skill_avg * 500))  # Better pilots cost more
	
	pilot.morale = randi_range(60, 90)
	pilot.loyalty = randi_range(30, 60)
	
	# Random traits
	var possible_traits = ["Marksman", "Steady Hands", "Iron Will", "Lucky", "Cautious", "Aggressive"]
	if randf() < 0.3:  # 30% chance for a trait
		pilot.add_trait(possible_traits.pick_random())
	
	return pilot

func hire_pilot(pilot_data: PilotData) -> String:
	var pilot_id = generate_pilot_id()
	pilots[pilot_id] = pilot_data
	
	personnel_hired.emit(pilot_data)
	event_bus.funds_changed.emit(company_funds, company_funds)
	company_data_changed.emit()
	
	return pilot_id

func fire_pilot(pilot_id: String) -> bool:
	if not pilots.has(pilot_id):
		return false
	
	var pilot_data = pilots[pilot_id]
	
	# Pay severance (one month salary)
	var severance = pilot_data.salary_monthly
	if company_funds >= severance:
		modify_funds(-severance)
	
	pilots.erase(pilot_id)
	personnel_fired.emit(pilot_id)
	company_data_changed.emit()
	
	return true

func get_pilot_by_id(pilot_id: String) -> PilotData:
	return pilots.get(pilot_id, null)

func get_all_pilots() -> Array[PilotData]:
	var pilot_array: Array[PilotData] = []
	for pilot_data in pilots.values():
		pilot_array.append(pilot_data)
	return pilot_array

func modify_funds(amount: int) -> void:
	var old_funds = company_funds
	company_funds += amount
	
	# Prevent going below zero
	if company_funds < 0:
		company_funds = 0
	
	funds_changed.emit(old_funds, company_funds)
	event_bus.funds_changed.emit(old_funds, company_funds)

func calculate_monthly_expenses() -> int:
	var total = 0
	
	# Personnel salaries
	for pilot_data in pilots.values():
		total += pilot_data.get_monthly_cost()
	
	# Mech maintenance
	for mech_unit in mechs.values():
		total += mech_unit.get_monthly_maintenance_cost()
	
	# Base operating costs
	total += 25000  # Dropship fuel, admin costs, etc.
	
	monthly_expenses = total
	monthly_expenses_calculated.emit(total)
	
	return total

func get_company_rating() -> String:
	var total_pilots = pilots.size()
	var avg_skill = 0.0
	
	for pilot_data in pilots.values():
		avg_skill += (pilot_data.gunnery_skill + pilot_data.piloting_skill) / 2.0
	
	if total_pilots > 0:
		avg_skill /= total_pilots
	
	if total_pilots >= 12 and avg_skill <= 4:
		return "Elite"
	elif total_pilots >= 8 and avg_skill <= 5:
		return "Veteran"
	elif total_pilots >= 4 and avg_skill <= 6:
		return "Regular"
	else:
		return "Green"

func get_reputation_with_faction(faction: String) -> int:
	return company_reputation.get(faction, 0)

func modify_reputation(faction: String, amount: int) -> void:
	var old_rep = get_reputation_with_faction(faction)
	var new_rep = clamp(old_rep + amount, -100, 100)
	company_reputation[faction] = new_rep
	
	event_bus.reputation_changed.emit(faction, old_rep, new_rep)

func generate_pilot_id() -> String:
	return "pilot_" + str(Time.get_unix_time_from_system()) + "_" + str(randi())

func get_save_data() -> Dictionary:
	var save_data = {
		"company_name": company_name,
		"company_funds": company_funds,
		"company_reputation": company_reputation,
		"completed_missions": completed_missions,
		"pilots": {},
		"mechs": {}
	}
	
	# Serialize pilots
	for pilot_id in pilots.keys():
		var pilot_data = pilots[pilot_id]
		save_data.pilots[pilot_id] = {
			"pilot_name": pilot_data.pilot_name,
			"callsign": pilot_data.callsign,
			"age": pilot_data.age,
			"gender": pilot_data.gender,
			"gunnery_skill": pilot_data.gunnery_skill,
			"piloting_skill": pilot_data.piloting_skill,
			"tactics_skill": pilot_data.tactics_skill,
			"leadership_skill": pilot_data.leadership_skill,
			"salary_monthly": pilot_data.salary_monthly,
			"morale": pilot_data.morale,
			"loyalty": pilot_data.loyalty,
			"traits": pilot_data.traits,
			"injuries": pilot_data.injuries,
			"experience_points": pilot_data.experience_points,
			"missions_completed": pilot_data.missions_completed,
			"kills_confirmed": pilot_data.kills_confirmed
		}
	
	return save_data

func load_save_data(save_data: Dictionary) -> void:
	company_name = save_data.get("company_name", "Wolf's Dragoons")
	company_funds = save_data.get("company_funds", 500000)
	company_reputation = save_data.get("company_reputation", {})
	completed_missions = save_data.get("completed_missions", 0)
	
	# Load pilots
	pilots.clear()
	var pilots_data = save_data.get("pilots", {})
	for pilot_id in pilots_data.keys():
		var pilot_info = pilots_data[pilot_id]
		var pilot_data = PilotData.new()
		
		pilot_data.pilot_name = pilot_info.get("pilot_name", "")
		pilot_data.callsign = pilot_info.get("callsign", "")
		pilot_data.age = pilot_info.get("age", 25)
		pilot_data.gender = pilot_info.get("gender", "")
		pilot_data.gunnery_skill = pilot_info.get("gunnery_skill", 5)
		pilot_data.piloting_skill = pilot_info.get("piloting_skill", 6)
		pilot_data.tactics_skill = pilot_info.get("tactics_skill", 7)
		pilot_data.leadership_skill = pilot_info.get("leadership_skill", 8)
		pilot_data.salary_monthly = pilot_info.get("salary_monthly", 5000)
		pilot_data.morale = pilot_info.get("morale", 50)
		pilot_data.loyalty = pilot_info.get("loyalty", 50)
		pilot_data.traits = pilot_info.get("traits", [])
		pilot_data.injuries = pilot_info.get("injuries", [])
		pilot_data.experience_points = pilot_info.get("experience_points", 0)
		pilot_data.missions_completed = pilot_info.get("missions_completed", 0)
		pilot_data.kills_confirmed = pilot_info.get("kills_confirmed", 0)
		
		pilots[pilot_id] = pilot_data

func generate_starting_mechs() -> void:
	# Give player a medium mech to start
	var centurion_data = mech_database.get_chassis_by_variant("CN9-A")
	if centurion_data:
		var centurion_unit = MechUnit.new(centurion_data)
		add_mech(centurion_unit)
	
	# Add a few light mechs
	var commando_data = mech_database.get_chassis_by_variant("COM-2D")
	if commando_data:
		var commando_unit = MechUnit.new(commando_data)
		add_mech(commando_unit)
	
	var locust_data = mech_database.get_chassis_by_variant("LCT-1V")
	if locust_data:
		var locust_unit = MechUnit.new(locust_data)
		add_mech(locust_unit)

func add_mech(mech_unit: MechUnit) -> String:
	var mech_id = mech_unit.unit_id
	mechs[mech_id] = mech_unit
	company_data_changed.emit()
	return mech_id

func remove_mech(mech_id: String) -> bool:
	if not mechs.has(mech_id):
		return false
	
	var mech_unit = mechs[mech_id]
	
	# Unassign pilot if assigned
	if mech_unit.pilot_id != "":
		mech_unit.unassign_pilot()
	
	mechs.erase(mech_id)
	company_data_changed.emit()
	return true

func get_mech_by_id(mech_id: String) -> MechUnit:
	return mechs.get(mech_id, null)

func get_all_mechs() -> Array[MechUnit]:
	var mech_array: Array[MechUnit] = []
	for mech_unit in mechs.values():
		mech_array.append(mech_unit)
	return mech_array

func get_operational_mechs() -> Array[MechUnit]:
	var operational: Array[MechUnit] = []
	for mech_unit in mechs.values():
		if mech_unit.is_operational():
			operational.append(mech_unit)
	return operational

func assign_pilot_to_mech(pilot_id: String, mech_id: String) -> bool:
	if not pilots.has(pilot_id) or not mechs.has(mech_id):
		return false
	
	var pilot_data = pilots[pilot_id]
	var mech_unit = mechs[mech_id]
	
	# Unassign from current mech if any
	unassign_pilot_from_all_mechs(pilot_id)
	
	# Assign to new mech
	mech_unit.assign_pilot(pilot_id)
	pilot_data.current_mech = mech_id
	
	company_data_changed.emit()
	return true

func unassign_pilot_from_all_mechs(pilot_id: String) -> void:
	for mech_unit in mechs.values():
		if mech_unit.pilot_id == pilot_id:
			mech_unit.unassign_pilot()
	
	if pilots.has(pilot_id):
		pilots[pilot_id].current_mech = ""

func _on_month_passed(current_month: int) -> void:
	var expenses = calculate_monthly_expenses()
	modify_funds(-expenses)
	
	# Update pilot morale and loyalty
	for pilot_data in pilots.values():
		# Morale effects
		if company_funds < expenses * 2:  # Less than 2 months operating funds
			pilot_data.morale -= 5
		
		pilot_data.morale = clamp(pilot_data.morale, 0, 100)
	
	# Update mech repairs
	for mech_unit in mechs.values():
		if mech_unit.maintenance_status == "in_repair":
			mech_unit.repair_days_remaining -= 30  # One month
			if mech_unit.repair_days_remaining <= 0:
				mech_unit.complete_repairs()