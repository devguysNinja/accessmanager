from django import forms
from users.models import UserProfile
from .models import MonthlyRoster


class MonthlyRosterForm(forms.ModelForm):
    employees = forms.ModelMultipleChoiceField(
        queryset=UserProfile.objects.all(), widget=forms.CheckboxSelectMultiple
    )

    class Meta:
        model = MonthlyRoster
        fields = "__all__"

    # def __init__(self, *args, **kwargs):
        # super(MonthlyRosterForm, self).__init__(*args, **kwargs)
        # self.fields["employees"].widget = forms.CheckboxSelectMultiple()
