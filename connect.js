const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const mqtt = require("mqtt");

// middlewares
app.use(express.json());

// Get Request
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Post Request
app.post("/connect", async (req, res) => {
  const { host, port, clientId } = req.body;
  const connectUrl = `mqtt://${host}:${port}`;
  const client = await mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "emqx",
    password: "public",
    reconnectPeriod: 1000,
  });
  // await client.on("connect", () => {
  //   console.log("Connected");
  // });
});

// Publish
app.post("/publish", (req, res) => {
  const { topic, message } = req.body;
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "emqx",
    password: "public",
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    client.publish(topic, message);
    console.log("Message sent!", message);
  });
});

app.listen(Port, () => {
  console.log("App Running...");
});
