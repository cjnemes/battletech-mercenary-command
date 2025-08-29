extends Control

@onready var turn_label: Label = $TopPanel/TopContainer/TurnInfoContainer/TurnLabel
@onready var phase_label: Label = $TopPanel/TopContainer/TurnInfoContainer/PhaseLabel
@onready var current_unit_label: Label = $TopPanel/TopContainer/TurnInfoContainer/CurrentUnitLabel

@onready var unit_name_label: Label = $RightPanel/RightContainer/UnitDetailsContainer/UnitNameLabel
@onready var unit_status_label: Label = $RightPanel/RightContainer/UnitDetailsContainer/UnitStatusLabel

@onready var health_bar: ProgressBar = $RightPanel/RightContainer/UnitDetailsContainer/HealthContainer/HealthBar
@onready var health_value_label: Label = $RightPanel/RightContainer/UnitDetailsContainer/HealthContainer/HealthValueLabel

@onready var heat_bar: ProgressBar = $RightPanel/RightContainer/UnitDetailsContainer/HeatContainer/HeatBar
@onready var heat_value_label: Label = $RightPanel/RightContainer/UnitDetailsContainer/HeatContainer/HeatValueLabel

@onready var movement_value_label: Label = $RightPanel/RightContainer/UnitDetailsContainer/MovementContainer/MovementValueLabel

@onready var attack_button: Button = $RightPanel/RightContainer/UnitDetailsContainer/ActionButtonsContainer/AttackButton
@onready var wait_button: Button = $RightPanel/RightContainer/UnitDetailsContainer/ActionButtonsContainer/WaitButton
@onready var end_turn_button: Button = $TopPanel/TopContainer/ButtonContainer/EndTurnButton

@onready var message_log: RichTextLabel = $BottomPanel/MessageLog

var combat_manager: TacticalCombatManager
var game_manager: GameManager

func _ready() -> void:
	game_manager = get_node("/root/GameManager")
	combat_manager = get_node("../CombatManager")
	
	# Connect to combat manager signals
	combat_manager.turn_started.connect(_on_turn_started)
	combat_manager.turn_ended.connect(_on_turn_ended)
	combat_manager.unit_selected.connect(_on_unit_selected)
	combat_manager.combat_ended.connect(_on_combat_ended)
	
	# Initialize combat with test data
	initialize_test_combat()

func initialize_test_combat() -> void:
	# Check if we have combat data from a contract
	var combat_data = game_manager.get("current_combat_data")
	
	if combat_data and combat_data.has("contract") and combat_data.has("player_mechs"):
		# Initialize with contract data
		var contract = combat_data.contract
		var player_mechs = combat_data.player_mechs
		
		var mission_data = {
			"contract": contract,
			"difficulty": contract.get_difficulty_string().to_lower(),
			"enemy_count": contract.required_mechs + randi_range(0, 2)
		}
		
		combat_manager.initialize_combat(player_mechs, mission_data)
		add_message("[b]Mission: %s[/b]" % contract.contract_name)
		add_message("Deployed %d mechs to combat" % player_mechs.size())
		
		# Clear the combat data
		game_manager.set("current_combat_data", null)
	else:
		# Fallback to test combat with company mechs
		var company_manager = get_node("/root/CompanyManager")
		if company_manager:
			var operational_mechs = company_manager.get_operational_mechs()
			if not operational_mechs.is_empty():
				var mission_data = {"difficulty": "moderate", "enemy_count": 3}
				combat_manager.initialize_combat(operational_mechs, mission_data)
				add_message("Test combat initialized with %d player mechs" % operational_mechs.size())
			else:
				add_message("No operational mechs available for combat!")
		else:
			add_message("Company Manager not found - using test units")
			# Fallback to test combat
			var mission_data = {"difficulty": "test"}
			combat_manager.initialize_combat([], mission_data)

func _on_turn_started(unit: CombatUnit) -> void:
	turn_label.text = "Turn: %d" % combat_manager.current_turn
	current_unit_label.text = "Unit: %s" % unit.unit_name
	phase_label.text = "Phase: %s Turn" % ("Player" if unit.is_player_unit else "Enemy")
	
	add_message("[b]%s's turn started[/b]" % unit.unit_name)
	
	# Enable/disable UI based on unit ownership
	var is_player_turn = unit.is_player_unit
	end_turn_button.disabled = not is_player_turn
	
	update_unit_display(unit)

func _on_turn_ended(unit: CombatUnit) -> void:
	add_message("%s's turn ended" % unit.unit_name)

func _on_unit_selected(unit: CombatUnit) -> void:
	update_unit_display(unit)
	add_message("Selected: %s" % unit.unit_name)

func _on_combat_ended(victory: bool) -> void:
	var result_text = "[b][color=green]VICTORY![/color][/b]" if victory else "[b][color=red]DEFEAT![/color][/b]"
	add_message(result_text)
	add_message("Combat ended after %d turns" % combat_manager.current_turn)
	
	# Show end combat dialog
	show_combat_results(victory)

