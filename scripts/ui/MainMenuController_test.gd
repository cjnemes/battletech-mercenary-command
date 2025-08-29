extends Control

func _on_new_game_button_pressed() -> void:
	print("New Game button clicked!")
	# Simple scene change without GameManager
	get_tree().change_scene_to_file("res://scenes/management/CompanyOverview.tscn")

func _on_load_game_button_pressed() -> void:
	print("Load Game button clicked!")

func _on_settings_button_pressed() -> void:
	print("Settings button clicked!")

func _on_quit_button_pressed() -> void:
	print("Quit button clicked!")
	get_tree().quit()