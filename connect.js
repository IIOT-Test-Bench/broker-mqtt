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


let clientobject = null;
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
  if(client){
    clientobject = client;
    res.send({clientId, status: "connected", msg: "Successfully Connected"})
  }
});

//Close connection
app.post("/disconnect", async (req, res) => {
  const client = clientobject;
  if(client){
    await client.end();
    res.send(`Client ${client.options.clientId} disconnected successfully`);
    clientobject = null;
  }else{
    res.status(404).send("Sorry there was no client connection to be closed")
  }
  
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

// Subscribe
app.post("/subscribe", (req, res) => {
  const { topic } = req.body;
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: 4000,
    username: "emqx",
    password: "public",
    reconnectPeriod: 1000,
  });

  client.on("connect", () => {
    client.subscribe(topic, () => {
      console.log(`Subscribe to topic ${topic}`);
    });
  });

  client.on("message", (topic, message) => {
    message = message.toString();
    console.log(message);
  });
});

app.listen(Port, () => {
  console.log("App Running...");
});
