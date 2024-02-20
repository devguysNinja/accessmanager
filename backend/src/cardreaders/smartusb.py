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
            # client.loop_start()
            return True
        except Exception as ex:
            print(f"{ex.args}\nWaiting for connection...\n")
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


try:
    if __name__ == "__main__":
        error_report = main()
        if error_report == -1:
            print("calling Main after RuntimeError...")
            main()
except RuntimeError as ex:
    client.loop_stop()
    print("RuntimeError occur: ", ex.args[1])
    main()
    # print("waiting for an events to fire...")
except TimeoutError as ex:
    print("TimeoutError: ", ex.args[1])
    main()
