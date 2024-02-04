from django import forms
from import_export.forms import ExportForm
from .models import ReportType


class CustomExportForm(ExportForm):
    # export_formats = ['xlsx']
    REPORT_TYPE = [("DA", "Daily"), ("WE", "Weekly"), ("MO", "Monthly"), ("NO", "None")]
    periodic_report = forms.ModelChoiceField(
        queryset=ReportType.objects.all(), required=False
    )
    # custom_report = forms.DateInput(max_length=25, required=False)
    start_date = forms.DateField(
        required=False, widget=forms.DateInput(attrs={"placeholder": "YYYY-MM-DD"})
    )
    end_date = forms.DateField(
        required=False, widget=forms.DateInput(attrs={"placeholder": "YYYY-MM-DD"})
    )
