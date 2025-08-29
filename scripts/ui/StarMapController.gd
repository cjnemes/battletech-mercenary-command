extends Control

@onready var contract_list: VBoxContainer = $MainContainer/ContractListPanel/VBoxContainer/ScrollContainer/ContractList
@onready var contract_name_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/ContractNameLabel

@onready var employer_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/BasicInfoContainer/EmployerLabel
@onready var location_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/BasicInfoContainer/LocationLabel
@onready var type_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/BasicInfoContainer/TypeLabel
@onready var difficulty_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/BasicInfoContainer/DifficultyLabel
@onready var duration_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/BasicInfoContainer/DurationLabel

@onready var base_payment_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/PaymentContainer/BasePaymentLabel
@onready var bonus_payment_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/PaymentContainer/BonusPaymentLabel
@onready var advance_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/PaymentContainer/AdvanceLabel
@onready var salvage_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/PaymentContainer/SalvageLabel

@onready var mech_requirement_label: Label = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/RequirementsContainer/MechRequirementLabel
@onready var description_text: RichTextLabel = $MainContainer/ContractDetailsPanel/VBoxContainer/DetailsScrollContainer/DetailsContainer/DescriptionContainer/DescriptionText

@onready var accept_contract_button: Button = $MainContainer/ContractDetailsPanel/VBoxContainer/ActionButtonContainer/AcceptContractButton

var game_manager: GameManager
var company_manager: CompanyManager
var contract_generator: ContractGenerator
var available_contracts: Array[ContractData] = []
var selected_contract: ContractData = null

func _ready() -> void:
	game_manager = get_node("/root/GameManager")
	company_manager = get_node("/root/CompanyManager")
	
	# Create contract generator
	contract_generator = ContractGenerator.new()
	add_child(contract_generator)
	
	# Generate initial contracts
	refresh_contracts()

func refresh_contracts() -> void:
	available_contracts = contract_generator.generate_contract_batch(6)
	update_contract_list()

func update_contract_list() -> void:
	# Clear existing contract entries
	for child in contract_list.get_children():
		child.queue_free()
	
	for contract in available_contracts:
		var contract_entry = create_contract_entry(contract)
		contract_list.add_child(contract_entry)

func create_contract_entry(contract: ContractData) -> Control:
	var entry_button = Button.new()
	entry_button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	entry_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var contract_summary = "%s\n%s - %s\nPay: %s | %s" % [
		contract.contract_name,
		contract.employer_faction,
		contract.get_type_string(),
		format_currency(contract.get_total_payment()),
		contract.get_difficulty_string()
	]
	
	entry_button.text = contract_summary
	
	# Color code based on difficulty and availability
	if not contract.is_available():
		entry_button.modulate = Color(0.6, 0.6, 0.6)  # Gray for unavailable
		entry_button.disabled = true
	else:
		entry_button.modulate = contract.get_difficulty_color()
	
	entry_button.pressed.connect(func(): select_contract(contract))
	
	return entry_button

func select_contract(contract: ContractData) -> void:
	selected_contract = contract
	update_contract_details()

func update_contract_details() -> void:
	if not selected_contract:
		clear_contract_details()
		return
	
	contract_name_label.text = selected_contract.contract_name
	
	# Basic info
	employer_label.text = "Employer: " + selected_contract.employer_faction
	location_label.text = "Location: %s, %s System" % [selected_contract.planet_name, selected_contract.system_name]
	type_label.text = "Type: " + selected_contract.get_type_string()
	difficulty_label.text = "Difficulty: " + selected_contract.get_difficulty_string()
	duration_label.text = "Duration: %d days (%d travel)" % [selected_contract.duration_days, selected_contract.travel_days]
	
	# Color difficulty
	difficulty_label.modulate = selected_contract.get_difficulty_color()
	
	# Payment info
	base_payment_label.text = "Base Payment: " + format_currency(selected_contract.base_payment)
	bonus_payment_label.text = "Success Bonus: " + format_currency(selected_contract.success_bonus)
	advance_label.text = "Advance Payment: " + format_currency(selected_contract.get_advance_amount())
	salvage_label.text = "Salvage Rights: " + ("Yes" if selected_contract.salvage_rights else "No")
	
	# Requirements
	mech_requirement_label.text = "Mechs Required: %d (Max: %d)" % [selected_contract.required_mechs, selected_contract.max_mechs]
	
	# Description with objectives and conditions
	var description_html = "[b]Mission Brief:[/b]\n" + selected_contract.description + "\n\n"
	
	if not selected_contract.objectives.is_empty():
		description_html += "[b]Objectives:[/b]\n"
		for objective in selected_contract.objectives:
			description_html += "• " + objective + "\n"
		description_html += "\n"
	
	if not selected_contract.special_conditions.is_empty():
		description_html += "[b]Special Conditions:[/b]\n"
		for condition in selected_contract.special_conditions:
			description_html += "• " + condition + "\n"
		description_html += "\n"
	
	description_html += "[b]Risk Assessment:[/b]\n" + selected_contract.get_risk_assessment()
	
	description_text.text = description_html
	
	# Update button state
	accept_contract_button.disabled = not selected_contract.is_available()

