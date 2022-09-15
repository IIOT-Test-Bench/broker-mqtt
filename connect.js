const express = require("express");
const app = express();
const Port = process.env.PORT || 3001;
const mqtt = require("mqtt");
const Client = require("./Classes/Client");
const Publisher = require("./Classes/Publisher");
const { generateTopic } = require("./HelperFunctions/generateTopic"); //Get Random topic
const { getRandomNumber } = require("./HelperFunctions/generateClientId"); //Get Random number

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const fs = require('fs');
const osu = require("node-os-utils");
require("loadavg-windows");


const server = require("https").createServer(app);

//Setup socket io on server
const io = require("socket.io")(server, {
  cors: {
    origin: "https://iiot-test-bench-project.netlify.app",
    credentials: true,
  },
});

const cors = require("cors");
//import subscriber class
const Subscribe = require("./Classes/Subscriber");

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: "https://iiot-test-bench-project.netlify.app",
    credentials: true,
  })
);

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
      // console.log("Another", Client.allPublishedTopics());
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
//Client used as the identity for the websocket client, MainClient to identify the main client connection to the broker
io.on("connection", (client) => {
  let clientId = null;

  client.emit("connectionStatus", {
    isConnected: true,
    status: "connected",
    msg: "User connected",
  });
  client.on("clientId", (data) => {
    console.log("Received client Id: " + data);
    // const client = Client.getClient(data);
    clientId = data;
  });

  let samplePubs = [];
  let sampleSubs = [];
  let symbs = null;
  let bytesRead = null;
  let bytesWritten = null;

  client.on("startSimulation", (data) => {
    //Receive parameters from the user
    const { numOfPubs, pubInterval, pubTopicLevel, numOfSubs, subTopicLevel } =
      data;
    samplePubs = new Array(numOfPubs);
    //Run publishing simulation
    for (let i = 0; i < numOfPubs; i++) {
      let pubTopic = generateTopic(4, pubTopicLevel);
      samplePubs[i] = new Publisher(
        `Publ ${i}`,
        pubInterval,
        clientId,
        pubTopic
      );
    }

    //Run subscribing simulation
    setTimeout(() => {
      let alreadyPublishedTopics = Client.allPublishedTopics();
      // console.log("alllllllrrreeeeeeaaaadyyyyy", alreadyPublishedTopics)
      for (let j = 0; j < numOfSubs; j++) {
        let subTopic =
          alreadyPublishedTopics[
            getRandomNumber(0, alreadyPublishedTopics.length)
          ]; //Get a random topic from already published for the simulation
        sampleSubs[j] = new Subscribe(`Subl ${j}`, clientId, subTopic);
        // console.log(sampleSubs[j]);
      }
      //Emit subscribed topics
      client.emit("topics", Client.allPublishedTopics());
    }, 4000);

    let receivedMessagesCount = 0;
    //listen for messages
    const listenForMsgs = Client.getClient(clientId);
    listenForMsgs.on("message", (topic, message) => {
      // console.log("The Topic" + topic + ":" + message);
      receivedMessagesCount += 1;
      client.emit("received", `${receivedMessagesCount}`);
    });

    //send sample statistics
    let statsInterval = setInterval(() => {
      symbs = Object.getOwnPropertySymbols(
        client.conn.transport.socket._socket
      );
      bytesRead = client.conn.transport.socket._socket[symbs[11]];
      bytesWritten = client.conn.transport.socket._socket[symbs[12]];
      client.emit(
        "memory-usage",
        `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
      );
      client.emit(
        "cpu-usage",
        `${((osu.cpu.loadavgTime() / 2) * 10).toFixed(2)} %`
      );
      client.emit("sent", `${Client.messageCount[clientId]}`);
      // console.log(client.conn.transport.socket._socket[symbs[12]], symbs[12], symbs[11]);
      client.emit("netin", `${bytesRead}`);
      client.emit("netout", `${bytesWritten}`);
    }, 2000);
  });

  client.on("stopSimulation", (data) => {
    //clear interval function when simulation stops
    const { numOfPubs } = data;
    if (samplePubs) {
      for (let i = 0; i < numOfPubs; i++) {
        // console.log(numOfPubs);
        // console.log(Object.keys(samplePubs));
        samplePubs[i].stopPublishing(samplePubs[i].intervalId);
        // console.log(samplePubs[i].intervalId);
      }
    }
    samplePubs = null;
    Client.messageCount[clientId] = 0;
    clearInterval(statsInterval);
  });

  client.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

server.listen(9000);

app.listen(Port, () => {
  console.log("App Running...");
});

// Memory Usage Statistics
// const used = process.memoryUsage().heapUsed / 1024 / 1024;
// console.log(`Subscribe Memory Used ${Math.round(used * 100) / 100} MB`);
