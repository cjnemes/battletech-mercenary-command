class_name HexGrid extends Node2D

signal hex_clicked(hex_pos: Vector2i)
signal hex_hovered(hex_pos: Vector2i)

const HEX_SIZE: float = 32.0
const HEX_WIDTH: float = HEX_SIZE * 2.0
const HEX_HEIGHT: float = HEX_SIZE * sqrt(3.0)

var grid_width: int = 20
var grid_height: int = 15

var terrain_data: Dictionary = {}  # Vector2i -> TerrainType
var elevation_data: Dictionary = {}  # Vector2i -> int (0-5)
var unit_positions: Dictionary = {}  # Vector2i -> CombatUnit

var highlighted_hexes: Array[Vector2i] = []
var movement_range_hexes: Array[Vector2i] = []
var attack_range_hexes: Array[Vector2i] = []

enum TerrainType { 
	CLEAR, 
	FOREST, 
	ROUGH, 
	URBAN, 
	WATER, 
	MOUNTAIN 
}

var terrain_colors: Dictionary = {
	TerrainType.CLEAR: Color(0.4, 0.7, 0.3),      # Light green
	TerrainType.FOREST: Color(0.2, 0.5, 0.2),     # Dark green  
	TerrainType.ROUGH: Color(0.6, 0.5, 0.4),      # Brown
	TerrainType.URBAN: Color(0.6, 0.6, 0.7),      # Gray
	TerrainType.WATER: Color(0.3, 0.5, 0.8),      # Blue
	TerrainType.MOUNTAIN: Color(0.5, 0.4, 0.3)    # Dark brown
}

func _ready() -> void:
	generate_terrain()

func _draw() -> void:
	draw_hex_grid()
	draw_terrain()
	draw_overlays()
	draw_units()

func _input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		if event.button_index == MOUSE_BUTTON_LEFT:
			var hex_pos = screen_to_hex(event.position)
			if is_valid_hex(hex_pos):
				hex_clicked.emit(hex_pos)
	
	elif event is InputEventMouseMotion:
		var hex_pos = screen_to_hex(event.position)
		if is_valid_hex(hex_pos):
			hex_hovered.emit(hex_pos)

func generate_terrain() -> void:
	for x in range(grid_width):
		for y in range(grid_height):
			var hex_pos = Vector2i(x, y)
			
			# Generate random terrain with some clustering
			var noise_value = randf()
			var terrain_type: TerrainType
			
			if noise_value < 0.4:
				terrain_type = TerrainType.CLEAR
			elif noise_value < 0.6:
				terrain_type = TerrainType.FOREST
			elif noise_value < 0.75:
				terrain_type = TerrainType.ROUGH
			elif noise_value < 0.85:
				terrain_type = TerrainType.URBAN
			elif noise_value < 0.95:
				terrain_type = TerrainType.WATER
			else:
				terrain_type = TerrainType.MOUNTAIN
			
			terrain_data[hex_pos] = terrain_type
			elevation_data[hex_pos] = randi_range(0, 3)

func draw_hex_grid() -> void:
	var line_color = Color(0.3, 0.3, 0.3, 0.5)
	var line_width = 1.0
	
	for x in range(grid_width):
		for y in range(grid_height):
			var hex_pos = Vector2i(x, y)
			var center = hex_to_screen(hex_pos)
			draw_hex_outline(center, HEX_SIZE, line_color, line_width)

func draw_terrain() -> void:
	for x in range(grid_width):
		for y in range(grid_height):
			var hex_pos = Vector2i(x, y)
			var center = hex_to_screen(hex_pos)
			var terrain_type = terrain_data.get(hex_pos, TerrainType.CLEAR)
			var elevation = elevation_data.get(hex_pos, 0)
			
			var base_color = terrain_colors.get(terrain_type, Color.WHITE)
			
			# Modify color based on elevation
			var elevation_modifier = 1.0 + (elevation * 0.1)
			var final_color = Color(
				base_color.r * elevation_modifier,
				base_color.g * elevation_modifier,
				base_color.b * elevation_modifier,
				0.8
			)
			
			draw_hex_filled(center, HEX_SIZE * 0.9, final_color)

