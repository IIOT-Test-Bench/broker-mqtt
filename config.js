const mqtt = require("mqtt");

const connectUrl = `mqtt://${host}:${port}`;
const client = await mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: "emqx",
  password: "public",
  reconnectPeriod: 1000,
});
