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


// Publish
app.post("/publish", async (req, res) => {
  const { clientId, topic, message } = req.body;
  const client = clientobject[clientId];

  try{
    client.publish(topic, message);
    console.log("Message sent!", message);
    res.send("published successfully");
  }catch(e){
    console.log(e);
  }
});

// Subscribe
app.post("/subscribe", async (req, res) => {
    console.log(Object.keys(clientobject));
    const { clientId, topic } = req.body;
  try{
    console.log(clientId, topic);
    const client = clientobject[clientId];
    console.log(client);
    
    client.subscribe(topic, () => {
        console.log(`Subscribe to topic ${topic}`);
        res.send("subscribed successfully");
    });

    // client.on("message", (topic, message) => {
    //   message = message.toString();
    //   console.log(message);
    // });
  }catch(e){
      console.log(e);
  }
  
});

app.listen(Port, () => {
  console.log("App Running...");
});
