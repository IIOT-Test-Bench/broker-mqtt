const express = require("express");
const app = express();
const Port = process.env.PORT || 3001;
const mqtt = require("mqtt");
const cors = require('cors');


// middlewares
app.use(express.json());
app.use(cors({origin: true, credentials: true}));

// Get Request
app.get("/", (req, res) => {
  res.send("Hello World");
});


let clientobject = {};
// Post Request
app.post("/connect", async (req, res) => {
  const { host, port, clientId, timeout, username, password } = req.body;
  const connectUrl = `mqtt://${host}:${port}`;
  const client = await mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: timeout,
    username: username,
    password: password,
    reconnectPeriod: 1000,
  });
  client.on("connect", () => {
    res.send({clientId, status: "connected", msg: "Successfully Connected"})
    clientobject[clientId] = client;
  });
});

//Close connection
app.post("/disconnect", async (req, res) => {
  console.log(Object.keys(clientobject));
  const { clientId } = req.body;
  const client = clientobject[clientId];
  if(client){
    await client.end();
    res.send(`Client ${client.options.clientId} disconnected successfully`);
    delete clientobject[clientId];
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
