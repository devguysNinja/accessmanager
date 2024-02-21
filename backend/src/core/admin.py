from datetime import datetime, timedelta
# from re import S
from django.contrib import admin
from django.utils.html import format_html
from import_export import fields, resources
from import_export.admin import (
    ExportActionModelAdmin,
    ImportMixin,
    ImportExportModelAdmin,
    ExportMixin,
)
from import_export.widgets import ForeignKeyWidget

from users.models import UserProfile
from .models import Transaction, ReportType
from .forms import CustomExportForm
from .reports import report


class ReportTypeAdmin(admin.ModelAdmin):
    list_display = [
        "upper_case_report_type",
        "created_on",
        "updated_on",
    ]

    def upper_case_report_type(self, obj):
        return f"{obj.report_type.upper()}"

    upper_case_report_type.short_description = "Report type uppercase"


admin.site.register(ReportType, ReportTypeAdmin)


class TransactionResouce(resources.ModelResource):
    def __init__(self, **kwargs):
        super().__init__()
        self.periodic_report = kwargs.get("periodic_report")
        self.custom_report = kwargs.get("custom_report")

    owner = fields.Field(
        column_name="owner",
        attribute="owner",
        widget=ForeignKeyWidget(UserProfile, field="user__username"),
    )

    def filter_export(self, queryset, *args, **kwargs):
        pr = report(report=str(self.periodic_report))
        if str(self.periodic_report) == "All":
            return report()
        if pr is None and (
            str(self.custom_report["start_date"]) == "None"
            or str(self.custom_report["end_date"]) == "None"
        ):
            return []
        if pr is not None and (
            str(self.custom_report["start_date"]) == "None"
            or str(self.custom_report["end_date"]) == "None"
        ):
            return pr
        try:
            return report(period=self.custom_report)
        except ValueError as e:
            return []

    class Meta:
        model = Transaction
        fields = (
            # "id",
            "swipe_count",
            "reader_uid",
            "date",
            "owner",
            "authorizer",
            "access_point",
            # "raw_payload",
            "door",
            "grant_type",
        )


# Register your models here.
class TransactionAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
        "owner",
        "reader_uid",
        "swipe_count",
        "date",
        "access_grant_type",
        "authorizer",
    ]
    resource_classes = [TransactionResouce]
    export_form_class = CustomExportForm
    list_per_page = 20
    search_fields = ['grant_type','date']
    list_filter = ["grant_type", "date", "owner"]
    show_full_result_count = False
    date_hierarchy = 'date'

    def access_grant_type(self, obj):
        if obj.grant_type == 'ACCESS DENIED':
            return format_html(f"<span style='color:red;'>{obj.grant_type}</span>")
        if obj.grant_type == 'ACCESS GRANTED':
            return format_html(f"<span style='color:green;'>{obj.grant_type}</span>")
    access_grant_type.admin_order_field = 'grant_type'


    def get_export_resource_kwargs(self, request, *args, **kwargs):
        export_form = kwargs["export_form"]
        if export_form:
            periodic_report = export_form.cleaned_data["periodic_report"]
            start_date = export_form.cleaned_data["start_date"]
            end_date = export_form.cleaned_data["end_date"]
            custom_report = dict(start_date=str(start_date), end_date=str(end_date))
            return dict(custom_report=custom_report, periodic_report=periodic_report)
        return {}


# Register your models here.
admin.site.register(Transaction, TransactionAdmin)
