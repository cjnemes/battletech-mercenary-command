class_name ContractGenerator extends Node

var faction_names: Array[String] = [
	"Lyran Commonwealth", "Federated Suns", "Capellan Confederation",
	"Free Worlds League", "Draconis Combine", "Mercenary Review Commission",
	"ComStar", "Word of Blake"
]

var planet_names: Array[String] = [
	"New Avalon", "Tharkad", "Sian", "Atreus", "Luthien", "Terra",
	"Solaris VII", "Outreach", "Galatea", "Arc-Royal", "Davion Prime",
	"Steiner Holdings", "Liao Territory", "Marik Space", "Kurita Worlds"
]

var system_names: Array[String] = [
	"Davion System", "Steiner System", "Liao System", "Marik System",
	"Kurita System", "Periphery Rim", "Inner Sphere Core", "Border Worlds"
]

var contract_prefixes: Array[String] = [
	"Operation", "Mission", "Contract", "Assignment", "Campaign"
]

var contract_suffixes: Array[String] = [
	"Thunderbolt", "Steel Rain", "Iron Fist", "Lightning Strike",
	"Hammer Fall", "Storm Front", "Fire Lance", "Phoenix Rising",
	"Wolf Pack", "Dragon's Breath", "Eagle's Talon", "Crimson Dawn"
]

func generate_random_contract(difficulty_bias: ContractData.DifficultyLevel = ContractData.DifficultyLevel.MODERATE) -> ContractData:
	var contract = ContractData.new()
	
	# Basic info
	contract.contract_name = generate_contract_name()
	contract.employer_faction = faction_names.pick_random()
	contract.planet_name = planet_names.pick_random()
	contract.system_name = system_names.pick_random()
	
	# Type and difficulty
	contract.contract_type = ContractData.ContractType.values().pick_random()
	contract.difficulty = generate_difficulty(difficulty_bias)
	
	# Target faction (different from employer)
	var potential_targets = faction_names.duplicate()
	potential_targets.erase(contract.employer_faction)
	contract.target_faction = potential_targets.pick_random()
	
	# Payment and conditions
	configure_contract_rewards(contract)
	configure_contract_requirements(contract)
	configure_contract_description(contract)
	
	return contract

func generate_contract_name() -> String:
	var prefix = contract_prefixes.pick_random()
	var suffix = contract_suffixes.pick_random()
	return prefix + " " + suffix

func generate_difficulty(bias: ContractData.DifficultyLevel) -> ContractData.DifficultyLevel:
	# Weight towards the bias difficulty
	var roll = randf()
	
	match bias:
		ContractData.DifficultyLevel.EASY:
			if roll < 0.5: return ContractData.DifficultyLevel.EASY
			elif roll < 0.8: return ContractData.DifficultyLevel.MODERATE
			else: return ContractData.DifficultyLevel.HARD
		
		ContractData.DifficultyLevel.MODERATE:
			if roll < 0.2: return ContractData.DifficultyLevel.EASY
			elif roll < 0.6: return ContractData.DifficultyLevel.MODERATE
			elif roll < 0.85: return ContractData.DifficultyLevel.HARD
			else: return ContractData.DifficultyLevel.EXTREME
		
		ContractData.DifficultyLevel.HARD:
			if roll < 0.1: return ContractData.DifficultyLevel.MODERATE
			elif roll < 0.5: return ContractData.DifficultyLevel.HARD
			else: return ContractData.DifficultyLevel.EXTREME
		
		ContractData.DifficultyLevel.EXTREME:
			if roll < 0.2: return ContractData.DifficultyLevel.HARD
			else: return ContractData.DifficultyLevel.EXTREME
		
		_:
			return ContractData.DifficultyLevel.MODERATE

func configure_contract_rewards(contract: ContractData) -> void:
	# Base payment scales with difficulty and type
	var base_amount = 50000
	
	# Difficulty multiplier
	match contract.difficulty:
		ContractData.DifficultyLevel.EASY: base_amount = 30000
		ContractData.DifficultyLevel.MODERATE: base_amount = 50000
		ContractData.DifficultyLevel.HARD: base_amount = 80000
		ContractData.DifficultyLevel.EXTREME: base_amount = 120000
	
	# Type multiplier
	match contract.contract_type:
		ContractData.ContractType.GARRISON_DUTY: 
			base_amount = int(base_amount * 0.8)
		ContractData.ContractType.RAID_MISSION: 
			base_amount = int(base_amount * 1.2)
		ContractData.ContractType.PLANETARY_ASSAULT: 
			base_amount = int(base_amount * 1.5)
		ContractData.ContractType.RECONNAISSANCE: 
			base_amount = int(base_amount * 0.9)
		ContractData.ContractType.PIRATE_HUNTING: 
			base_amount = int(base_amount * 1.1)
	
	contract.base_payment = base_amount
	contract.success_bonus = int(base_amount * 0.5)
	
	# Salvage rights more common on harder missions
	var salvage_chance = 0.3
	if contract.difficulty == ContractData.DifficultyLevel.HARD:
		salvage_chance = 0.5
	elif contract.difficulty == ContractData.DifficultyLevel.EXTREME:
		salvage_chance = 0.7
	
	contract.salvage_rights = randf() < salvage_chance
	
	# Reputation rewards
	match contract.difficulty:
		ContractData.DifficultyLevel.EASY: 
			contract.reputation_reward = 3
			contract.reputation_penalty = -5
		ContractData.DifficultyLevel.MODERATE: 
			contract.reputation_reward = 5
			contract.reputation_penalty = -8
		ContractData.DifficultyLevel.HARD: 
			contract.reputation_reward = 8
			contract.reputation_penalty = -12
		ContractData.DifficultyLevel.EXTREME: 
			contract.reputation_reward = 12
			contract.reputation_penalty = -15

