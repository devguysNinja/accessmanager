import os
import json
from datetime import datetime, timedelta
from typing import Any

# import paho.mqtt.client as mqtt
import paho.mqtt.publish as mqtt_publish
from django.db.models import Q
from django.db.models import Sum
from django.conf import settings
from utils.utils import is_card_reader_json, is_json, publish_data, parse_time
from django.utils import timezone

from core.models import DrinkCart, Transaction
from users.models import User, UserProfile
from staffcalendar.models import ShiftType, MonthlyRoster, WorkDay


MQTT_BROKER = settings.MQTT_BROKER
TOPIC = settings.TOPIC
ACCESS_GRANTED = "ACCESS GRANTED"
ACCESS_DENIED = "ACCESS DENIED"
ACCESS_POINT = "LOCAL"
MEAL_DENIAL_REASON = "YOU HAD ENOUGH MEAL TODAY!"
DRINK_DENIAL_REASON = "You had enough drinks for today!"


def create_transaction(
    owner: Any, count: int, uid: str, point: str, raw: str, grant: str, reason: str
):
    transaction = Transaction(
        owner=owner,
        authorizer=owner,
        swipe_count=count,
        reader_uid=uid,
        access_point=point,
        raw_payload=raw,
        grant_type=grant,
        reason=reason,
    )
    return transaction


def is_valid_shift_time(shift_times, time_now_obj):
    is_within_interval = False
    for start_time, end_time in shift_times:
        # ... Check if start_time <= given_time <= end_time for intervals not spanning midnight
        if start_time <= time_now_obj <= end_time:
            is_within_interval = True
            break
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
        print("SHIFTS: ", employee_shift)
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


def smartcard_handler_for_restaurant(usb_data):
    # reader_message = message.payload.decode("UTF-8")
    # print(f'Recieved message restaurant: {str(message.payload.decode("utf-8"))}')
    print("IS JSON: ", is_json(usb_data))
    if not is_json(usb_data):
        reader_uid = str(usb_data)
        owner_profile = UserProfile.objects.filter(reader_uid=usb_data).first()
        if owner_profile is None:
            meta_data = {"message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **meta_data}
            )
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        on_schedule = check_calendar(reader_uid)
        if on_schedule is None:
            meta_data = {"message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **meta_data}
            )
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
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
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
            print("***->RETURNING....  EMPLOYEE NOT ON SCHEDULE!")
            return
        print("***User Profile***: ", owner_profile)
        try:
            today = timezone.now().date()
            today_transaction = Transaction.objects.filter(
                reader_uid=reader_uid, grant_type=ACCESS_GRANTED, date__date=today
            )
            # ...No transactions exist yet today for this user
            if today_transaction.first() is None:
                raise Transaction.DoesNotExist(
                    "No transaction exists yet for this Employee"
                )

            # ...transactions exists for this user
            transaction_count = today_transaction.count()
            meal_category = owner_profile.category.meal_access
            SWIPE_COUNT = transaction_count
            if SWIPE_COUNT < meal_category:
                SWIPE_COUNT += 1
                create_transaction(
                    owner_profile,
                    SWIPE_COUNT,
                    reader_uid,
                    ACCESS_POINT,
                    usb_data,
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
                    usb_data,
                    ACCESS_DENIED,
                    MEAL_DENIAL_REASON,
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
                    usb_data,
                    ACCESS_GRANTED,
                ).save()
                print("***->RETURNING.... TRANSACTION Created ENJOY YOUR MEAL!")
                return
        else:
            grant_data = json.dumps(publish_data(ACCESS_DENIED))
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
            print("User Profile not found!")


def smartcard_handler_for_bar(usb_data):
    # reader_message = message.payload.decode("UTF-8")
    # print(f'Received message: {str(message.payload.decode("utf-8"))}')
    print("IS JSON: ", is_json(usb_data))
    if not is_json(usb_data):
        reader_uid = str(usb_data)
        owner_profile = UserProfile.objects.filter(reader_uid=usb_data).first()
        if owner_profile is None:
            bar_meta = {"access_point": "BAR", "message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **bar_meta}
            )
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
            print("***->RETURNING.... NO USER PROFILE!")
            return
        on_schedule = check_calendar(reader_uid)
        if on_schedule is None:
            bar_meta = {"access_point": "BAR", "message": "Invalid Card Detected!"}
            grant_data = json.dumps(
                {**publish_data(ACCESS_DENIED, reader_uid), **bar_meta}
            )
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
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
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
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
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
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
                "message": DRINK_DENIAL_REASON.upper(),
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
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
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
            mqtt_publish.single(TOPIC, payload=grant_data, hostname=MQTT_BROKER)
