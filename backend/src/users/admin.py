from django.contrib import admin, messages
from .models import User, UserProfile, EmployeeBatchUpload
from .forms import UserProfileForm
from .views import bulk_create


class UserAdmin(admin.ModelAdmin):
    # change_list_template = "user_change_list.html"
    list_display = [
        "first_name",
        "last_name",
        "username",
        "email",
        "is_active",
        "is_staff",
        "is_superuser",
    ]


# Register your models here.
admin.site.register(User, UserAdmin)


class UserProfileAdmin(admin.ModelAdmin):
    form = UserProfileForm
    list_display = [
        "user",
        "reader_uid",
        "meal_category",
        "department",
        "profile_image",
        "shift"
    ]
    filter_horizontal = ["roster"]
    # readonly_fields = ["reader_uid", "user"]
    list_per_page: int = 20
    save_on_top: bool = True

    def shift(self, obj):
        return f"{', '.join([shift.work_day for shift in obj.roster.all()][::-1])}"
    shift.short_description = 'Shifts'


# Register your models here.
admin.site.register(UserProfile, UserProfileAdmin)


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
            self.message_user(request, "Success: Tables populated", level=messages.SUCCESS)

    populate_with_batch_data.short_description = "Populate with batch data"


# Register your models here.
admin.site.register(EmployeeBatchUpload, EmployeeBatchUploadAdmin)
