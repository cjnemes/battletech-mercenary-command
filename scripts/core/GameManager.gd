extends Node

signal game_state_changed(new_state: GameState)
signal scene_transition_started(scene_name: String)
signal scene_transition_completed(scene_name: String)

enum GameState {
	MAIN_MENU,
	COMPANY_MANAGEMENT,
	TACTICAL_COMBAT,
	STAR_MAP,
	MECH_BAY,
	LOADING,
	PAUSED
}

var current_state: GameState = GameState.MAIN_MENU
var previous_state: GameState

var scene_manager: SceneManager
var save_system: SaveSystem
var event_bus: EventBus
var time_manager: TimeManager

func _ready() -> void:
	initialize_core_systems()
	change_state(GameState.MAIN_MENU)

func initialize_core_systems() -> void:
	scene_manager = SceneManager.new()
	save_system = SaveSystem.new()
	event_bus = EventBus.new()
	time_manager = TimeManager.new()
	
	add_child(scene_manager)
	add_child(save_system)
	add_child(event_bus)
	add_child(time_manager)
	
	scene_manager.scene_changed.connect(_on_scene_changed)

func change_state(new_state: GameState) -> void:
	if new_state == current_state:
		return
	
	previous_state = current_state
	current_state = new_state
	game_state_changed.emit(new_state)
	
	match new_state:
		GameState.MAIN_MENU:
			scene_manager.change_scene("res://scenes/main/MainMenu.tscn")
		GameState.COMPANY_MANAGEMENT:
			scene_manager.change_scene("res://scenes/management/CompanyOverview.tscn")
		GameState.TACTICAL_COMBAT:
			scene_manager.change_scene("res://scenes/combat/TacticalCombat.tscn")
		GameState.STAR_MAP:
			scene_manager.change_scene("res://scenes/main/StarMap.tscn")
		GameState.MECH_BAY:
			scene_manager.change_scene("res://scenes/management/MechBay.tscn")

func pause_game() -> void:
	if current_state != GameState.PAUSED:
		previous_state = current_state
		change_state(GameState.PAUSED)
		get_tree().paused = true

func unpause_game() -> void:
	if current_state == GameState.PAUSED:
		get_tree().paused = false
		change_state(previous_state)

func quit_game() -> void:
	save_system.auto_save()
	get_tree().quit()

func _on_scene_changed(scene_name: String) -> void:
	scene_transition_completed.emit(scene_name)