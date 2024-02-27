from django import forms
from users.models import UserProfile
from .models import MonthlyRoster,WorkDay,ShiftType


class MonthlyRosterForm(forms.ModelForm):
    work_days = forms.ModelMultipleChoiceField(
        queryset=WorkDay.objects.all(), widget=forms.CheckboxSelectMultiple
    )
    # employees = forms.ModelMultipleChoiceField(
        # queryset=UserProfile.objects.all(), widget=forms.CheckboxSelectMultiple
    # )
    shifts = forms.ModelMultipleChoiceField(
        queryset=ShiftType.objects.all(), widget=forms.CheckboxSelectMultiple
    )

    class Meta:
        model = MonthlyRoster
        fields = "__all__"

    # def __init__(self, *args, **kwargs):
    # super(MonthlyRosterForm, self).__init__(*args, **kwargs)
    # self.fields["employees"].widget = forms.CheckboxSelectMultiple()
