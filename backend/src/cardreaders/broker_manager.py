import json
import os
import datetime
import time
from typing import Any
import paho.mqtt.client as mqtt
# from utils.utils import publish_data, is_card_reader_json
from smartcard_event_handler import (
	jsondata_smartcard_handler,
	smartcard_handler_for_restaurant,
	smartcard_handler_for_bar
)


def get_secret(setting):
	"""Get the secret variable or return explicit exception."""
	try:
		return os.environ[setting]
	except KeyError:
		error_msg = f"Set the {setting} environment variable"
		raise ValueError(error_msg)

DEPLOYMENT_LOCATION = get_secret('DEPLOYMENT_LOCATION')
ACCESS_POINTS = {"restaurant": "RESTAURANT", "bar": "BAR"}

class BrokerEventManager:
	def __init__(self, client) -> None:
		self.client = client

	def __call__(self, client, userdata, message, *args: Any, **kwds: Any) -> Any:
		event_message = message.payload.decode("UTF-8")
		# print("MESSAGE: ", event_message)
		if isinstance(event_message, str):
			# print("$$$$$...Calling usb_smartcard_handler")

			# check if DEPLOYMENT_LOCATION=Restaurant
			if DEPLOYMENT_LOCATION==ACCESS_POINTS['restaurant']:
				smartcard_handler_for_restaurant(client, message)
			elif DEPLOYMENT_LOCATION==ACCESS_POINTS['bar']:
				smartcard_handler_for_bar(client, message)


		# if is_card_reader_json(event_message):
		# print("$$$$$...Calling jsondata_smartcard_handler")
		# jsondata_smartcard_handler(client, message)


DELAY = 1.2
TIMEOUT = 1.2
MQTT_BROKER = "broker.hivemq.com"
client = mqtt.Client("apiMonitor")
# client.connect(MQTT_BROKER)
TOPIC = "orinlakantobad"


def connect_to_broker():
	NOT_CONNECTED = True
	while NOT_CONNECTED:
		try:
			client.connect(MQTT_BROKER, keepalive=25)
			NOT_CONNECTED = False
			print("Connected!\nWaiting for incoming events...")
			return True
		except Exception as ex:
			print(f"{ex.args[1]}\nWaiting for connection...\n")
			NOT_CONNECTED = True
			time.sleep(DELAY)


def main():
	try:
		is_connected = connect_to_broker()
		if is_connected:
			on_message = BrokerEventManager(client)
			client.on_message = on_message
			client.subscribe(TOPIC)
			client.loop_forever()
	except TimeoutError:
		print("TimeoutError in Main()")
		client.loop_stop()
		return -1
	except KeyboardInterrupt:
		print(" \n Ctrl + C pressed!")


def on_disconnect(client, userdata, rc):
	if rc != 0:
		raise TimeoutError()


NOT_RUNNING = True
client.on_disconnect = on_disconnect
while NOT_RUNNING:
	try:
		if __name__ == "__main__":
			print("RUNNING...")
			error_report = main()
			NOT_RUNNING = False
			if error_report == -1:
				print("calling Main after TimeoutError...")
				NOT_RUNNING = True
	except RuntimeError as ex:
		NOT_RUNNING = True
		client.loop_stop()
		print("RuntimeError occur: ", ex.args)
	except TimeoutError as ex:
		NOT_RUNNING = True
		client.loop_stop()
		print("TimeoutError occur: ", ex.args)
	except OSError as ex:
		NOT_RUNNING = True
		print("OSError occur: ", ex.args)
