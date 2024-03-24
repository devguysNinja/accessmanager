from rest_framework import serializers
from .models import Batch, Department, EmployeeCategory, EmployeeStatus, Location


class LocationField(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ["id","name"]


class DepartmentField(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "dept_name"]

class EmployeeStatusField(serializers.ModelSerializer):
    class Meta:
        model = EmployeeStatus
        fields = ["id","status" ]


class EmployeeCategoryField(serializers.ModelSerializer):
    class Meta:
        model = EmployeeCategory
        fields = ["id", "cat_name"]

class BatchField(serializers.ModelSerializer):
    class Meta:
        model = Batch
        fields = ["id", "name"]



