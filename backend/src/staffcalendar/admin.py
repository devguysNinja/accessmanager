from django.contrib import admin
from .models import ShiftType, MonthlyRoster

# Register your models here.


class ShiftTypeAdmin(admin.ModelAdmin):
    list_display = ['shift_type',"name", "start_time", "end_time"]
    list_display_links =None # ["name"]
    list_editable = ["name", "start_time","end_time"]
    list_per_page = 20

    def shift_type(self, obj):
        return f"{obj.name.upper()}"


admin.site.register(ShiftType, ShiftTypeAdmin)


class MonthlyRosterAdmin(admin.ModelAdmin):
    list_display = ["shift", "start_date", "end_date"]
    # list_display_links = None # ["shift", "start_date", "end_date"]
    # list_editable = ["shift", "start_date", "end_date"]
    list_per_page = 20


admin.site.register(MonthlyRoster, MonthlyRosterAdmin)
