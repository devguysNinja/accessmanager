from django.contrib import admin, messages
from django.http import HttpResponseRedirect
from django.urls import path
from django.urls.resolvers import URLPattern
from staffcalendar.models import MonthlyRoster
from .models import (
    EmployeeStatus,
    User,
    UserProfile,
    EmployeeCategory,
    Location,
    Department,
    EmployeeBatchUpload,
    Batch,
)
from .views import (
    create_category_from_excel,
    create_department_from_excel,
    create_group_from_excel,
    create_location_from_excel,
    create_status_from_excel,
    create_users_from_excel,
)


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
        "batch",
    ]


admin.site.register(UserProfile, UserProfileAdmin)


class BatchAdmin(admin.ModelAdmin):
    list_display = [
        "name",
    ]


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
    change_list_template = "user_change_list.html"
    list_display = ["batch_file", "date_uploaded",]

    def has_add_permission(self, request):
        if self.model.objects.count() >= MAX_OBJECTS:
            return False
        return super().has_add_permission(request)

    def get_urls(self) -> list[URLPattern]:
        urls = super().get_urls()
        my_urls = [
            path("populate-user-profile/", self.populate_user_profile_tables),
            path("populate-location/", self.populate_location_table),
            path("populate-emp-status/", self.populate_status_table),
            path("populate-category/", self.populate_category_table),
            path("populate-department/", self.populate_department_table),
            path("populate-group/", self.populate_group_table),
        ]
        return my_urls + urls

    def populate_user_profile_tables(self, request, obj=None):
        response = create_users_from_excel(request=request)
        print("###...THIS IS BULK", response)
        if response.status_code != 200:
            self.message_user(
                request, "Error: Tables not populated", level=messages.ERROR
            )
        if response.status_code == 200:
            self.message_user(
                request, "Success: Tables populated", level=messages.SUCCESS
            )
        return HttpResponseRedirect("../")

    def populate_location_table(self, request, obj=None):
        response = create_location_from_excel(request=request)
        if response.status_code != 200:
            self.message_user(
                request, "Error: Tables not populated", level=messages.ERROR
            )
        if response.status_code == 200:
            self.message_user(
                request, "Success: Tables populated", level=messages.SUCCESS
            )
        return HttpResponseRedirect("../")

    def populate_status_table(self, request, obj=None):
        response = create_status_from_excel(request=request)
        if response.status_code != 200:
            self.message_user(
                request, "Error: Tables not populated", level=messages.ERROR
            )
        if response.status_code == 200:
            self.message_user(
                request, "Success: Tables populated", level=messages.SUCCESS
            )
        return HttpResponseRedirect("../")

    def populate_category_table(self, request, obj=None):
        response = create_category_from_excel(request=request)
        if response.status_code != 200:
            self.message_user(
                request, "Error: Tables not populated", level=messages.ERROR
            )
        if response.status_code == 200:
            self.message_user(
                request, "Success: Tables populated", level=messages.SUCCESS
            )
        return HttpResponseRedirect("../")

    def populate_department_table(self, request, obj=None):
        response = create_department_from_excel(request=request)
        if response.status_code != 200:
            self.message_user(
                request, "Error: Tables not populated", level=messages.ERROR
            )
        if response.status_code == 200:
            self.message_user(
                request, "Success: Tables populated", level=messages.SUCCESS
            )
        return HttpResponseRedirect("../")

    def populate_group_table(self, request, obj=None):
        response = create_group_from_excel(request=request)
        if response.status_code != 200:
            self.message_user(
                request, "Error: Tables not populated", level=messages.ERROR
            )
        if response.status_code == 200:
            self.message_user(
                request, "Success: Tables populated", level=messages.SUCCESS
            )
        return HttpResponseRedirect("../")


admin.site.register(EmployeeBatchUpload, EmployeeBatchUploadAdmin)
