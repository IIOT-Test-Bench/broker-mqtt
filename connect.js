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

// Disconnect
app.get("/disconnect", (req, res) => {
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "emqx",
    password: "public",
    reconnectPeriod: 1000,
  });

  client.end(() => {
    console.log(`Broker Disconnected`);
  });
  res.send("Broker Disconnected");
});

// published
app.get("/publish", (req, res) => {
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "emqx",
    password: "public",
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    setInterval(function () {
      let arr = Array(5000000).fill("some string");
      for (let key in arr) {
        if (key > 0) {
          client.publish(`${key}`);
        }
      }
    }, 3000);
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Published Memory Usage ${Math.round(used * 100) / 100} MB`);
  });
  res.send("Topic Published");
});

// subscribe
app.get("/subscribe", (req, res) => {
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "emqx",
    password: "public",
    reconnectPeriod: 1000,
  });
  client.on("connect", function () {
    let arr = Array(800).fill("some string");
    for (let key in arr) {
      if (key > 0) {
        client.subscribe(`${key}`);
      }
    }
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    console.log(`Subscribe Memory Used ${Math.round(used * 100) / 100} MB`);
  });
  res.send("Subscribed to Topic");
});

app.listen(Port, () => {
  console.log("App Running...");
});
