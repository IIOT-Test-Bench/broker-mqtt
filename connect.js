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
    console.log(Object.keys(clientobject));
  });
});

//Close connection
app.post("/disconnect", async (req, res) => {
  const { clientId } = req.body;
  const client = clientobject[clientId];
  if(clientobject[clientId]){
    await client.end();
    res.send(`Client ${client.options.clientId} disconnected successfully`);
    delete clientobject[clientId];
    console.log(Object.keys(clientobject));
  }else{
    res.status(404).send("Sorry there was no client connection to be closed")
  }
  
});

    
// published
app.get("/publish", (req, res) => {
  const { clientId, topic, message } = req.body;
  const client = clientobject[clientId];

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
  const { clientId, topic, message } = req.body;
  const client = clientobject[clientId];
  
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
