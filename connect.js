const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const mqtt = require("mqtt");
const host = "broker.emqx.io";
const port = "1883";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `mqtt://${host}:${port}`;

// middlewares
app.use(express.json());

// Get Request
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Post Request
// Connection
app.get("/connect", (req, res) => {
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "emqx",
    password: "public",
    reconnectPeriod: 1000,
  });
  client.on("connect", () => {
    console.log(`Connected`);
  });
  res.send("Broker Connected!");
});

app.listen(Port, () => {
  console.log("App Running...");
});
