extends Control

# This is a minimal main menu that WILL work

func _ready():
	print("Minimal main menu loaded successfully!")
	
	# Create UI elements programmatically to ensure they work
	var vbox = VBoxContainer.new()
	vbox.position = Vector2(400, 300)
	add_child(vbox)
	
	var title = Label.new()
	title.text = "BATTLETECH MERCENARY COMMAND"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title)
	
	var spacer = Control.new()
	spacer.custom_minimum_size = Vector2(0, 50)
	vbox.add_child(spacer)
	
	var new_game_btn = Button.new()
	new_game_btn.text = "New Company"
	new_game_btn.custom_minimum_size = Vector2(200, 40)
	new_game_btn.pressed.connect(_on_new_game_pressed)
	vbox.add_child(new_game_btn)
	
	var quit_btn = Button.new()
	quit_btn.text = "Quit"
	quit_btn.custom_minimum_size = Vector2(200, 40)
	quit_btn.pressed.connect(_on_quit_pressed)
	vbox.add_child(quit_btn)
	
	print("UI elements created and connected")

func _on_new_game_pressed():
	print("NEW GAME BUTTON CLICKED!")
	var label = Label.new()
	label.text = "SUCCESS! Button works! Game would start here."
	label.position = Vector2(400, 500)
	label.add_theme_color_override("font_color", Color.GREEN)
	add_child(label)

func _on_quit_pressed():
	print("QUIT BUTTON CLICKED!")
	get_tree().quit()