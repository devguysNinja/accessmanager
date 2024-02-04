from datetime import datetime, timedelta
from re import S
from django.contrib import admin
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
    pass


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
        print("&&&&&&& CUSTOM REPORT:", str(self.custom_report["start_date"]))
        pr = report(report=str(self.periodic_report))
        print("##### PR: ", pr)
        if str(self.periodic_report) == "All":
            print("##### REPORT IINER: ", self.periodic_report)
            return report()
        if pr is None and (
            str(self.custom_report["start_date"]) == "None"
            or str(self.custom_report["end_date"]) == "None"
        ):
            return []
        if pr is not None and (str(self.custom_report['start_date']) =="None" or 
                               str(self.custom_report['end_date']) =="None"):
            return pr
        try:
            # type(self.custom_report["start_date"]) is not None
            # and type(self.custom_report["end_date"]) is not None
            print("&&&&&&& CUSTOM REPORT2:", type(self.custom_report["start_date"]))
            return report(period=self.custom_report)
        except ValueError as e:
            print("&&&&&&& CUSTOM ERROR: ", e.args[0])
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
    resource_classes = [TransactionResouce]
    export_form_class = CustomExportForm

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