func clear_contract_details() -> void:
	contract_name_label.text = "Select a Contract"
	employer_label.text = "Employer: --"
	location_label.text = "Location: --"
	type_label.text = "Type: --"
	difficulty_label.text = "Difficulty: --"
	duration_label.text = "Duration: --"
	difficulty_label.modulate = Color.WHITE
	
	base_payment_label.text = "Base Payment: --"
	bonus_payment_label.text = "Success Bonus: --"
	advance_label.text = "Advance Payment: --"
	salvage_label.text = "Salvage Rights: --"
	
	mech_requirement_label.text = "Mechs Required: --"
	description_text.text = "Select a contract to view details."
	
	accept_contract_button.disabled = true

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

func _on_refresh_button_pressed() -> void:
	refresh_contracts()
	selected_contract = null
	clear_contract_details()

func _on_back_button_pressed() -> void:
	game_manager.change_state(GameManager.GameState.COMPANY_MANAGEMENT)

func _on_accept_contract_button_pressed() -> void:
	if not selected_contract or not selected_contract.is_available():
		return
	
	show_contract_acceptance_dialog()

func show_contract_acceptance_dialog() -> void:
	var dialog = ConfirmationDialog.new()
	dialog.title = "Accept Contract"
	dialog.dialog_text = "Accept contract '%s'?\n\nThis will start the mission immediately.\nAdvance payment: %s\n\nDo you want to proceed?" % [
		selected_contract.contract_name,
		format_currency(selected_contract.get_advance_amount())
	]
	
	add_child(dialog)
	
	dialog.confirmed.connect(func():
		accept_contract(selected_contract)
		dialog.queue_free()
	)
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

func accept_contract(contract: ContractData) -> void:
	# Pay advance
	company_manager.modify_funds(contract.get_advance_amount())
	
	# Add to company contracts
	company_manager.contracts.append(contract)
	
	# Show mission start dialog
	var dialog = AcceptDialog.new()
	dialog.title = "Mission Accepted"
	dialog.dialog_text = "Contract '%s' accepted!\n\nAdvance payment of %s received.\nPrepare your forces for deployment.\n\n[This will eventually start tactical combat]" % [
		contract.contract_name,
		format_currency(contract.get_advance_amount())
	]
	
	add_child(dialog)
	dialog.confirmed.connect(func():
		# TODO: Transition to tactical combat or mission setup
		game_manager.change_state(GameManager.GameState.COMPANY_MANAGEMENT)
		dialog.queue_free()
	)
	dialog.popup_centered()

func _on_advance_time_button_pressed() -> void:
	var dialog = ConfirmationDialog.new()
	dialog.dialog_text = "Advance time by 7 days?\n\nThis will:\n• Refresh available contracts\n• Progress any ongoing repairs\n• Consume resources\n\nCannot be undone!"
	
	add_child(dialog)
	
	dialog.confirmed.connect(func():
		advance_time_by_days(7)
		dialog.queue_free()
	)
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

func advance_time_by_days(days: int) -> void:
	# Advance game time
	game_manager.time_manager.advance_time(days)
	
	# Refresh contracts (represents changing galactic situation)
	refresh_contracts()
	selected_contract = null
	clear_contract_details()
	
	# Show time advancement result
	var dialog = AcceptDialog.new()
	dialog.dialog_text = "%d days have passed.\n\nNew contracts are now available.\nTime: %s" % [
		days,
		game_manager.time_manager.get_current_date_long()
	]
	add_child(dialog)
	dialog.confirmed.connect(func(): dialog.queue_free())
	dialog.popup_centered()