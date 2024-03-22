import os
import time
import uuid
import json
from datetime import datetime, date, timedelta
from random import randrange, uniform
from typing import Any
import paho.mqtt.client as mqtt
import django
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import Q
from django.db.models import Sum
from utils.utils import is_card_reader_json, is_json, publish_data, parse_time


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mealmanager.settings.production")
django.setup()

from django.utils import timezone
from django.db import models
from core.models import DrinkCart, Transaction
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

    # region


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
# endregion


def is_valid_shift_time(shift_times, time_now_obj):
    is_within_interval = False
    for start_time, end_time in shift_times:
        # shift_delta = (start_time - time_now_obj) <= 24
        # print("#####....DELTA: ", shift_delta)
        # ... Check if start_time <= given_time <= end_time for intervals not spanning midnight
        if start_time <= time_now_obj <= end_time:
            is_within_interval = True
            break
        # ... Check if given_time is within 24 hrs shift interval spanning midnight
        # elif (start_time > end_time) and shift_delta:
        # 	# if time_now_obj >= start_time or time_now_obj <= end_time:
        # 	is_within_interval = True
        # 	break
        # ... Check if given_time is within the night shift interval spanning midnight
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
        # t_day = timezone.now().strftime("%A")
        t_day = datetime.now().strftime("%A")
        t_date = timezone.now().date().strftime("%Y-%m-%d")
        n_date = (datetime.now().date() + timedelta(days=1)).strftime("%Y-%m-%d")
        p_date = (datetime.now().date() - timedelta(days=1)).strftime("%Y-%m-%d")
        print("DATE: ", t_date)
        employee_profile = UserProfile.objects.get(reader_uid=uid)
        batch = employee_profile.batch
        print("****BATCH: ", batch)
        work_day = WorkDay.objects.filter(day_symbol=t_day.capitalize()).first()
        batch_rosters = MonthlyRoster.objects.filter(
            Q(batch=batch.id) & Q(work_day=work_day.id) & Q(shift_start_date=t_date)
            | (
                Q(batch=batch.id)
                & (Q(shift_start_date=p_date) & Q(shift_end_date=t_date))
            )
        )
        current_time = datetime.now().strftime("%H:%M:%S.%f")
        parsed_current_time = parse_time(current_time)
        print("TIME: ", parsed_current_time)
        # print("TYPE TIME: ", type(parsed_current_time))
        print("DAY NAME: ", t_day)
        employee_shift = [roster.shift.name for roster in batch_rosters]
        print("SHIFTS: ",employee_shift)
        employee_shift_interval = [
            (roster.shift.start_time, roster.shift.end_time) for roster in batch_rosters
        ]
        print("TIMES: ", employee_shift_interval)
        if is_valid_shift_time(employee_shift_interval, parsed_current_time):
            return True
        else:
            return False

    except UserProfile.DoesNotExist:
        return None


