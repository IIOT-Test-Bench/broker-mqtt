const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const mqtt = require("mqtt");
const Client = require("./Classes/Client");

const cors = require("cors");

// middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Get Request
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Post Request
// Connection to the broker
app.post("/connect", async (req, res) => {
  const { host, port, clientId, timeout, username, password } = req.body;
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: timeout,
    username: username,
    password: password,
    reconnectPeriod: 1000,
  });
  client.on("connect", () => {
    Client.addClient(clientId, client);
    console.log(Client.totalClientsNumber());
    res.send({ clientId, status: "connected", msg: "Successfully Connected" });
    // console.log(clientobject);
  });
});

// Disconnect
app.post("/disconnect", async (req, res) => {
  const { clientId } = req.body;
  if (client) {
    try {
      await client.end();
      Client.deleteClient(clientId);
      res.send(`Client ${client.options.clientId} disconnected successfully`);
    } catch (e) {
      res.send(e);
    }
  } else {
    res.status(404).send("Sorry there was no client connection to be closed");
  }
});

// published
app.post("/publish", async (req, res) => {
  const { clientId, topic, message } = req.body;
  const client = Client.getClient(clientId);
  client.publish(topic, message, { qos: 0, retain: false }, (error) => {
    if (error) {
      res.send(error);
    } else {
      Client.addPublishedTopic({ clientId: topic });
      console.log("Another", Client.allPublishedTopics());
      res.send(`${topic} published`);
    }
  });
});

// subscribe
app.post("/subscribe", (req, res) => {
  const { clientId, topic } = req.body;
  let pubobj = { clientId: topic };
  const client = Client.getClient(clientId);
});

app.listen(Port, () => {
  console.log("App Running...");
});
