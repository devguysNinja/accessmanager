from django.contrib import admin
from .models import ShiftType, MonthlyRoster

# Register your models here.


class ShiftTypeAdmin(admin.ModelAdmin):
    list_display = ["name", "start_time", "end_time"]


admin.site.register(ShiftType, ShiftTypeAdmin)


class MonthlyRosterAdmin(admin.ModelAdmin):
    list_display = ["shift", "start_date", "end_date"]


admin.site.register(MonthlyRoster, MonthlyRosterAdmin)
