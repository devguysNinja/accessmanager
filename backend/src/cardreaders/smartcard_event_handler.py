import os
import time
from datetime import datetime, date
from random import randrange, uniform
from typing import Any
import django
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
import paho.mqtt.client as mqtt
import uuid
import json
from utils.utils import is_card_reader_json, is_json, publish_data, parse_time


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mealmanager.settings.production")
django.setup()

from django.utils import timezone
from django.db import models
from core.models import Transaction
from users.models import User, UserProfile
from staffcalendar.models import ShiftType, MonthlyRoster, WorkDay


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


# def check_calendar_old(uid):
#     try:
#         employee_profile = UserProfile.objects.get(reader_uid=uid)
#         current_date = timezone.now().date()
#         current_time = timezone.now().time()
#         monthly_roster_exists = MonthlyRoster.objects.filter(
#             Q(employees=employee_profile)
#             & Q(start_date__lte=current_date)
#             & Q(end_date__gte=current_date)
#         ).exists()
#         if monthly_roster_exists:
#             return ShiftType.objects.filter(
#                 Q(monthlyroster__employees=employee_profile)
#                 & Q(start_time__lte=current_time)
#                 & Q(end_time__gte=current_time)
#                 & Q(monthlyroster__start_date__lte=current_date)
#                 & Q(monthlyroster__end_date__gte=current_date)
#             ).exists()
#         else:
#             return False
#     except UserProfile.DoesNotExist:
#         return None


def is_valid_shift_time(shift_times, time_now_obj):
    is_within_interval = False
    for start_time, end_time in shift_times:
        # Check if start_time <= given_time <= end_time for intervals not spanning midnight
        if start_time <= time_now_obj <= end_time:
            is_within_interval = True
            break
        # Check if given_time is within the night shift interval spanning midnight
        elif start_time > end_time:
            if time_now_obj >= start_time or time_now_obj <= end_time:
                is_within_interval = True
                break
    if is_within_interval:
        return is_within_interval
    else:
        return False


def check_calendar(uid):
    try:
        t_day = timezone.now().strftime("%A")
        t_date = timezone.now().date().strftime("%Y-%m-%d")
        employee_profile = UserProfile.objects.get(reader_uid=uid)
        meal_access = employee_profile.category.meal_access
        batch = employee_profile.batch
        work_day = WorkDay.objects.filter(day_symbol=t_day.capitalize()).first()
        batch_rosters = MonthlyRoster.objects.filter(
            batch=batch.id, work_day=work_day.id, shift_date=t_date
        )
        # assigned_work_days = [roster.work_day.all() for roster in rosters_for_employee]
        # if len(assigned_work_days) == 0:
        # 	return False
        # current_date = timezone.now().date()
        current_time = timezone.now().time()
        print("TIME: ", current_time)
        print("TYPE TIME: ", type(current_time))
        # today = timezone.now().strftime("%A")
        print("DAY NAME: ", t_day)
        employee_shift = [roster.shift.name for roster in batch_rosters]
        print("SHIFTS: ", employee_shift)
        employee_shit_interval = [
            (roster.shift.start_time, roster.shift.end_time) for roster in batch_rosters
        ]
        print("TIMES: ", employee_shit_interval)
        # work_days_objs = [work_days[::1] for work_days in assigned_work_days]
        # day_list = [day.day_symbol for days in work_days_objs for day in days]
        # print("DAYS: ", day_list)
        if is_valid_shift_time(employee_shit_interval, current_time):
            return True
        else:
            return False

    except UserProfile.DoesNotExist:
        return None


def smartcard_handler_for_restaurant(client, message):
    reader_message = message.payload.decode("UTF-8")
    print(f'Recieved message: {str(message.payload.decode("utf-8"))}')
    print("IS JSON: ", is_json(reader_message))
    if not is_json(reader_message):
        reader_uid = str(reader_message)
        owner_profile = UserProfile.objects.filter(reader_uid=reader_message).first()
        if owner_profile is None:
            grant_data = json.dumps(publish_data(ACCESS_DENIED))
            client.publish(TOPIC, grant_data)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        on_schedule = check_calendar(reader_uid)
        if on_schedule is None:
            grant_data = json.dumps(publish_data(ACCESS_DENIED))
            client.publish(TOPIC, grant_data)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        elif not on_schedule:
            grant_data = json.dumps(publish_data(ACCESS_DENIED))
            client.publish(TOPIC, grant_data)
            print("***->RETURNING....  EMPLOYEE NOT ON SCHEDULE!")
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
                raise Transaction.DoesNotExist(
                    "No transaction exists yet for this owner"
                )

            # ...transactions exists for this user
            transaction_count = today_transaction.count()
            # meal_category = today_transaction.first().owner.meal_category
            meal_category = owner_profile.category.meal_access
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
        except Transaction.DoesNotExist as e:
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
            print("User Profile not found!")


def smartcard_handler_for_bar(client, message):
    return

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
            is_onschedule = check_calendar(reader_uid)
            if is_onschedule is None:
                grant_data = json.dumps(publish_data(ACCESS_DENIED))
                client.publish(TOPIC, grant_data)
                print("***->RETURNING.... NO USER PROFILE!")
                return
            elif not is_onschedule:
                grant_data = json.dumps(publish_data(ACCESS_DENIED))
                client.publish(TOPIC, grant_data)
                print("***->RETURNING....  EMPLOYEE NOT ON SCHEDULE!")
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
                # meal_category = today_transaction.first().owner.meal_category
                meal_category = owner_profile.category.meal_access
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
