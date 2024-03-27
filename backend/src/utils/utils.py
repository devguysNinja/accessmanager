from datetime import datetime, timedelta
import json
import random


# Function to convert formatted time string to datetime object
def parse_time(time_str):
    return datetime.strptime(time_str, "%H:%M:%S.%f").time()


# Function to convert time object to formatted string
def format_time(time_obj):
    return time_obj.strftime("%H:%M:%S.%f")


def publish_data(grant: str, uid: str = ""):
    grant_data = {
        "grant_type": grant,
        "uid": uid,
    }
    return grant_data


def is_json(data):
    try:
        jlo = json.loads(data)
        return isinstance(jlo, dict)
    except ValueError:
        return False


def is_card_reader_json(data):
    if not is_json(data):
        return False
    try:
        data_keys = [key for key in json.loads(data).keys()]
        if len(data_keys) > 2 and "grant_type" not in data_keys:
            return True
        else:
            return False
    except ValueError:
        return False


def generate_unique_str():
    random_string = "".join(random.choices("0123456789ABCDEFGHIJKLMNPRSTVWXYZ", k=10))
    return random_string


def dummy_unique_str():
    random_dummy = f"DUMMY-{generate_unique_str()}"
    return random_dummy

def dummy_email():
    dummy_mail = f"{dummy_unique_str()}@mealmanager.com"
    return dummy_mail


def get_shift_date(work_day_param: str, shift_params, start_date_param):
    # Convert start_date to a datetime object
    roster_start_date_obj = datetime.strptime(start_date_param, "%Y-%m-%dT%H:%M:%S.%fZ")

    if work_day_param.lower() == "sunday":
        delta = 0
    elif work_day_param.lower() == "monday":
        delta = 1
    elif work_day_param.lower() == "tuesday":
        delta = 2
    elif work_day_param.lower() == "wednesday":
        delta = 3
    elif work_day_param.lower() == "thursday":
        delta = 4
    elif work_day_param.lower() == "friday":
        delta = 5
    elif work_day_param.lower() == "saturday":
        delta = 6

    # Add delta days to start_date
    shift_start_date_obj = roster_start_date_obj + timedelta(days=delta)
    shift_end_date_obj = shift_start_date_obj
    if shift_params.start_time > shift_params.end_time:
        shift_end_date_obj = shift_start_date_obj + timedelta(days=1)

    # Extract only the date part from shift_datetime
    week_start_date = roster_start_date_obj.strftime("%Y-%m-%d")
    shift_start_date = shift_start_date_obj.strftime("%Y-%m-%d")
    shift_end_date = shift_end_date_obj.strftime("%Y-%m-%d")
    return shift_start_date, shift_end_date, week_start_date
