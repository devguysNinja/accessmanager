from django import forms
from users.models import UserProfile
from .models import User
from staffcalendar.models import MonthlyRoster


class UserProfileForm(forms.ModelForm):
    user = forms.CharField()
    roster = forms.ModelMultipleChoiceField(
        queryset=MonthlyRoster.objects.all().order_by("-shift"), widget=forms.CheckboxSelectMultiple
    )

    class Meta:
        model = UserProfile
        fields = "__all__"


