from django.contrib import admin
from django.utils.html import format_html
from .models import ShiftType, MonthlyRoster, WorkDay
from .forms import MonthlyRosterForm

# Register your models here.


class ShiftTypeAdmin(admin.ModelAdmin):
    list_display = ["shift_type", "name", "start_time", "end_time"]
    list_display_links = None  # ["name"]
    list_editable = ["name", "start_time", "end_time"]
    list_per_page = 20

    def shift_type(self, obj):
        return f"{obj.name.upper()}"


admin.site.register(ShiftType, ShiftTypeAdmin)


class WorkDayAdmin(admin.ModelAdmin):
    list_display = ["day_symbol", "day_code"]
    list_display_links = None
    list_editable = ["day_symbol", "day_code"]


admin.site.register(WorkDay, WorkDayAdmin)


class MonthlyRosterAdmin(admin.ModelAdmin):
    # form = MonthlyRosterForm
    list_display = [
        # "shift_days",
        "work_day",
        "shift",
        "batch",
        # "shift_members",
        "week_start_date",
        "shift_date"
    ]
    list_display_links = [
        "shift_date",
        "shift",
        #   "week_no",
    ]
    # list_editable = ["shift", "start_date", "end_date"]
    # filter_horizontal = ["employees"]
    list_per_page = 20
    save_on_top = True


#
#     def shift_members(self, obj):
#         members = [members.user.username for members in obj.employees.all()]
#         print("****Members: ", members)
#         html = ""
#         for mem in members:
#             html += f"<b>{mem}</b><br>"
#         print( "&&&&&&&&HTML",html)
#
#         return format_html(html)
#         # return f"{', '.join(members)}"
#
#     shift_members.short_description = "Members"

#     def shift_days(self, obj):
#         work_days = [days.day_symbol for days in obj.work_days.all()]
#         print("Work-days: ", work_days)
#         return f"{', '.join(work_days)}"
#
#     shift_days.short_description = "Shift days"


admin.site.register(MonthlyRoster, MonthlyRosterAdmin)
