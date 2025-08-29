extends Control

@onready var mech_list: VBoxContainer = $MainContainer/MechListPanel/VBoxContainer/ScrollContainer/MechList
@onready var mech_name_label: Label = $MainContainer/MechDetailsPanel/VBoxContainer/MechNameLabel

@onready var tonnage_label: Label = $MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/LeftInfoPanel/TonnageLabel
@onready var weight_class_label: Label = $MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/LeftInfoPanel/WeightClassLabel
@onready var movement_label: Label = $MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/LeftInfoPanel/MovementLabel
@onready var pilot_label: Label = $MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/LeftInfoPanel/PilotLabel
@onready var status_label: Label = $MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/LeftInfoPanel/StatusLabel

@onready var assign_pilot_button: Button = $MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/LeftInfoPanel/PilotButtonContainer/AssignPilotButton
@onready var unassign_pilot_button: Button = $MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/LeftInfoPanel/PilotButtonContainer/UnassignPilotButton
@onready var repair_button: Button = $MainContainer/MechDetailsPanel/VBoxContainer/ActionButtonContainer/RepairButton
@onready var sell_button: Button = $MainContainer/MechDetailsPanel/VBoxContainer/ActionButtonContainer/SellButton

@onready var armor_bars: Array[ProgressBar] = [
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/HeadArmorBar,
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/CenterTorsoArmorBar,
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/LeftTorsoArmorBar,
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/RightTorsoArmorBar,
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/LeftArmArmorBar,
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/RightArmArmorBar,
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/LeftLegArmorBar,
	$MainContainer/MechDetailsPanel/VBoxContainer/InfoContainer/RightInfoPanel/ArmorContainer/RightLegArmorBar
]

var game_manager: GameManager
var company_manager: CompanyManager
var selected_mech: MechUnit = null

var armor_locations: Array[String] = [
	"head", "center_torso", "left_torso", "right_torso",
	"left_arm", "right_arm", "left_leg", "right_leg"
]

var armor_location_names: Array[String] = [
	"Head", "Center Torso", "Left Torso", "Right Torso",
	"Left Arm", "Right Arm", "Left Leg", "Right Leg"
]

func _ready() -> void:
	game_manager = get_node("/root/GameManager")
	company_manager = get_node("/root/CompanyManager")
	
	if company_manager:
		company_manager.company_data_changed.connect(_on_company_data_changed)
	
	update_mech_list()
	update_mech_details()

func update_mech_list() -> void:
	# Clear existing mech entries
	for child in mech_list.get_children():
		child.queue_free()
	
	if not company_manager:
		return
	
	var mechs = company_manager.get_all_mechs()
	for mech_unit in mechs:
		var mech_entry = create_mech_entry(mech_unit)
		mech_list.add_child(mech_entry)

func create_mech_entry(mech_unit: MechUnit) -> Control:
	var entry_button = Button.new()
	entry_button.alignment = HORIZONTAL_ALIGNMENT_LEFT
	entry_button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	var mech_name = mech_unit.get_display_name()
	var pilot_name = mech_unit.get_pilot_name()
	var status = get_status_text(mech_unit)
	
	entry_button.text = "%s\nPilot: %s\nStatus: %s" % [mech_name, pilot_name, status]
	
	# Color code based on status
	if not mech_unit.is_operational():
		entry_button.modulate = Color(1.0, 0.6, 0.6)  # Red tint for damaged
	elif mech_unit.pilot_id == "":
		entry_button.modulate = Color(1.0, 1.0, 0.6)  # Yellow tint for unassigned
	else:
		entry_button.modulate = Color(0.6, 1.0, 0.6)  # Green tint for ready
	
	entry_button.pressed.connect(func(): select_mech(mech_unit))
	
	return entry_button

func select_mech(mech_unit: MechUnit) -> void:
	selected_mech = mech_unit
	update_mech_details()

