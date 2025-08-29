extends Control

@onready var company_name_label: Label = $MainContainer/LeftPanel/CompanyInfoPanel/VBoxContainer/CompanyNameLabel
@onready var funds_label: Label = $MainContainer/LeftPanel/CompanyInfoPanel/VBoxContainer/FundsLabel
@onready var rating_label: Label = $MainContainer/LeftPanel/CompanyInfoPanel/VBoxContainer/RatingLabel
@onready var date_label: Label = $MainContainer/LeftPanel/CompanyInfoPanel/VBoxContainer/DateLabel
@onready var expenses_label: Label = $MainContainer/LeftPanel/CompanyInfoPanel/VBoxContainer/ExpensesLabel
@onready var income_label: Label = $MainContainer/LeftPanel/CompanyInfoPanel/VBoxContainer/IncomeLabel

@onready var pilot_list: VBoxContainer = $MainContainer/RightPanel/PersonnelPanel/VBoxContainer/PilotListContainer/PilotList
@onready var reputation_list: VBoxContainer = $MainContainer/RightPanel/FactionPanel/VBoxContainer/ReputationList

var game_manager: GameManager
var company_manager: CompanyManager

func _ready() -> void:
	game_manager = get_node("/root/GameManager")
	
	# Create and add CompanyManager if it doesn't exist
	company_manager = get_node_or_null("/root/CompanyManager")
	if not company_manager:
		company_manager = preload("res://scripts/systems/CompanyManager.gd").new()
		company_manager.name = "CompanyManager"
		get_tree().root.add_child(company_manager)
	
	# Connect signals
	company_manager.company_data_changed.connect(_on_company_data_changed)
	company_manager.funds_changed.connect(_on_funds_changed)
	game_manager.time_manager.day_passed.connect(_on_date_changed)
	
	# Initialize display
	update_company_info()
	update_personnel_list()
	update_reputation_list()

func update_company_info() -> void:
	if not company_manager:
		return
	
	company_name_label.text = "Company: " + company_manager.company_name
	funds_label.text = "Funds: " + format_currency(company_manager.company_funds)
	rating_label.text = "Rating: " + company_manager.get_company_rating()
	
	var expenses = company_manager.calculate_monthly_expenses()
	expenses_label.text = "Monthly Expenses: " + format_currency(expenses)
	income_label.text = "Monthly Income: " + format_currency(company_manager.monthly_income)
	
	if game_manager.time_manager:
		date_label.text = "Date: " + game_manager.time_manager.get_current_date_long()

func update_personnel_list() -> void:
	# Clear existing pilot entries
	for child in pilot_list.get_children():
		child.queue_free()
	
	var pilots = company_manager.get_all_pilots()
	for pilot_data in pilots:
		var pilot_entry = create_pilot_entry(pilot_data)
		pilot_list.add_child(pilot_entry)

func create_pilot_entry(pilot_data: PilotData) -> Control:
	var entry_container = HBoxContainer.new()
	entry_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var info_container = VBoxContainer.new()
	info_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	# Name and callsign
	var name_label = Label.new()
	name_label.text = pilot_data.get_display_name()
	name_label.add_theme_style_override("normal", create_pilot_name_style())
	info_container.add_child(name_label)
	
	# Skills
	var skills_label = Label.new()
	skills_label.text = "Gun: %d | Pilot: %d | Tactics: %d | Leader: %d" % [
		pilot_data.gunnery_skill, pilot_data.piloting_skill,
		pilot_data.tactics_skill, pilot_data.leadership_skill
	]
	skills_label.modulate = Color(0.8, 0.8, 0.8)
	info_container.add_child(skills_label)
	
	# Status
	var status_label = Label.new()
	var status_text = "Morale: %d%% | Salary: %s/month" % [
		pilot_data.morale, format_currency(pilot_data.salary_monthly)
	]
	
	if pilot_data.is_injured():
		status_text += " | INJURED"
		status_label.modulate = Color.RED
	else:
		status_label.modulate = Color(0.7, 0.7, 0.7)
	
	status_label.text = status_text
	info_container.add_child(status_label)
	
	# Traits
	if not pilot_data.traits.is_empty():
		var traits_label = Label.new()
		traits_label.text = "Traits: " + ", ".join(pilot_data.traits)
		traits_label.modulate = Color(0.6, 0.9, 0.6)
		info_container.add_child(traits_label)
	
	entry_container.add_child(info_container)
	
	# Action buttons
	var button_container = VBoxContainer.new()
	
	var fire_button = Button.new()
	fire_button.text = "Fire"
	fire_button.modulate = Color(1.0, 0.6, 0.6)
	fire_button.pressed.connect(func(): fire_pilot_dialog(pilot_data))
	button_container.add_child(fire_button)
	
	entry_container.add_child(button_container)
	
	# Add separator
	var separator = HSeparator.new()
	separator.modulate = Color(0.5, 0.5, 0.5, 0.5)
	
	var final_container = VBoxContainer.new()
	final_container.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	final_container.add_child(entry_container)
	final_container.add_child(separator)
	
	return final_container