func draw_overlays() -> void:
	# Draw movement range
	for hex_pos in movement_range_hexes:
		var center = hex_to_screen(hex_pos)
		draw_hex_filled(center, HEX_SIZE * 0.7, Color(0.0, 1.0, 0.0, 0.3))
	
	# Draw attack range
	for hex_pos in attack_range_hexes:
		var center = hex_to_screen(hex_pos)
		draw_hex_outline(center, HEX_SIZE * 0.8, Color(1.0, 0.0, 0.0, 0.6), 2.0)
	
	# Draw highlighted hexes
	for hex_pos in highlighted_hexes:
		var center = hex_to_screen(hex_pos)
		draw_hex_outline(center, HEX_SIZE, Color(1.0, 1.0, 0.0, 0.8), 3.0)

func draw_units() -> void:
	for hex_pos in unit_positions.keys():
		var unit = unit_positions[hex_pos]
		if unit:
			draw_unit(hex_pos, unit)

func draw_unit(hex_pos: Vector2i, unit) -> void:
	var center = hex_to_screen(hex_pos)
	
	# Draw unit based on weight class with distinctive shapes
	var unit_color = Color.BLUE if unit.is_player_unit else Color.RED
	var size_modifier = 1.0
	
	# Different shapes for different weight classes
	match unit.weight_class:
		MechData.WeightClass.LIGHT:
			draw_circle(center, HEX_SIZE * 0.3, unit_color)
			size_modifier = 0.3
		MechData.WeightClass.MEDIUM:
			draw_circle(center, HEX_SIZE * 0.4, unit_color)
			size_modifier = 0.4
		MechData.WeightClass.HEAVY:
			draw_circle(center, HEX_SIZE * 0.5, unit_color)
			size_modifier = 0.5
		MechData.WeightClass.ASSAULT:
			draw_circle(center, HEX_SIZE * 0.6, unit_color)
			size_modifier = 0.6
	
	# Draw facing indicator
	var facing_offset = Vector2(cos(unit.facing_angle), sin(unit.facing_angle)) * HEX_SIZE * size_modifier
	draw_line(center, center + facing_offset, Color.WHITE, 2.0)
	
	# Draw health indicator
	var health_percent = float(unit.current_health) / float(unit.max_health)
	var health_color = Color.GREEN.lerp(Color.RED, 1.0 - health_percent)
	var health_bar_width = HEX_SIZE * size_modifier * 2.0
	var health_bar_height = 4.0
	var health_bar_pos = center - Vector2(health_bar_width / 2.0, HEX_SIZE * size_modifier + 8.0)
	
	# Background
	draw_rect(Rect2(health_bar_pos, Vector2(health_bar_width, health_bar_height)), Color.BLACK)
	# Health bar
	draw_rect(Rect2(health_bar_pos, Vector2(health_bar_width * health_percent, health_bar_height)), health_color)

func draw_hex_filled(center: Vector2, size: float, color: Color) -> void:
	var points: PackedVector2Array = []
	for i in range(6):
		var angle = deg_to_rad(60.0 * i)
		var point = center + Vector2(cos(angle), sin(angle)) * size
		points.append(point)
	draw_colored_polygon(points, color)

func draw_hex_outline(center: Vector2, size: float, color: Color, width: float) -> void:
	var points: PackedVector2Array = []
	for i in range(7):  # 7 points to close the polygon
		var angle = deg_to_rad(60.0 * i)
		var point = center + Vector2(cos(angle), sin(angle)) * size
		points.append(point)
	
	for i in range(points.size() - 1):
		draw_line(points[i], points[i + 1], color, width)

