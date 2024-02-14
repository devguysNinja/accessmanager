from django.contrib import admin, messages
from .models import User, UserProfile, EmployeeBatchUpload
from .views import bulk_create

class UserAdmin(admin.ModelAdmin):
    change_list_template = 'user_change_list.html'
    pass
# Register your models here.
admin.site.register(User, UserAdmin)


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('__str__',)
# Register your models here.
admin.site.register(UserProfile, UserProfileAdmin)


MAX_OBJECTS = 1
class EmployeeBatchUploadAdmin(admin.ModelAdmin):
    actions = ['populate_with_batch_data']

    def has_add_permission(self, request):
        if self.model.objects.count() >= MAX_OBJECTS:
            return False
        return super().has_add_permission(request)

    def populate_with_batch_data(self, request, queryset):
        response = bulk_create(request=request)
        print("###...THIS IS BULK",response)
        if response.status_code != 200:
            self.message_user(request, "Error: Tables not populated", level=messages.ERROR)
    populate_with_batch_data.short_description = "Populate with batch data"


# Register your models here.
admin.site.register(EmployeeBatchUpload, EmployeeBatchUploadAdmin)
