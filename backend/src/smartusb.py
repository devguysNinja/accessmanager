import time
import paho.mqtt.client as mqtt
from random import randrange, uniform

DELAY = 1.2
TIMEOUT = 1.2
TOPIC = "orinlakantobad"
MQTT_BROKER = "broker.hivemq.com"
client = mqtt.Client("Cafeteria")


def connect_to_broker():
    NOT_CONNECTED = True
    while NOT_CONNECTED:
        try:
            client.connect(MQTT_BROKER)
            NOT_CONNECTED = False
            print("Connected!")
            return True
        except Exception as ex:
            print(f"{ex.args[1]}\nWaiting for connection...\n")
            NOT_CONNECTED = True
            time.sleep(DELAY)


try:
    is_connected = connect_to_broker()
    client.loop_start()
    while True:
        payload = input("Flash your card :")
        if payload != "" and is_connected:
            response = client.publish(TOPIC, payload, qos=1)
            response.wait_for_publish(timeout=TIMEOUT)
            # print("RESPONSE after waiting: ", response.is_published())
            if response.is_published():
                print(f"Just published {payload} to topic {TOPIC}")
            else:
                is_connected = False
        if not is_connected:
            print("Connection lost\nTrying to reconnect...")
            is_connected =  connect_to_broker()
        payload = ""
except KeyboardInterrupt:
    print("\n Ctrl+C pressed!")
