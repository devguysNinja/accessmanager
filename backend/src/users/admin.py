from django.contrib import admin, messages
from staffcalendar.models import MonthlyRoster
from .models import (
    EmployeeStatus,
    User,
    UserProfile,
    EmployeeCategory,
    Location,
    Department,
    EmployeeBatchUpload,
    Batch
)
from .views import bulk_create


class UserAdmin(admin.ModelAdmin):
    # change_list_template = "user_change_list.html"
    list_display = [
        "first_name",
        "last_name",
        "middle_name",
        "username",
        "email",
        "is_active",
        "is_staff",
        "is_superuser",
    ]


# Register your models here.
admin.site.register(User, UserAdmin)


class UserProfileAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "reader_uid",
        "category",
        "department",
        "employee_status",
        "employee_id",
        "location",
        "profile_image",
        "batch"
    ]


#     def employee_shift(self, obj):
#         rosters_for_employee = MonthlyRoster.objects.filter(employees=obj)
#         employee_shift = [shift.shift.name for shift in rosters_for_employee
#                           ]
#         employee_time = [(shift.shift.start_time, shift.shift.end_time) for shift in rosters_for_employee]
#         print("78888:",employee_time)
#         print("++++++++++++",employee_shift)
#         assigned_work_days = [roster.work_days.all() for roster in rosters_for_employee]
#         if len(assigned_work_days) > 0:
#             work_days = [work_days[::1] for work_days in assigned_work_days]
#             day_list = [day.day_symbol for days in work_days for day in days]
#             print("************", day_list)
#             return f"{', '.join(set(day_list))}"
#         elif len(assigned_work_days) == 0:
#             print("======", assigned_work_days)
#
#     employee_shift.short_description = "Shift days"
admin.site.register(UserProfile, UserProfileAdmin)



class BatchAdmin(admin.ModelAdmin):
    list_display = ["name", ]


admin.site.register(Batch, BatchAdmin)

class LocationAdmin(admin.ModelAdmin):
    list_display = ["name", "address"]


admin.site.register(Location, LocationAdmin)


class EmployeeStatusAdmin(admin.ModelAdmin):
    list_display = ["status", "description"]


admin.site.register(EmployeeStatus, EmployeeStatusAdmin)


class EmployeeCategoryAdmin(admin.ModelAdmin):
    list_display = ["cat_name", "meal_access", "drink_access", "description"]


admin.site.register(EmployeeCategory, EmployeeCategoryAdmin)


class DepartmentAdmin(admin.ModelAdmin):
    list_display = ["dept_name"]


admin.site.register(Department, DepartmentAdmin)


MAX_OBJECTS = 1


class EmployeeBatchUploadAdmin(admin.ModelAdmin):
    actions = ["populate_with_batch_data"]
    list_display = ["batch_file", "date_uploaded", "uploaded_by"]

    def has_add_permission(self, request):
        if self.model.objects.count() >= MAX_OBJECTS:
            return False
        return super().has_add_permission(request)

    def populate_with_batch_data(self, request, queryset):
        response = bulk_create(request=request)

        print("###...THIS IS BULK", response)
        if response.status_code != 200:
            self.message_user(
                request, "Error: Tables not populated", level=messages.ERROR
            )
        if response.status_code == 200:
            self.message_user(
                request, "Success: Tables populated", level=messages.SUCCESS
            )

    populate_with_batch_data.short_description = "Populate with batch data"


admin.site.register(EmployeeBatchUpload, EmployeeBatchUploadAdmin)


# ....########################################
"""
# class UserAdmin(admin.ModelAdmin):
#     # change_list_template = "user_change_list.html"
#     list_display = [
#         "first_name",
#         "last_name",
#         "username",
#         "email",
#         "is_active",
#         "is_staff",
#         "is_superuser",
#     ]

# 
# # Register your models here.
# admin.site.register(User, UserAdmin)

# 
# class UserProfileAdmin(admin.ModelAdmin):
#     list_display = [
#         "user",
#         "reader_uid",
#         "meal_category",
#         "department",
#         "profile_image",
#         "employee_shift",
#     ]
# 
#     def employee_shift(self, obj):
#         rosters_for_employee = MonthlyRoster.objects.filter(employees=obj)
#         employee_shift = [shift.shift.name for shift in rosters_for_employee
#                           ]
#         employee_time = [(shift.shift.start_time, shift.shift.end_time) for shift in rosters_for_employee]
#         print("78888:",employee_time)
#         print("++++++++++++",employee_shift)
#         assigned_work_days = [roster.work_days.all() for roster in rosters_for_employee]
#         if len(assigned_work_days) > 0:
#             work_days = [work_days[::1] for work_days in assigned_work_days]
#             day_list = [day.day_symbol for days in work_days for day in days]
#             print("************", day_list)
#             return f"{', '.join(set(day_list))}"
#         elif len(assigned_work_days) == 0:
#             print("======", assigned_work_days)
# 
#     employee_shift.short_description = "Shift days"
# 
# 
# # Register your models here.
# admin.site.register(UserProfile, UserProfileAdmin)
"""