func update_unit_display(unit: CombatUnit) -> void:
	if not unit:
		clear_unit_display()
		return
	
	var status = unit.get_status_summary()
	
	# Basic info
	unit_name_label.text = unit.unit_name
	var status_text = "Ready"
	if not status.can_move and not status.can_act:
		status_text = "Turn Complete"
	elif status.status_effects.has("shutdown"):
		status_text = "SHUTDOWN"
	elif status.status_effects.size() > 0:
		status_text = status.status_effects[0].capitalize()
	
	unit_status_label.text = "Status: " + status_text
	
	# Health
	health_bar.max_value = status.max_health
	health_bar.value = status.health
	health_value_label.text = "%d / %d" % [status.health, status.max_health]
	
	# Color health bar based on percentage
	if status.health_percent > 0.7:
		health_bar.modulate = Color.GREEN
	elif status.health_percent > 0.3:
		health_bar.modulate = Color.YELLOW
	else:
		health_bar.modulate = Color.RED
	
	# Heat
	heat_bar.max_value = status.max_heat
	heat_bar.value = status.heat
	heat_value_label.text = "%d / %d" % [status.heat, status.max_heat]
	
	# Color heat bar
	if status.heat_percent < 0.5:
		heat_bar.modulate = Color.GREEN
	elif status.heat_percent < 0.8:
		heat_bar.modulate = Color.YELLOW
	else:
		heat_bar.modulate = Color.RED
	
	# Movement
	movement_value_label.text = "%d / %d" % [status.movement, status.max_movement]
	
	# Action buttons
	var is_player_unit = unit.is_player_unit
	var is_current_unit = (combat_manager.selected_unit == unit)
	
	attack_button.disabled = not (is_player_unit and is_current_unit and status.can_act)
	wait_button.disabled = not (is_player_unit and is_current_unit and (status.can_move or status.can_act))

func clear_unit_display() -> void:
	unit_name_label.text = "No Unit Selected"
	unit_status_label.text = "Status: --"
	health_bar.value = 0
	health_value_label.text = "-- / --"
	heat_bar.value = 0
	heat_value_label.text = "-- / --"
	movement_value_label.text = "-- / --"
	
	attack_button.disabled = true
	wait_button.disabled = true

func add_message(text: String) -> void:
	var timestamp = "[color=gray][%02d:%02d][/color] " % [
		Time.get_unix_time_from_system() % 3600 / 60,
		Time.get_unix_time_from_system() % 60
	]
	message_log.text += "\n" + timestamp + text
	
	# Auto-scroll to bottom
	message_log.scroll_to_line(message_log.get_line_count() - 1)

func show_combat_results(victory: bool) -> void:
	var dialog = AcceptDialog.new()
	dialog.title = "Combat Complete"
	
	var result_text = ""
	if victory:
		result_text = "Mission Successful!\n\nYour mercenary company has achieved victory."
		# TODO: Calculate rewards, salvage, etc.
	else:
		result_text = "Mission Failed!\n\nYour forces have been defeated."
		# TODO: Calculate losses, repairs needed, etc.
	
	result_text += "\n\n[This will eventually show detailed results]"
	dialog.dialog_text = result_text
	
	add_child(dialog)
	dialog.confirmed.connect(func():
		# Return to company management
		game_manager.change_state(GameManager.GameState.COMPANY_MANAGEMENT)
		dialog.queue_free()
	)
	dialog.popup_centered()

func _on_end_turn_button_pressed() -> void:
	if combat_manager.combat_active:
		combat_manager.end_unit_turn()

func _on_attack_button_pressed() -> void:
	add_message("Select target to attack...")
	# Attack mode would be handled by the combat manager when clicking on enemy units

func _on_wait_button_pressed() -> void:
	if combat_manager.selected_unit and combat_manager.selected_unit.is_player_unit:
		add_message("%s waiting..." % combat_manager.selected_unit.unit_name)
		combat_manager.end_unit_turn()

func _on_exit_combat_button_pressed() -> void:
	var dialog = ConfirmationDialog.new()
	dialog.dialog_text = "Exit combat?\n\nThis will forfeit the mission and return to company management."
	
	add_child(dialog)
	dialog.confirmed.connect(func():
		game_manager.change_state(GameManager.GameState.COMPANY_MANAGEMENT)
		dialog.queue_free()
	)
	dialog.canceled.connect(func(): dialog.queue_free())
	dialog.popup_centered()

# Handle camera controls
func _input(event: InputEvent) -> void:
	var camera = combat_manager.get_node("Camera2D")
	if not camera:
		return
	
	# Camera movement with WASD or arrow keys
	var camera_speed = 200.0
	var move_vector = Vector2.ZERO
	
	if Input.is_action_pressed("ui_up"):
		move_vector.y -= 1
	if Input.is_action_pressed("ui_down"):
		move_vector.y += 1
	if Input.is_action_pressed("ui_left"):
		move_vector.x -= 1
	if Input.is_action_pressed("ui_right"):
		move_vector.x += 1
	
	if move_vector != Vector2.ZERO:
		camera.position += move_vector.normalized() * camera_speed * get_process_delta_time()
	
	# Zoom with mouse wheel
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			camera.zoom = camera.zoom * 1.1
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			camera.zoom = camera.zoom / 1.1
		
		# Clamp zoom
		camera.zoom = camera.zoom.clamp(Vector2(0.5, 0.5), Vector2(3.0, 3.0))