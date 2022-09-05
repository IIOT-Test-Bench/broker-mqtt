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
app.get("/disconnect", async (req, res) => {
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
      let arr = Array(50).fill("some string");
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
