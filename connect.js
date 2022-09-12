const express = require("express");
const app = express();
const Port = process.env.PORT || 3001;
const mqtt = require("mqtt");
const Client = require("./Classes/Client");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const WebSocket = require("ws");
const server = require('http').createServer();
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

const cors = require("cors");


// middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));



app.get("/", (req, res) => {
  const indexhtml = `
            <div style="margin-top: 10em;display: flex;align-items: center;justify-content: space-evenly;">
                <h1 style="font-size: 4em;">IIOT <span style="color:#4e73df;">Test Bench</span></h1>
            </div>
    `;
  res.send(indexhtml);
});

app.post("/connect", async (req, res) => {
  const { host, port, clientId, timeout, username, password } = req.body;
  const connectUrl = `mqtt://${host}:${port}`;
  const client = mqtt.connect(connectUrl, {
    clientId,
    clean: true,
    connectTimeout: timeout,
    username: username,
    password: password,
    reconnectPeriod: 1000,
  });
  client.on("connect", () => {
    new Client(clientId, client);
    console.log(Client.totalClientsNumber());
    res.send({ clientId, status: "connected", msg: "Successfully Connected" });
  });
});


app.post("/disconnect", async (req, res) => {
  const { clientId } = req.body;
  const client = Client.getClient(clientId);
  if (client) {
    try {
      await client.end();
      Client.deleteClient(clientId);
      res.send(`Client ${client.options.cliwsentId} disconnected successfully`);
    } catch (e) {
      res.send(e);
    }
  } else {
    res.status(404).send("Sorry there was no client connection to be closed");
  }
});


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


app.post("/subscribe", (req, res) => {
  const { clientId, topic } = req.body;
  let pubobj = { clientId: topic };
  const client = Client.getClient(clientId);
  client.subscribe(topic, () => {
    Client.addSubscribedTopic(pubobj);
    res.send(`Subscribe to topic '${topic}'`);
  });
});

//Simulation with websockets

  io.on('connection', client => {
    client.emit('connectionStatus', {isConnected: true, status: "connected", msg:"User connected"})
    client.on('clientId', data => { 
      console.log("Received client Id: "+data);
      const client = Client.getClient(data);
      console.log(client);
     });
    client.on('disconnect', () => { 
      console.log("User Disconnected")
     });
     setInterval(() => {
      client.emit("memory-usage", `${process.memoryUsage().heapUsed / 1024 / 1024} MB`);
      client.emit("cpu-usage", `${process.cpuUsage().system}`);
     }, 2000)
     
  });
  server.listen(3042);



app.listen(Port, () => {
  console.log("App Running...");
});

// Memory Usage Statistics
// const used = process.memoryUsage().heapUsed / 1024 / 1024;
// console.log(`Subscribe Memory Used ${Math.round(used * 100) / 100} MB`);
