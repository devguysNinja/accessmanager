from rest_framework.exceptions import NotFound
from django.core.exceptions import BadRequest
from rest_framework import serializers
from .models import Drink, DrinkCategory, Transaction
from users.serializers import UserProfileSerializer
from users.models import UserProfile


class DrinkCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DrinkCategory
        fields = "__all__"
        
class ExcelDrinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drink
        fields = "__all__"

class DrinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drink
        fields = ["drink"]


class DrinkCategoryListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrinkCategory
        fields = [
            "name",
        ]

    def to_representation(self, obj):
        representation = super().to_representation(obj)
        representation["drink_list"] = DrinkSerializer(obj.drink_set, many=True).data
        return representation


class TransactionReportSerializer(serializers.ModelSerializer):
    # employee = serializers.CharField(source="owner.user.username")
    class Meta:
        model = Transaction
        fields = [
           "id",
            "swipe_count",
            "reader_uid",
            "access_point",
            "grant_type",
            "date",
        ]
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['employee'] = instance.owner.user.full_name
        representation['employee_id'] = instance.owner.employee_id
        representation['department'] = instance.owner.department.dept_name
        representation['employee_status'] = instance.owner.employee_status.status
        representation['location'] = instance.owner.location.name
        representation['group'] = instance.owner.batch.name
        representation['category'] = instance.owner.category.cat_name
        return representation

class TransactionSerializer(serializers.ModelSerializer):
    owner = UserProfileSerializer()
    authorizer = UserProfileSerializer()
    owner_id = serializers.UUIDField()
    authorizer_id = serializers.UUIDField()

    class Meta:
        model = Transaction
        fields = [
            "owner",
            "authorizer",
            "swipe_count",
            "reader_uid",
            "access_point",
            "raw_payload",
            "grant_type",
            "owner_id",
            "authorizer_id",
            "date",
        ]

    def create(self, validated_data):
        print("**** 1st Validated_data****:", validated_data)
        owner = validated_data.pop("owner", None)
        authorizer = validated_data.pop("authorizer", None)
        if owner is None or authorizer is None:
            raise NotFound("No owner found!")
        transaction = self.Meta.model(**validated_data)
        transaction.owner = UserProfile.objects.get(id=validated_data["owner_id"])
        transaction.authorizer = UserProfile.objects.get(
            id=validated_data["authorizer_id"]
        )
        transaction.save()
        return transaction
