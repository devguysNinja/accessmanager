import json
from typing import Any
import paho.mqtt.client as mqtt
from utils.utils import publish_data, is_card_reader_json
from smartcard_event_handler import jsondata_smartcard_handler, usb_smartcard_handler


class BrokerEventManager:
    def __init__(self, client) -> None:
        self.client = client

    def __call__(self, client, userdata,  message, *args: Any, **kwds: Any) -> Any:
        event_message = message.payload.decode("UTF-8")
        print("MESSAGE: ", event_message)
        if isinstance(event_message, str):
            print("$$$$$...Calling usb_smartcard_handler")
            usb_smartcard_handler(client, message)
            return

        # if is_card_reader_json(event_message):
            # print("$$$$$...Calling jsondata_smartcard_handler")
            # jsondata_smartcard_handler(client, message)


def main():
    MQTT_BROKER = "broker.hivemq.com"
    client = mqtt.Client("apiMonitor")
    client.connect(MQTT_BROKER)
    TOPIC = "orinlakantobad"

    try:
        on_message = BrokerEventManager(client)
        client.on_message = on_message
        client.subscribe(TOPIC)
        client.loop_forever()
    except KeyboardInterrupt:
        print(" \n Ctrl + C pressed!")


if __name__ == "__main__":
    print("waiting for an events to fire...")
    main()
