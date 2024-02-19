import json
import random

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
    random_string = "".join(random.choices("0123456789ABCDEFGHIJKLMNPRSTVWXYZ", k=10))
    return f"DUMMY-{random_string}"

