from django.contrib import admin, messages
from django.http import HttpResponseRedirect
from django.urls import URLPattern, path
from django.utils.html import format_html


from .models import ShiftType, MonthlyRoster, WorkDay
from .forms import MonthlyRosterForm
from .views import create_shift_type_from_excel, create_workday_from_excel

# Register your models here.


class ShiftTypeAdmin(admin.ModelAdmin):
	change_list_template = "staffcalendar_change_list_shift.html"
	list_display = ["shift_type", "name", "start_time", "end_time","duration"]
	list_display_links = None # ["name"]
	list_editable = ["name", "start_time", "end_time", "duration"]
	list_per_page = 20

	def shift_type(self, obj):
		return f"{obj.name.upper()}"

	def get_urls(self) -> list[URLPattern]:
		urls = super().get_urls()
		my_urls = [
			path("populate-shift-type/", self.populate_shift_type_table),
		]
		return my_urls + urls

	def populate_shift_type_table(self, request, obj=None):
		response = create_shift_type_from_excel(request=request)
		print("!!!=>>>Response data", response.data)
		if response.status_code != 200:
			self.message_user(
				request, "Error: Tables not populated", level=messages.ERROR
			)
		if response.status_code == 200:
			self.message_user(
				request, "Success: Tables populated", level=messages.SUCCESS
			)
		return HttpResponseRedirect("../")

admin.site.register(ShiftType, ShiftTypeAdmin)


class WorkDayAdmin(admin.ModelAdmin):
	change_list_template = "staffcalendar_change_list_workday.html"
	list_display = ["day_symbol", "day_code"]
	list_display_links = None
	list_editable = ["day_symbol", "day_code"]
 
	def get_urls(self) -> list[URLPattern]:
		urls = super().get_urls()
		my_urls = [
			path("populate-workday/", self.populate_workday_table),
		]
		return my_urls + urls

	def populate_workday_table(self, request, obj=None):
		response = create_workday_from_excel(request=request)
		print("!!!=>>>Response data", response.data)
		if response.status_code != 200:
			self.message_user(
				request, "Error: Tables not populated", level=messages.ERROR
			)
		if response.status_code == 200:
			self.message_user(
				request, "Success: Tables populated", level=messages.SUCCESS
			)
		return HttpResponseRedirect("../")

admin.site.register(WorkDay, WorkDayAdmin)


class MonthlyRosterAdmin(admin.ModelAdmin):
	change_list_template = "staffcalendar_change_list.html"
	list_display = [
		# "shift_days",
		"work_day",
		"shift",
		"batch",
		# "shift_members",
		"week_start_date",
		"shift_start_date",
		"shift_end_date"
	]
	list_display_links = [
		"shift_start_date",
		"shift_end_date",
		"shift",
		#   "week_no",
	]
	# list_editable = ["shift", "start_date", "end_date"]
	# filter_horizontal = ["employees"]
	list_per_page = 20
	save_on_top = True


admin.site.register(MonthlyRoster, MonthlyRosterAdmin)
