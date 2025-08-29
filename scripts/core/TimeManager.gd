class_name TimeManager extends Node

signal day_passed(current_day: int)
signal week_passed(current_week: int)
signal month_passed(current_month: int)
signal year_passed(current_year: int)

var current_day: int = 1
var current_month: int = 1
var current_year: int = 3025  # Start in classic Battletech era
var days_in_month: int = 30
var months_in_year: int = 12

var time_scale: float = 1.0
var is_paused: bool = false

func _ready() -> void:
	set_process(false)  # Only process when time needs to advance

func advance_time(days: int = 1) -> void:
	if is_paused:
		return
	
	for i in days:
		advance_single_day()

func advance_single_day() -> void:
	current_day += 1
	day_passed.emit(current_day)
	
	if current_day > days_in_month:
		advance_month()

func advance_month() -> void:
	current_day = 1
	current_month += 1
	month_passed.emit(current_month)
	
	if current_month > months_in_year:
		advance_year()

func advance_year() -> void:
	current_month = 1
	current_year += 1
	year_passed.emit(current_year)

func get_current_date_string() -> String:
	return "%02d/%02d/%d" % [current_day, current_month, current_year]

func get_current_date_long() -> String:
	var month_names = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	]
	
	var month_name = month_names[current_month - 1] if current_month <= month_names.size() else "Unknown"
	return "%s %d, %d" % [month_name, current_day, current_year]

func get_total_days() -> int:
	return ((current_year - 3025) * months_in_year * days_in_month) + ((current_month - 1) * days_in_month) + current_day

func set_date(day: int, month: int, year: int) -> void:
	current_day = clamp(day, 1, days_in_month)
	current_month = clamp(month, 1, months_in_year)
	current_year = max(year, 3025)

func pause_time() -> void:
	is_paused = true

func resume_time() -> void:
	is_paused = false

func set_time_scale(scale: float) -> void:
	time_scale = max(0.1, scale)