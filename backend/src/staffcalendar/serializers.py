from rest_framework import serializers

from users.models import Batch
from .models import MonthlyRoster, ShiftType, WorkDay


class ShiftTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShiftType
        fields = "__all__"
        
class WorkdaySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkDay
        fields = "__all__"


class RosterSerializer(serializers.ModelSerializer):
    work_day = serializers.CharField(source="work_day.day_symbol")
    shift = serializers.CharField(source="shift.name")
    batch = serializers.CharField(source="batch.name")

    class Meta:
        model = MonthlyRoster
        fields = [
            "id",
            "week_start_date",
            "shift_start_date",
            "shift_end_date",
            "work_day",
            "shift",
            "batch",
        ]


class RosterCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = MonthlyRoster
        fields = "__all__"


class RosterUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = MonthlyRoster
        fields = "__all__"


class BatchSerializer(serializers.ModelSerializer):
    rosters = RosterSerializer(many=True, read_only=True)

    class Meta:
        model = Batch
        fields = ["id", "name", "rosters"]


class BatchCreateSerializer(serializers.ModelSerializer):
    rosters = RosterSerializer(many=True, read_only=True)

    class Meta:
        model = Batch
        fields = ["id", "name", "rosters"]
