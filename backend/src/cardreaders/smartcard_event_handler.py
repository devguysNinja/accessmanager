import os
import time
from datetime import datetime, date
from random import randrange, uniform
from typing import Any
import django
from django.core.exceptions import ObjectDoesNotExist
import paho.mqtt.client as mqtt
import uuid
import json
from utils.utils import is_card_reader_json, is_json, publish_data


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mealmanager.settings.production")
django.setup()

from django.utils import timezone
from django.db import models
from core.models import Transaction
from users.models import User, UserProfile


TOPIC = "orinlakantobad"
ACCESS_GRANTED = "ACCESS GRANTED"
ACCESS_DENIED = "ACCESS DENIED"
ACCESS_POINT = "LOCAL"

def create_transaction(
    owner: Any,
    count: int,
    uid: str,
    point: str,
    raw: str,
    grant: str,
):
    transaction = Transaction(
        owner=owner,
        authorizer=owner,
        swipe_count=count,
        reader_uid=uid,
        access_point=point,
        raw_payload=raw,
        grant_type=grant,
    )
    return transaction


def usb_smartcard_handler(client, message):
    reader_message = message.payload.decode("UTF-8")
    print(f'Recieved message: {str(message.payload.decode("utf-8"))}')
    print("IS JSON: ", is_json(reader_message))
    if  not is_json(reader_message):
        reader_uid = str(reader_message)
        owner_profile = UserProfile.objects.filter(reader_uid=reader_message).first()
        if owner_profile is None:
            grant_data = json.dumps(publish_data(ACCESS_DENIED))
            client.publish(TOPIC, grant_data)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        print("***User Profile***: ", owner_profile)
        try:
            today = timezone.now().date()
            today_transaction = Transaction.objects.filter(
                    reader_uid=reader_uid, grant_type=ACCESS_GRANTED, date__date=today
                )
            print("THIS IS THE TRANSACTION OBJECT:", today_transaction)
            # ...No transactions exist yet today for this user
            if today_transaction.first() is None:
                raise ObjectDoesNotExist("No transaction exists yet for this owner")
            
            # ...transactions exists for this user
            transaction_count = today_transaction.count()
            meal_category = today_transaction.first().owner.meal_category
            SWIPE_COUNT = transaction_count
            if SWIPE_COUNT < meal_category:
                SWIPE_COUNT += 1
                create_transaction(
                        owner_profile,
                        SWIPE_COUNT,
                        reader_uid,
                        ACCESS_POINT,
                        reader_message,
                        ACCESS_GRANTED,
                    ).save()
                print("***->RETURNING.... ENJOY YOUR MEAL!")
                return
            if SWIPE_COUNT >= meal_category:
                today_transaction = Transaction.objects.filter(
                        reader_uid=reader_uid, date__date=today
                    )
                transaction_count = today_transaction.count()
                NEW_SWIPE_COUNT = transaction_count + 1
                create_transaction(
                        owner_profile,
                        NEW_SWIPE_COUNT,
                        reader_uid,
                        ACCESS_POINT,
                        reader_message,
                        ACCESS_DENIED,
                    ).save()
                print("***->RETURNING....YOU HAD ENOUGH MEAL TODAY!")
                return
        except ObjectDoesNotExist as e:
            print("ObjectDoesNotExist: ", e)
            if owner_profile:
                SWIPE_COUNT = 1
                create_transaction(
                        owner_profile,
                        SWIPE_COUNT,
                        reader_uid,
                        ACCESS_POINT,
                        reader_message,
                        ACCESS_GRANTED,
                    ).save()
                print("***->RETURNING.... TRANSACTION Created ENJOY YOUR MEAL!")
                return
        else:
            grant_data = json.dumps(publish_data(ACCESS_DENIED))
            client.publish(TOPIC, grant_data)
            print("User profile not found!")



def jsondata_smartcard_handler(client, message):
    reader_message = message.payload.decode("UTF-8")
    print(f'Recieved message: {str(message.payload.decode("utf-8"))}')
    if not reader_message.startswith("ACCESS") and is_card_reader_json(reader_message):
        parsed_message = json.loads(reader_message)
        reader_uid = parsed_message["uid"]
        reader_username = parsed_message["username"]
        owner = User.objects.filter(username=reader_username).first()
        owner_profile = None
        if owner:
            owner_profile = UserProfile.objects.filter(user=owner.pk).first()
            # ...No profile...Profile must be created before access can be granted
            if owner_profile is None:
                grant_data = json.dumps(publish_data(ACCESS_DENIED))
                client.publish(TOPIC, grant_data)
                print("***->RETURNING.... NO USER PROFILE!")
                return
            print("***User Profile***: ", owner_profile)
            try:
                today = timezone.now().date()
                today_transaction = Transaction.objects.filter(
                    reader_uid=reader_uid, grant_type=ACCESS_GRANTED, date__date=today
                )
                print("THIS IS THE TRANSACTION OBJECT:", today_transaction)

                # ...No transactions exist yet today for this user
                if today_transaction.first() is None:
                    raise ObjectDoesNotExist("No transaction exists yet for this owner")

                # ...transactions exists for this user
                transaction_count = today_transaction.count()
                meal_category = today_transaction.first().owner.meal_category
                SWIPE_COUNT = transaction_count
                if SWIPE_COUNT < meal_category:
                    SWIPE_COUNT += 1
                    create_transaction(
                        owner_profile,
                        SWIPE_COUNT,
                        reader_uid,
                        ACCESS_POINT,
                        reader_message,
                        ACCESS_GRANTED,
                    ).save()
                    print("***->RETURNING.... ENJOY YOUR MEAL!")
                    return
                if SWIPE_COUNT >= meal_category:
                    today_transaction = Transaction.objects.filter(
                        reader_uid=reader_uid, date__date=today
                    )
                    transaction_count = today_transaction.count()
                    NEW_SWIPE_COUNT = transaction_count + 1
                    create_transaction(
                        owner_profile,
                        NEW_SWIPE_COUNT,
                        reader_uid,
                        ACCESS_POINT,
                        reader_message,
                        ACCESS_DENIED,
                    ).save()
                    print("***->RETURNING....YOU HAD ENOUGH MEAL TODAY!")
                    return
            except ObjectDoesNotExist as e:
                print("ObjectDoesNotExist: ", e)
                if owner_profile:
                    SWIPE_COUNT = 1
                    create_transaction(
                        owner_profile,
                        SWIPE_COUNT,
                        reader_uid,
                        ACCESS_POINT,
                        reader_message,
                        ACCESS_GRANTED,
                    ).save()
                    print("***->RETURNING.... TRANSACTION Created ENJOY YOUR MEAL!")
                    return
        else:
            grant_data = json.dumps(publish_data(ACCESS_DENIED))
            client.publish(TOPIC, grant_data)
            print("User not found!")

   