def smartcard_handler_for_restaurant(client, message):
    reader_message = message.payload.decode("UTF-8")
    print(f'Recieved message restaurant: {str(message.payload.decode("utf-8"))}')
    print("IS JSON: ", is_json(reader_message))
    if not is_json(reader_message):
        reader_uid = str(reader_message)
        owner_profile = UserProfile.objects.filter(reader_uid=reader_message).first()
        if owner_profile is None:
            meta_data = {"message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **meta_data}
            )
            client.publish(TOPIC, grant_data)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        on_schedule = check_calendar(reader_uid)
        if on_schedule is None:
            meta_data = {"message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **meta_data}
            )
            client.publish(TOPIC, grant_data)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        elif not on_schedule:
            meta_data = {
                "message": "Employee not on schedule!",
                **dict(
                    username=owner_profile.user.username,
                    department=str(owner_profile.department),
                ),
            }
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **meta_data}
            )
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
    reader_message = message.payload.decode("UTF-8")
    print(f'Received message: {str(message.payload.decode("utf-8"))}')
    print("IS JSON: ", is_json(reader_message))
    if not is_json(reader_message):
        reader_uid = str(reader_message)
        owner_profile = UserProfile.objects.filter(reader_uid=reader_message).first()
        if owner_profile is None:
            bar_meta = {"access_point": "BAR", "message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **bar_meta}
            )
            client.publish(TOPIC, grant_data)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        on_schedule = check_calendar(reader_uid)
        if on_schedule is None:
            bar_meta = {"access_point": "BAR", "message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **bar_meta}
            )
            client.publish(TOPIC, grant_data)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        elif not on_schedule:
            bar_meta = {
                "access_point": "BAR",
                "message": "Employee not on schedule!",
                **dict(
                    username=owner_profile.user.username,
                    department=str(owner_profile.department),
                ),
            }
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **bar_meta}
            )
            client.publish(TOPIC, grant_data)
            print("***->RETURNING....  EMPLOYEE NOT ON SCHEDULE!")
            return
        print("***User Profile***: ", owner_profile)
        today = timezone.now().date()
        today_transaction = Transaction.objects.filter(
            reader_uid=reader_uid,
            grant_type=ACCESS_GRANTED,
            access_point="BAR",
            date__date=today,
        )
        print("THIS IS THE TRANSACTION OBJECT:", today_transaction)
        # ...No transactions exist yet today for this user
        if today_transaction.first() is None:
            bar_data = {
                "access_point": "BAR",
                "owner_profile": str(owner_profile.id),
                "message": "Enjoy your drinks!",
            }
            bar_meta = {
                **bar_data,
                **dict(
                    avatar=str(owner_profile.profile_image),
                    username=owner_profile.user.username,
                    department=str(owner_profile.department),
                    drink_category=owner_profile.category.drink_access,
                    used_count=0,
                    swipe_count=0,
                    balance=owner_profile.category.drink_access,
                ),
            }
            grant_data = json.dumps(
                {**publish_data(ACCESS_GRANTED, reader_uid), **bar_meta}
            )
            client.publish(TOPIC, grant_data)
            return

        # ...transactions exists for this user
        # transaction_count = today_transaction.count()
        SWIPE_COUNT = today_transaction.last().swipe_count
        drink_category = owner_profile.category.drink_access
        drink_taken = DrinkCart.objects.filter(
            reader_uid=reader_uid, order_date__date=today
        )
        print("&&&& Drinks Taken: ", drink_taken)
        total_drink_taken = drink_taken.aggregate(total_qty=Sum("qty"))["total_qty"]
        print("&&&& Total Drink Taken: ", total_drink_taken)

        if (SWIPE_COUNT >= drink_category) or (total_drink_taken >= drink_category):
            # SWIPE_COUNT += SWIPE_COUNT
            balance = drink_category - total_drink_taken
            bar_data = {
                "access_point": "BAR",
                "swipe_count": SWIPE_COUNT,
                "owner_profile": str(owner_profile.id),
                "message": "You had enough drinks for today!",
            }
            bar_meta = {
                **bar_data,
                **dict(
                    avatar=str(owner_profile.profile_image),
                    username=owner_profile.user.username,
                    department=str(owner_profile.department),
                    drink_category=owner_profile.category.drink_access,
                    used_count=total_drink_taken,
                    balance=balance,
                ),
            }
            print("&&&& Bar Meta: ", bar_meta)
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **bar_meta}
            )
            client.publish(TOPIC, grant_data)
            return

        if total_drink_taken < drink_category:
            # SWIPE_COUNT += SWIPE_COUNT
            balance = drink_category - total_drink_taken
            bar_data = {
                "access_point": "BAR",
                "swipe_count": SWIPE_COUNT,
                "owner_profile": str(owner_profile.id),
                "message": "Enjoy your drinks!",
            }
            bar_meta = {
                **bar_data,
                **dict(
                    avatar=str(owner_profile.profile_image),
                    username=owner_profile.user.username,
                    department=str(owner_profile.department),
                    drink_category=owner_profile.category.drink_access,
                    used_count=total_drink_taken,
                    balance=balance,
                ),
            }
            print("&&&& Bar Meta: ", bar_meta)
            grant_data = json.dumps(
                {**publish_data(ACCESS_GRANTED, reader_uid), **bar_meta}
            )
            client.publish(TOPIC, grant_data)


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
