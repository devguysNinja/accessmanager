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
            client.connect(MQTT_BROKER,keepalive=25)
            NOT_CONNECTED = False
            print("Connected!")
            # client.loop_start()
            return True
        except Exception as ex:
            print(f"{ex.args[1]}\nWaiting for connection...\n")
            NOT_CONNECTED = True
            time.sleep(DELAY)


def main():
    try:
        is_connected = connect_to_broker()
        client.loop_start()
        while True:
            payload = input("Flash your card :")
            if payload != "" and is_connected:
                response = client.publish(
                    TOPIC,
                    str(payload),
                )
                response.wait_for_publish(timeout=TIMEOUT)
                # print("RESPONSE after waiting: ", response.is_published())
                # if response.is_published():
                    # print(f"Just published {payload} to topic {TOPIC}")
                # else: print("NOT_CONNECTED")
            elif payload == "" and is_connected:
                continue
            if not is_connected:
                client.loop_stop()
                print("Connection lost\nTrying to reconnect...")
                # is_connected = connect_to_broker()
            payload = ""
    except RuntimeError:
        print("RuntimeError in Main()")
        client.loop_stop()
        return -1
    except TimeoutError:
        print("TimeoutError in Main()")
        client.loop_stop()
        return -1
    except KeyboardInterrupt:
        print("\n Ctrl+C pressed!")

NOT_RUNNING = True
while NOT_RUNNING:
    try:
        if __name__ == "__main__":
            print("RUNNING...")
            error_report = main()
            NOT_RUNNING = False
            if error_report == -1:
                print("calling Main after RuntimeError...")
                NOT_RUNNING = True
                # main()
    except RuntimeError as ex:
        NOT_RUNNING = True
        client.loop_stop()
        print("RuntimeError occur: ", ex.args[1])
        # main()
    except TimeoutError as ex:
        NOT_RUNNING = True
        print("TimeoutError occur: ", ex.args[1])
        # main()

