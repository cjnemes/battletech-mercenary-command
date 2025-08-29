class_name SaveSystem extends Node

signal save_completed(success: bool)
signal load_completed(success: bool)

const SAVE_FILE_PATH = "user://savegame.dat"
const AUTO_SAVE_INTERVAL = 300.0  # 5 minutes

var auto_save_timer: Timer
var current_save_data: Dictionary = {}

func _ready() -> void:
	setup_auto_save()

func setup_auto_save() -> void:
	auto_save_timer = Timer.new()
	auto_save_timer.wait_time = AUTO_SAVE_INTERVAL
	auto_save_timer.timeout.connect(_on_auto_save_timeout)
	add_child(auto_save_timer)
	auto_save_timer.start()

func save_game(file_path: String = SAVE_FILE_PATH) -> bool:
	var save_data = collect_save_data()
	
	var file = FileAccess.open(file_path, FileAccess.WRITE)
	if file == null:
		push_error("Failed to open save file for writing: " + file_path)
		save_completed.emit(false)
		return false
	
	var json_string = JSON.stringify(save_data)
	file.store_string(json_string)
	file.close()
	
	current_save_data = save_data.duplicate(true)
	save_completed.emit(true)
	return true

func load_game(file_path: String = SAVE_FILE_PATH) -> bool:
	if not FileAccess.file_exists(file_path):
		push_error("Save file does not exist: " + file_path)
		load_completed.emit(false)
		return false
	
	var file = FileAccess.open(file_path, FileAccess.READ)
	if file == null:
		push_error("Failed to open save file for reading: " + file_path)
		load_completed.emit(false)
		return false
	
	var json_string = file.get_as_text()
	file.close()
	
	var json = JSON.new()
	var parse_result = json.parse(json_string)
	
	if parse_result != OK:
		push_error("Failed to parse save file JSON")
		load_completed.emit(false)
		return false
	
	var save_data = json.data
	apply_save_data(save_data)
	
	current_save_data = save_data.duplicate(true)
	load_completed.emit(true)
	return true

func collect_save_data() -> Dictionary:
	var save_data = {
		"version": "1.0",
		"timestamp": Time.get_unix_time_from_system(),
		"game_data": {}
	}
	
	# Collect data from various systems
	var game_manager = get_node("/root/GameManager")
	if game_manager:
		save_data.game_data["current_state"] = game_manager.current_state
	
	# Company data will be collected here once implemented
	# save_data.game_data["company"] = CompanyManager.get_save_data()
	
	# Combat data will be collected here once implemented
	# save_data.game_data["combat"] = CombatManager.get_save_data()
	
	return save_data

func apply_save_data(save_data: Dictionary) -> void:
	if not save_data.has("game_data"):
		push_error("Invalid save data format")
		return
	
	var game_data = save_data.game_data
	
	# Apply game manager state
	var game_manager = get_node("/root/GameManager")
	if game_manager and game_data.has("current_state"):
		game_manager.change_state(game_data.current_state)
	
	# Apply company data once implemented
	# if game_data.has("company"):
	#     CompanyManager.load_save_data(game_data.company)
	
	# Apply combat data once implemented
	# if game_data.has("combat"):
	#     CombatManager.load_save_data(game_data.combat)

func auto_save() -> void:
	save_game()

func has_save_file() -> bool:
	return FileAccess.file_exists(SAVE_FILE_PATH)

func delete_save_file() -> bool:
	if has_save_file():
		var dir = DirAccess.open("user://")
		return dir.remove("savegame.dat") == OK
	return true

func _on_auto_save_timeout() -> void:
	auto_save()