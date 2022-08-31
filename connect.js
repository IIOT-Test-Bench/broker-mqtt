const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const mqtt = require("mqtt");
const { emma } = require("./config");

// middlewares
app.use(express.json());

// Get Request
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Post Request

emma;

app.listen(Port, () => {
  console.log("App Running...");
});
