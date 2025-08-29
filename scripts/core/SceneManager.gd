class_name SceneManager extends Node

signal scene_changed(scene_name: String)
signal loading_progress(progress: float)

var current_scene: Node
var is_loading: bool = false

func change_scene(scene_path: String) -> void:
	if is_loading:
		return
	
	is_loading = true
	
	if current_scene:
		current_scene.queue_free()
		await current_scene.tree_exited
	
	loading_progress.emit(0.5)
	
	var new_scene = load(scene_path)
	if new_scene:
		current_scene = new_scene.instantiate()
		get_tree().root.add_child(current_scene)
		scene_changed.emit(scene_path)
	
	loading_progress.emit(1.0)
	is_loading = false

func change_scene_async(scene_path: String) -> void:
	if is_loading:
		return
	
	is_loading = true
	
	if current_scene:
		current_scene.queue_free()
		await current_scene.tree_exited
	
	var loader = ResourceLoader.load_threaded_request(scene_path)
	
	while true:
		var progress = []
		var status = ResourceLoader.load_threaded_get_status(scene_path, progress)
		
		if status == ResourceLoader.THREAD_LOAD_INVALID_RESOURCE:
			push_error("Failed to load scene: " + scene_path)
			is_loading = false
			return
		elif status == ResourceLoader.THREAD_LOAD_FAILED:
			push_error("Loading failed for scene: " + scene_path)
			is_loading = false
			return
		elif status == ResourceLoader.THREAD_LOAD_LOADED:
			break
		
		loading_progress.emit(progress[0] if progress.size() > 0 else 0.0)
		await get_tree().process_frame
	
	var new_scene_resource = ResourceLoader.load_threaded_get(scene_path)
	if new_scene_resource:
		current_scene = new_scene_resource.instantiate()
		get_tree().root.add_child(current_scene)
		scene_changed.emit(scene_path)
	
	is_loading = false

func get_current_scene_name() -> String:
	if current_scene and current_scene.scene_file_path:
		return current_scene.scene_file_path.get_file().get_basename()
	return ""