const express = require("express");
const app = express();
const Port = process.env.PORT || 3001;
const mqtt = require("mqtt");

//import classes
const Client = require("./Classes/Client");
const Publisher = require("./Classes/Publisher");
const Subscribe = require("./Classes/Subscriber");

//import helper functions
const { generateTopic } = require("./HelperFunctions/generateTopic"); //Get Random topic
const { getRandomNumber } = require("./HelperFunctions/generateClientId"); //Get Random number

const swaggerDocument = require("./swagger.json");
const swaggerUi = require("swagger-ui-express");

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const fs = require("fs");
const osu = require("node-os-utils");
require("loadavg-windows");

//import cors
const cors = require("cors");

//Setup server/ socket connection
const server = require("http").createServer(app);

//Setup socket io on server
const io = require("socket.io")(server, {
  cors: {
    origin: "https://iiot-test-bench-project.netlify.app",
  },
});

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  const indexhtml = `
            <div style="margin-top: 10em;display: flex;align-items: center;justify-content: space-evenly;">
                <h1 style="font-size: 4em;">IIOT <span style="color:#4e73df;">Test Bench</span></h1>
                <a href="https://iiot-bench.herokuapp.com/docs/">
                  <button>Swagger Documentation</button>
                </a>

            </div>
    `;
  res.send(indexhtml);
});

app.post("/connect", async (req, res) => {
  const { host, port, clientId, timeout, username, password } = req.body;
  const connectUrl = `mqtt://${host}:${port}`;
  try{
    const client = mqtt.connect(connectUrl, {
      clientId,
      clean: true,
      connectTimeout: timeout,
      username: username,
      password: password,
      reconnectPeriod: 1000,
    });
    if(client){
      client.on("connect", () => {
        new Client(clientId, client);
        console.log(Client.totalClientsNumber());
        res.send({ clientId, status: "connected", msg: "Successfully Connected" });
      });
    }else{
      res.send({msg: "Could not connect, enter the right parameters"});
    }
  }catch(err){
    res.send({msg: "Could not connect"});
  }
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
  let statsInterval = null;
  let connectedUsers = 0;
  let receivedMessagesCount = null;

  client.on("startSimulation", (data) => {
    //Receive parameters from the user
    const { numOfPubs, pubInterval, pubTopicLevel, numOfSubs, subTopicLevel } = data;
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
      client.emit("topics", Client.clientPublishedTopics(clientId));
    }, 2000);

    receivedMessagesCount = 0;
    //listen for messages
    const listenForMsgs = Client.getClient(clientId);
    listenForMsgs?.on("message", (topic, message) => {
      // console.log("The Topic" + topic + ":" + message);
      receivedMessagesCount += 1;
      client.emit("received", `${receivedMessagesCount}`);
    });

    //send sample statistics
    statsInterval = setInterval(() => {
      //get the network bytes
      symbs = Object.getOwnPropertySymbols(
        client.conn.transport.socket._socket
      );
      bytesRead = client.conn.transport.socket._socket[symbs[11]];
      bytesWritten = client.conn.transport.socket._socket[symbs[12]];

      //Emit number of connected users
      connectedUsers = Client.totalClientsNumber();

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
      client.emit("connected-users", `${connectedUsers}`);
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
    Client.resetMessageCount(clientId);
    receivedMessagesCount = 0;
    clearInterval(statsInterval);
  });

  client.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

// server.listen(9000)

server.listen(Port, () => {
  console.log("App Running...");
});
