const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const mqtt = require("mqtt");
const { client } = require("./config");

// middlewares
app.use(express.json());

// Get Request
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Post Request
// Connection
app.get("/connect", (req, res) => {
  client();
  client.on("connect", () => {
    console.log(`Connected`);
  });
  res.send("Broker Connected!");
});

app.listen(Port, () => {
  console.log("App Running...");
});
