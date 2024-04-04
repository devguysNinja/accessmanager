import json
from django.utils import timezone
from django.db import models
from django.conf import settings
from django.dispatch import receiver
from django.db.models.signals import post_save
import paho.mqtt.publish as mqtt_publish
from users.models import UserProfile
from utils.utils import publish_data, is_card_reader_json


# Create your models here.
class Transaction(models.Model):
    swipe_count = models.IntegerField(default=0)
    reader_uid = models.CharField(max_length=128)
    date = models.DateTimeField(default=timezone.now)
    owner = models.ForeignKey(
        UserProfile, related_name="user_transactions", on_delete=models.CASCADE
    )
    authorizer = models.ForeignKey(
        UserProfile, related_name="opener", on_delete=models.CASCADE
    )
    access_point = models.CharField(max_length=125)
    raw_payload = models.JSONField()
    door = models.CharField(max_length=128, blank=True, null=True)
    grant_type = models.CharField(max_length=25)
    reason = models.CharField(max_length=155, blank=True, null=True)

    def __str__(self):
        return f"Transaction-{self.owner.user.username}"


class DrinkCategory(models.Model):
    name = models.CharField(max_length=155, unique=True)

    class Meta:
        verbose_name_plural = "Drink Categories"

    def __str__(self) -> str:
        return self.name


class Drink(models.Model):
    drink = models.CharField(max_length=155, unique=True)
    type = models.ForeignKey(DrinkCategory, on_delete=models.CASCADE)

    class Meta:
        verbose_name_plural = "Drinks"

    def __str__(self) -> str:
        return self.drink


class DrinkCart(models.Model):
    drink = models.ForeignKey(Drink, null=True, on_delete=models.SET_NULL)
    qty = models.PositiveSmallIntegerField()
    transaction = models.ForeignKey(Transaction, null=True, on_delete=models.SET_NULL)
    reader_uid = models.CharField(max_length=25)
    order_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Drinks Carts"

    def __str__(self):
        return f"Cart-{self.pk}" - f"{self.drink}"


class ReportType(models.Model):
    report_type = models.CharField(max_length=25)
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.report_type}"


@receiver(post_save, sender=Transaction)
def on_save_signal_event(*args, **kwargs):
    TOPIC = settings.TOPIC
    ACCESS_GRANTED = "ACCESS GRANTED"
    ACCESS_DENIED = "ACCESS DENIED"
    mqtt_broker = settings.MQTT_BROKER
    print(
        "transaction.model.py#$#$#$#$#$#$#$# Transaction signal: Kwargs",
        kwargs["instance"].grant_type,
    )
    grant_type = kwargs["instance"].grant_type
    reader_uid = kwargs["instance"].reader_uid
    try:
        if grant_type == ACCESS_GRANTED:
            meta_data = {"message": "Enjoy your meal!"}
            data = json.dumps(
                {**publish_data(ACCESS_GRANTED, uid=reader_uid), **meta_data}
            )
            mqtt_publish.single(
                TOPIC,
                payload=data,
                hostname=mqtt_broker,
            )
        if grant_type == ACCESS_DENIED:
            meta_data = {"message": "You had enough meal today!"}
            data = json.dumps(
                {**publish_data(ACCESS_GRANTED, uid=reader_uid), **meta_data}
            )
            mqtt_publish.single(
                TOPIC,
                payload=data,
                hostname=mqtt_broker,
            )
    except Exception as e:
        print("Mqtt Publish Error:", e.args[0])
