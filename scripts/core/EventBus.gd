class_name EventBus extends Node

signal mech_destroyed(mech_id: String)
signal pilot_killed(pilot_id: String)
signal contract_completed(contract_id: String, success: bool)
signal reputation_changed(faction: String, old_rep: int, new_rep: int)
signal funds_changed(old_amount: int, new_amount: int)
signal time_advanced(days_passed: int)

signal combat_started(mission_data: Dictionary)
signal combat_ended(results: Dictionary)
signal turn_started(unit_id: String)
signal turn_ended(unit_id: String)
signal unit_moved(unit_id: String, from_pos: Vector2i, to_pos: Vector2i)
signal weapon_fired(attacker_id: String, target_id: String, weapon_type: String)
signal damage_dealt(target_id: String, damage: int, location: String)

signal ui_notification(message: String, type: String)
signal dialog_requested(dialog_type: String, data: Dictionary)

var _listeners: Dictionary = {}

func subscribe(event_name: String, callback: Callable) -> void:
	if not _listeners.has(event_name):
		_listeners[event_name] = []
	
	if not _listeners[event_name].has(callback):
		_listeners[event_name].append(callback)

func unsubscribe(event_name: String, callback: Callable) -> void:
	if _listeners.has(event_name):
		_listeners[event_name].erase(callback)
		if _listeners[event_name].is_empty():
			_listeners.erase(event_name)

func emit_custom(event_name: String, data: Dictionary = {}) -> void:
	if _listeners.has(event_name):
		for callback in _listeners[event_name]:
			callback.call(data)

func clear_all_listeners() -> void:
	_listeners.clear()