func update_mech_details() -> void:
	if not selected_mech or not selected_mech.mech_data:
		clear_mech_details()
		return
	
	var mech_data = selected_mech.mech_data
	
	# Basic info
	mech_name_label.text = selected_mech.get_display_name()
	tonnage_label.text = "Tonnage: %d tons" % mech_data.tonnage
	weight_class_label.text = "Class: %s" % mech_data.get_weight_class_string()
	movement_label.text = "Movement: %d/%d" % [mech_data.base_movement, mech_data.jump_movement]
	pilot_label.text = "Pilot: %s" % selected_mech.get_pilot_name()
	status_label.text = "Status: %s" % get_status_text(selected_mech)
	
	# Status color coding
	if selected_mech.is_operational():
		status_label.modulate = Color.GREEN
	elif selected_mech.needs_repair():
		status_label.modulate = Color.YELLOW
	else:
		status_label.modulate = Color.RED
	
	# Update armor bars
	for i in range(armor_bars.size()):
		if i < armor_locations.size():
			var location = armor_locations[i]
			var armor_percent = selected_mech.get_armor_percent(location)
			var structure_percent = selected_mech.get_structure_percent(location)
			
			armor_bars[i].value = armor_percent * 100
			armor_bars[i].show_percentage = false
			
			# Create tooltip showing actual values
			var max_armor = selected_mech.get_max_armor(location)
			var current_armor = selected_mech.current_armor.get(location, 0)
			var max_structure = selected_mech.get_max_structure(location)
			var current_structure = selected_mech.current_structure.get(location, 0)
			
			armor_bars[i].tooltip_text = "%s\nArmor: %d/%d\nStructure: %d/%d" % [
				armor_location_names[i], current_armor, max_armor,
				current_structure, max_structure
			]
			
			# Color based on damage
			if armor_percent > 0.7:
				armor_bars[i].modulate = Color.GREEN
			elif armor_percent > 0.3:
				armor_bars[i].modulate = Color.YELLOW
			else:
				armor_bars[i].modulate = Color.RED
	
	# Update button states
	assign_pilot_button.disabled = (selected_mech.pilot_id != "")
	unassign_pilot_button.disabled = (selected_mech.pilot_id == "")
	repair_button.disabled = not selected_mech.needs_repair()

func clear_mech_details() -> void:
	mech_name_label.text = "Select a Mech"
	tonnage_label.text = "Tonnage: --"
	weight_class_label.text = "Class: --"
	movement_label.text = "Movement: --"
	pilot_label.text = "Pilot: --"
	status_label.text = "Status: --"
	status_label.modulate = Color.WHITE
	
	for armor_bar in armor_bars:
		armor_bar.value = 0
		armor_bar.modulate = Color.WHITE
		armor_bar.tooltip_text = ""
	
	assign_pilot_button.disabled = true
	unassign_pilot_button.disabled = true
	repair_button.disabled = true

func get_status_text(mech_unit: MechUnit) -> String:
	if mech_unit.is_destroyed():
		return "DESTROYED"
	elif mech_unit.maintenance_status == "in_repair":
		return "REPAIRING (%d days)" % mech_unit.repair_days_remaining
	elif mech_unit.needs_repair():
		return "NEEDS REPAIR"
	elif mech_unit.pilot_id == "":
		return "UNASSIGNED"
	else:
		return "OPERATIONAL"

func _on_company_data_changed() -> void:
	update_mech_list()
	if selected_mech:
		update_mech_details()

func _on_back_button_pressed() -> void:
	game_manager.change_state(GameManager.GameState.COMPANY_MANAGEMENT)

func _on_assign_pilot_button_pressed() -> void:
	if not selected_mech:
		return
	
	show_pilot_selection_dialog()

func _on_unassign_pilot_button_pressed() -> void:
	if not selected_mech or selected_mech.pilot_id == "":
		return
	
	var dialog = ConfirmationDialog.new()
	dialog.dialog_text = "Unassign %s from %s?" % [
		selected_mech.get_pilot_name(),
		selected_mech.get_display_name()
	]
	add_child(dialog)
	
	dialog.confirmed.connect(func():
		company_manager.unassign_pilot_from_all_mechs(selected_mech.pilot_id)
		dialog.queue_free()
	)
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

