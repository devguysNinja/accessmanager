from django.contrib import admin
from .models import ShiftType, MonthlyRoster
from .forms import MonthlyRosterForm

# Register your models here.


class ShiftTypeAdmin(admin.ModelAdmin):
    list_display = ['shift_type',"name", "start_time", "end_time"]
    list_display_links =None # ["name"]
    list_editable = ["name", "start_time","end_time"]
    list_per_page = 20

    def shift_type(self, obj):
        return f"{obj.name.upper()}"


admin.site.register(ShiftType, ShiftTypeAdmin)

class EmployeeInline(admin.TabularInline):  # or admin.StackedInline
    model = MonthlyRoster.employees.through  # Through model for ManyToManyField
    extra = 1

class MonthlyRosterAdmin(admin.ModelAdmin):
    # form = MonthlyRosterForm
    list_display = ["work_day","shift", "week_no"]
    list_display_links =  ["work_day","shift", "week_no"]
    # list_editable = ["shift", "start_date", "end_date"]
    filter_horizontal = ["employees"]
    list_per_page = 20
    save_on_top = True
    # save_as = True
    # view_on_site = False
    # inlines = [EmployeeInline]  # Add the inline class here


admin.site.register(MonthlyRoster, MonthlyRosterAdmin)
