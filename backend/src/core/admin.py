
# from re import S
from django.contrib import admin, messages
from django.http import HttpResponseRedirect
from django.urls import path
from django.urls import URLPattern
from django.utils.html import format_html

from .views import create_drink_category_from_excel
from .models import Transaction, Drink, DrinkCategory, DrinkCart


class DrinkCartAdmin(admin.ModelAdmin):
    list_display = ["drink", "qty", "transaction", "reader_uid", "order_date"]

admin.site.register(DrinkCart, DrinkCartAdmin)


class DrinksAdmin(admin.ModelAdmin):
    change_list_template = "core_change_list.html"
    list_display = ["drink", "type"]

    def get_urls(self) -> list[URLPattern]:
        urls = super().get_urls()
        my_urls = [
            path("populate-drink-category/", self.populate_drink_category_table),
        ]
        return my_urls + urls

    def populate_drink_category_table(self, request, obj=None):
        response = create_drink_category_from_excel(request=request)
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


admin.site.register(Drink, DrinksAdmin)


class DrinkCategoryAdmin(admin.ModelAdmin):
    change_list_template = "core_change_list.html"
    list_display = ["name"]

    def get_urls(self) -> list[URLPattern]:
        urls = super().get_urls()
        my_urls = [
            path("populate-drink-category/", self.populate_drink_category_table),
        ]
        return my_urls + urls

    def populate_drink_category_table(self, request, obj=None):
        response = create_drink_category_from_excel(request=request)
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


admin.site.register(DrinkCategory, DrinkCategoryAdmin)

class TransactionAdmin(admin.ModelAdmin):
    list_display = [
        "owner",
        "reader_uid",
        "swipe_count",
        "date",
        "access_grant_type",
        "authorizer",
    ]
    list_per_page = 20
    search_fields = ["grant_type", "date"]
    list_filter = ["grant_type", "date", "owner"]
    show_full_result_count = False
    date_hierarchy = "date"

    def access_grant_type(self, obj):
        if obj.grant_type == "ACCESS DENIED":
            return format_html(f"<span style='color:red;'>{obj.grant_type}</span>")
        if obj.grant_type == "ACCESS GRANTED":
            return format_html(f"<span style='color:green;'>{obj.grant_type}</span>")

    access_grant_type.admin_order_field = "grant_type"


# Register your models here.
admin.site.register(Transaction, TransactionAdmin)
