extends Control

@onready var new_game_button: Button = $VBoxContainer/ButtonContainer/NewGameButton
@onready var load_game_button: Button = $VBoxContainer/ButtonContainer/LoadGameButton
@onready var settings_button: Button = $VBoxContainer/ButtonContainer/SettingsButton
@onready var quit_button: Button = $VBoxContainer/ButtonContainer/QuitButton

var game_manager: GameManager

func _ready() -> void:
	game_manager = get_node("/root/GameManager")
	
	# Check if save file exists to enable/disable load button
	var save_system = game_manager.save_system
	if save_system and not save_system.has_save_file():
		load_game_button.disabled = true

func _on_new_game_button_pressed() -> void:
	# TODO: Show company creation dialog
	game_manager.change_state(GameManager.GameState.COMPANY_MANAGEMENT)

func _on_load_game_button_pressed() -> void:
	var save_system = game_manager.save_system
	if save_system:
		if save_system.load_game():
			# Game state will be restored from save data
			pass
		else:
			# Show error dialog
			show_error_dialog("Failed to load save game.")

func _on_settings_button_pressed() -> void:
	# TODO: Show settings dialog
	show_info_dialog("Settings menu not yet implemented.")

func _on_quit_button_pressed() -> void:
	game_manager.quit_game()

func show_error_dialog(message: String) -> void:
	var dialog = AcceptDialog.new()
	dialog.dialog_text = message
	add_child(dialog)
	dialog.popup_centered()
	dialog.confirmed.connect(func(): dialog.queue_free())

func show_info_dialog(message: String) -> void:
	var dialog = AcceptDialog.new()
	dialog.dialog_text = message
	add_child(dialog)
	dialog.popup_centered()
	dialog.confirmed.connect(func(): dialog.queue_free())