func configure_contract_requirements(contract: ContractData) -> void:
	# Duration varies by type
	match contract.contract_type:
		ContractData.ContractType.GARRISON_DUTY:
			contract.duration_days = randi_range(60, 120)
			contract.required_mechs = randi_range(2, 4)
		ContractData.ContractType.RAID_MISSION:
			contract.duration_days = randi_range(14, 30)
			contract.required_mechs = randi_range(4, 6)
		ContractData.ContractType.ESCORT_MISSION:
			contract.duration_days = randi_range(21, 45)
			contract.required_mechs = randi_range(2, 4)
		ContractData.ContractType.PLANETARY_ASSAULT:
			contract.duration_days = randi_range(45, 90)
			contract.required_mechs = randi_range(6, 8)
		ContractData.ContractType.RECONNAISSANCE:
			contract.duration_days = randi_range(14, 21)
			contract.required_mechs = randi_range(1, 3)
		ContractData.ContractType.PIRATE_HUNTING:
			contract.duration_days = randi_range(30, 60)
			contract.required_mechs = randi_range(3, 5)
	
	contract.max_mechs = min(8, contract.required_mechs + randi_range(2, 4))
	contract.travel_days = randi_range(3, 14)
	
	# Battle value limits
	match contract.difficulty:
		ContractData.DifficultyLevel.EASY: 
			contract.battle_value_limit = 4000
		ContractData.DifficultyLevel.MODERATE: 
			contract.battle_value_limit = 6000
		ContractData.DifficultyLevel.HARD: 
			contract.battle_value_limit = 8000
		ContractData.DifficultyLevel.EXTREME: 
			contract.battle_value_limit = 10000

func configure_contract_description(contract: ContractData) -> void:
	var description = ""
	var objectives: Array[String] = []
	var conditions: Array[String] = []
	
	match contract.contract_type:
		ContractData.ContractType.GARRISON_DUTY:
			description = "Defend %s from potential threats. Maintain peace and security in the region." % contract.planet_name
			objectives = ["Defend assigned territory", "Respond to security threats", "Maintain unit readiness"]
			if randf() < 0.3:
				conditions.append("No civilian casualties allowed")
		
		ContractData.ContractType.RAID_MISSION:
			description = "Conduct lightning strike against %s forces on %s. Hit hard and fast." % [contract.target_faction, contract.planet_name]
			objectives = ["Destroy primary target", "Minimize own casualties", "Extract before reinforcements arrive"]
			if randf() < 0.4:
				conditions.append("Salvage bonus for enemy equipment")
		
		ContractData.ContractType.ESCORT_MISSION:
			description = "Provide security escort for critical personnel/cargo traveling to %s." % contract.planet_name
			objectives = ["Protect escort target", "Maintain schedule", "Neutralize threats"]
			if randf() < 0.2:
				conditions.append("VIP must survive - mission failure if lost")
		
		ContractData.ContractType.PLANETARY_ASSAULT:
			description = "Large-scale military operation against %s positions on %s. Expect heavy resistance." % [contract.target_faction, contract.planet_name]
			objectives = ["Capture primary objectives", "Eliminate enemy resistance", "Establish control"]
			if randf() < 0.5:
				conditions.append("Extended battlefield support required")
		
		ContractData.ContractType.RECONNAISSANCE:
			description = "Gather intelligence on %s activities in the %s system. Stealth preferred." % [contract.target_faction, contract.system_name]
			objectives = ["Gather specified intelligence", "Avoid detection if possible", "Report findings"]
			if randf() < 0.4:
				conditions.append("Stealth bonus - avoid combat when possible")
		
		ContractData.ContractType.PIRATE_HUNTING:
			description = "Eliminate pirate activity threatening commerce in %s system." % contract.system_name
			objectives = ["Locate pirate bases", "Destroy pirate forces", "Secure trade routes"]
			if randf() < 0.6:
				conditions.append("Bounty bonus for confirmed pirate kills")
	
	# Add difficulty-based flavor
	match contract.difficulty:
		ContractData.DifficultyLevel.EASY:
			description += " Intelligence suggests minimal opposition expected."
		ContractData.DifficultyLevel.MODERATE:
			description += " Moderate resistance anticipated."
		ContractData.DifficultyLevel.HARD:
			description += " Heavy enemy presence confirmed. High risk operation."
		ContractData.DifficultyLevel.EXTREME:
			description += " EXTREME DANGER. Elite enemy forces detected. Casualties expected."
	
	contract.description = description
	contract.objectives = objectives
	contract.special_conditions = conditions

func generate_contract_batch(count: int = 5) -> Array[ContractData]:
	var contracts: Array[ContractData] = []
	
	for i in count:
		# Vary difficulty distribution
		var difficulty_bias = ContractData.DifficultyLevel.MODERATE
		var roll = randf()
		
		if roll < 0.3:
			difficulty_bias = ContractData.DifficultyLevel.EASY
		elif roll > 0.8:
			difficulty_bias = ContractData.DifficultyLevel.HARD
		
		contracts.append(generate_random_contract(difficulty_bias))
	
	return contracts