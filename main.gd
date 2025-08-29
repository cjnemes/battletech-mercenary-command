extends SceneTree

func _initialize() -> void:
	# Create and add GameManager as autoload
	var game_manager = preload("res://scripts/core/GameManager.gd").new()
	game_manager.name = "GameManager"
	
	# Add to the root before the current scene
	root.add_child(game_manager)
	root.move_child(game_manager, 0)