func show_pilot_selection_dialog() -> void:
	var available_pilots = get_available_pilots()
	
	if available_pilots.is_empty():
		show_error_dialog("No pilots available for assignment!")
		return
	
	var dialog = AcceptDialog.new()
	dialog.title = "Select Pilot"
	dialog.size = Vector2i(400, 300)
	
	var vbox = VBoxContainer.new()
	dialog.add_child(vbox)
	
	var scroll = ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(scroll)
	
	var pilot_list = VBoxContainer.new()
	scroll.add_child(pilot_list)
	
	for pilot_data in available_pilots:
		var pilot_button = Button.new()
		pilot_button.text = "%s - Gun:%d Pilot:%d" % [
			pilot_data.get_display_name(),
			pilot_data.gunnery_skill,
			pilot_data.piloting_skill
		]
		pilot_button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		
		pilot_button.pressed.connect(func():
			var pilot_id = get_pilot_id_by_data(pilot_data)
			if pilot_id:
				company_manager.assign_pilot_to_mech(pilot_id, selected_mech.unit_id)
			dialog.queue_free()
		)
		
		pilot_list.add_child(pilot_button)
	
	add_child(dialog)
	dialog.popup_centered()

func get_available_pilots() -> Array[PilotData]:
	var available: Array[PilotData] = []
	for pilot_data in company_manager.get_all_pilots():
		if pilot_data.current_mech == "" and pilot_data.is_combat_ready():
			available.append(pilot_data)
	return available

func get_pilot_id_by_data(pilot_data: PilotData) -> String:
	for pilot_id in company_manager.pilots.keys():
		if company_manager.pilots[pilot_id] == pilot_data:
			return pilot_id
	return ""

func _on_repair_button_pressed() -> void:
	if not selected_mech or not selected_mech.needs_repair():
		return
	
	var repair_cost = calculate_repair_cost(selected_mech)
	var repair_time = calculate_repair_time(selected_mech)
	
	var dialog = ConfirmationDialog.new()
	dialog.dialog_text = "Repair %s?\n\nCost: %s\nTime: %d days" % [
		selected_mech.get_display_name(),
		format_currency(repair_cost),
		repair_time
	]
	add_child(dialog)
	
	dialog.confirmed.connect(func():
		if company_manager.company_funds >= repair_cost:
			company_manager.modify_funds(-repair_cost)
			selected_mech.start_repairs()
		else:
			show_error_dialog("Insufficient funds for repairs!")
		dialog.queue_free()
	)
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

func calculate_repair_cost(mech_unit: MechUnit) -> int:
	var damage_percent = mech_unit.get_total_damage_percent()
	var base_cost = mech_unit.mech_data.tonnage * 1000  # 1000 C-Bills per ton base
	return int(base_cost * damage_percent)

func calculate_repair_time(mech_unit: MechUnit) -> int:
	var damage_percent = mech_unit.get_total_damage_percent()
	return max(1, int(damage_percent * 30))  # Up to 30 days for full repair

func _on_sell_button_pressed() -> void:
	if not selected_mech:
		return
	
	var sale_value = calculate_sale_value(selected_mech)
	
	var dialog = ConfirmationDialog.new()
	dialog.dialog_text = "Sell %s?\n\nSale Value: %s\n\nThis action cannot be undone!" % [
		selected_mech.get_display_name(),
		format_currency(sale_value)
	]
	add_child(dialog)
	
	dialog.confirmed.connect(func():
		company_manager.modify_funds(sale_value)
		company_manager.remove_mech(selected_mech.unit_id)
		selected_mech = null
		dialog.queue_free()
	)
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

func calculate_sale_value(mech_unit: MechUnit) -> int:
	var base_value = mech_unit.mech_data.base_cost
	var condition_multiplier = 1.0 - (mech_unit.get_total_damage_percent() * 0.8)
	condition_multiplier = clamp(condition_multiplier, 0.1, 1.0)
	
	# Mechs sell for about 60% of original value in good condition
	return int(base_value * 0.6 * condition_multiplier)

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

func show_error_dialog(message: String) -> void:
	var dialog = AcceptDialog.new()
	dialog.dialog_text = message
	add_child(dialog)
	dialog.popup_centered()
	dialog.confirmed.connect(func(): dialog.queue_free())