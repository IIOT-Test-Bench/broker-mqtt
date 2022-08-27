const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const mqtt = require("mqtt");

// middlewares
app.use(express.json());
