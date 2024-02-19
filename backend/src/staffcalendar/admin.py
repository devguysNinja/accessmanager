from django.contrib import admin
from .models import ShiftType, MonthlyRoster
# Register your models here.


class ShiftTypeAdmin(admin.ModelAdmin):
    pass

admin.site.register(ShiftType, ShiftTypeAdmin)

class MonthlyRosterAdmin(admin.ModelAdmin):
    pass

admin.site.register(MonthlyRoster,MonthlyRosterAdmin)
