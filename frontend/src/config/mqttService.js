import { Client } from "paho-mqtt";

const mqttBroker = process.env.REACT_APP_MQTT_BROKER; 
const broker_port = parseInt(process.env.REACT_APP_MQTT_BROKER_WS_PORT)
const clientId = `react-client-${Math.random().toString(36).substring(7)}`;
const client = new Client(mqttBroker, broker_port, clientId);
const TOPIC =  process.env.REACT_APP_TOPIC || "waiter";

console.log("&&&& mqttBroker", mqttBroker) 

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
  console.log(`Subscribed to Topic: ${TOPIC}`);
};

const onFailure = (responseObject) => {
  console.log(
    "Failed to connect to MQTT broker. Error:",
    responseObject.errorMessage
  );
};

export { connect, TOPIC };
