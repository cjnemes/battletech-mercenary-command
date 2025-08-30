extends Node

func _ready():
	print("=== SUPER SIMPLE TEST ===")
	print("If you see this message, Godot is working!")
	print("Creating a simple button...")
	
	# Create the most basic possible UI
	var button = Button.new()
	button.text = "CLICK ME"
	button.size = Vector2(200, 50)
	button.position = Vector2(400, 300)
	
	# Add to scene tree
	get_tree().current_scene.add_child(button)
	
	# Connect the signal
	button.pressed.connect(_on_button_clicked)
	
	print("Button created and added to scene")

func _on_button_clicked():
	print("*** BUTTON CLICKED! IT WORKS! ***")
	# Change button text to show it worked
	var button = get_tree().current_scene.get_child(-1)
	button.text = "SUCCESS!"