func create_pilot_name_style() -> StyleBox:
	var style = StyleBoxFlat.new()
	style.bg_color = Color.TRANSPARENT
	return style

func update_reputation_list() -> void:
	# Clear existing reputation entries
	for child in reputation_list.get_children():
		child.queue_free()
	
	var factions = ["Steiner", "Davion", "Liao", "Marik", "Kurita", "Mercenary"]
	
	for faction in factions:
		var rep_value = company_manager.get_reputation_with_faction(faction)
		var rep_container = HBoxContainer.new()
		
		var faction_label = Label.new()
		faction_label.text = faction + ":"
		faction_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		rep_container.add_child(faction_label)
		
		var rep_label = Label.new()
		rep_label.text = str(rep_value)
		rep_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
		
		if rep_value > 25:
			rep_label.modulate = Color.GREEN
		elif rep_value < -25:
			rep_label.modulate = Color.RED
		else:
			rep_label.modulate = Color.WHITE
		
		rep_container.add_child(rep_label)
		reputation_list.add_child(rep_container)

func format_currency(amount: int) -> String:
	var formatted = str(amount)
	var result = ""
	var count = 0
	
	for i in range(formatted.length() - 1, -1, -1):
		if count > 0 and count % 3 == 0:
			result = "," + result
		result = formatted[i] + result
		count += 1
	
	return result + " C-Bills"

func fire_pilot_dialog(pilot_data: PilotData) -> void:
	var dialog = ConfirmationDialog.new()
	dialog.dialog_text = "Fire " + pilot_data.get_display_name() + "?\n\nSeverance pay: " + format_currency(pilot_data.salary_monthly)
	add_child(dialog)
	
	dialog.confirmed.connect(func(): 
		# Find pilot ID
		for pilot_id in company_manager.pilots.keys():
			if company_manager.pilots[pilot_id] == pilot_data:
				company_manager.fire_pilot(pilot_id)
				break
		dialog.queue_free()
	)
	
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

func _on_company_data_changed() -> void:
	update_company_info()
	update_personnel_list()

func _on_funds_changed(old_amount: int, new_amount: int) -> void:
	update_company_info()

func _on_date_changed(current_day: int) -> void:
	update_company_info()

func _on_hire_pilot_button_pressed() -> void:
	show_hire_pilot_dialog()

func show_hire_pilot_dialog() -> void:
	var pilot_data = company_manager.generate_random_pilot()
	var hiring_cost = pilot_data.salary_monthly  # One month advance
	
	var dialog = ConfirmationDialog.new()
	dialog.dialog_text = "Hire " + pilot_data.get_display_name() + "?\n\n" +
		"Skills: Gun %d, Pilot %d, Tactics %d, Leader %d\n" % [
			pilot_data.gunnery_skill, pilot_data.piloting_skill,
			pilot_data.tactics_skill, pilot_data.leadership_skill
		] +
		"Salary: " + format_currency(pilot_data.salary_monthly) + "/month\n" +
		"Hiring Cost: " + format_currency(hiring_cost)
	
	if pilot_data.traits.size() > 0:
		dialog.dialog_text += "\nTraits: " + ", ".join(pilot_data.traits)
	
	add_child(dialog)
	
	dialog.confirmed.connect(func():
		if company_manager.company_funds >= hiring_cost:
			company_manager.hire_pilot(pilot_data)
			company_manager.modify_funds(-hiring_cost)
		else:
			show_error_dialog("Insufficient funds to hire pilot!")
		dialog.queue_free()
	)
	
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

func show_error_dialog(message: String) -> void:
	var dialog = AcceptDialog.new()
	dialog.dialog_text = message
	add_child(dialog)
	dialog.popup_centered()
	dialog.confirmed.connect(func(): dialog.queue_free())

func _on_mech_bay_button_pressed() -> void:
	game_manager.change_state(GameManager.GameState.MECH_BAY)

func _on_star_map_button_pressed() -> void:
	game_manager.change_state(GameManager.GameState.STAR_MAP)

func _on_main_menu_button_pressed() -> void:
	game_manager.change_state(GameManager.GameState.MAIN_MENU)