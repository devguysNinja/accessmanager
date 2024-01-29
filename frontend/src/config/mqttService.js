import { Client } from "paho-mqtt";

// const mqttBroker = "ws://broker.hivemq.com/";
const mqttBroker = "broker.hivemq.com";
const clientId = `react-client-${Math.random().toString(36).substring(7)}`;
const client = new Client(mqttBroker, 8000, clientId);
const TOPIC = "orinlakantobad";

const connect = () => {
  client.connect({
    onSuccess: onConnect,
    onFailure: onFailure,
    useSSL: false,
  });
  return client;
};

const onConnect = () => {
  console.log("Connected to MQTT broker");
  client.subscribe(TOPIC);
  console.log(`Subcribed to Topic: ${TOPIC}`);
};

const onFailure = (responseObject) => {
  console.log(
    "Failed to connect to MQTT broker. Error:",
    responseObject.errorMessage
  );
};

export { connect };