func hex_to_screen(hex_pos: Vector2i) -> Vector2:
	var x = hex_pos.x * HEX_WIDTH * 0.75
	var y = hex_pos.y * HEX_HEIGHT + (hex_pos.x % 2) * HEX_HEIGHT * 0.5
	return Vector2(x, y) + Vector2(HEX_SIZE, HEX_SIZE)  # Offset for margin

func screen_to_hex(screen_pos: Vector2) -> Vector2i:
	# Offset for margin
	screen_pos -= Vector2(HEX_SIZE, HEX_SIZE)
	
	# Convert to hex coordinates (approximation)
	var x = int(screen_pos.x / (HEX_WIDTH * 0.75))
	var y = int((screen_pos.y - (x % 2) * HEX_HEIGHT * 0.5) / HEX_HEIGHT)
	
	return Vector2i(x, y)

func is_valid_hex(hex_pos: Vector2i) -> bool:
	return hex_pos.x >= 0 and hex_pos.x < grid_width and hex_pos.y >= 0 and hex_pos.y < grid_height

func get_hex_distance(hex_a: Vector2i, hex_b: Vector2i) -> int:
	# Convert to cube coordinates for distance calculation
	var a_cube = hex_to_cube(hex_a)
	var b_cube = hex_to_cube(hex_b)
	
	return max(abs(a_cube.x - b_cube.x), abs(a_cube.y - b_cube.y), abs(a_cube.z - b_cube.z))

func hex_to_cube(hex_pos: Vector2i) -> Vector3i:
	var x = hex_pos.x
	var z = hex_pos.y - (hex_pos.x - (hex_pos.x & 1)) / 2
	var y = -x - z
	return Vector3i(x, y, z)

func get_hexes_in_range(center: Vector2i, range: int) -> Array[Vector2i]:
	var hexes: Array[Vector2i] = []
	
	for x in range(center.x - range, center.x + range + 1):
		for y in range(center.y - range, center.y + range + 1):
			var hex_pos = Vector2i(x, y)
			if is_valid_hex(hex_pos) and get_hex_distance(center, hex_pos) <= range:
				hexes.append(hex_pos)
	
	return hexes

func set_movement_range(hexes: Array[Vector2i]) -> void:
	movement_range_hexes = hexes
	queue_redraw()

func set_attack_range(hexes: Array[Vector2i]) -> void:
	attack_range_hexes = hexes
	queue_redraw()

func set_highlighted_hexes(hexes: Array[Vector2i]) -> void:
	highlighted_hexes = hexes
	queue_redraw()

func place_unit(hex_pos: Vector2i, unit) -> void:
	unit_positions[hex_pos] = unit
	queue_redraw()

func remove_unit(hex_pos: Vector2i) -> void:
	unit_positions.erase(hex_pos)
	queue_redraw()

func move_unit(from: Vector2i, to: Vector2i) -> bool:
	if not unit_positions.has(from):
		return false
	
	var unit = unit_positions[from]
	unit_positions.erase(from)
	unit_positions[to] = unit
	queue_redraw()
	return true

func get_terrain_type(hex_pos: Vector2i) -> TerrainType:
	return terrain_data.get(hex_pos, TerrainType.CLEAR)

func get_elevation(hex_pos: Vector2i) -> int:
	return elevation_data.get(hex_pos, 0)

func get_movement_cost(hex_pos: Vector2i) -> int:
	var terrain_type = get_terrain_type(hex_pos)
	match terrain_type:
		TerrainType.CLEAR: return 1
		TerrainType.FOREST: return 2
		TerrainType.ROUGH: return 2
		TerrainType.URBAN: return 1
		TerrainType.WATER: return 4
		TerrainType.MOUNTAIN: return 3
		_: return 1

func clear_overlays() -> void:
	movement_range_hexes.clear()
	attack_range_hexes.clear()
	highlighted_hexes.clear()
	queue_redraw()