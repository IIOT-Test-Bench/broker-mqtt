const express = require("express");
const app = express();
const Port = process.env.PORT || 3000;
const mqtt = require("mqtt");
const Client = require("./Classes/Client");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const cors = require("cors");

// Swagger congif
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "IIoT Test Bench",
      description: `A dashboard for showing performance and load with a very large 
        number of messages, publishing large amounts of data via the broker and networks, 
        persistence, security and compression of IoT data.`,
      contact: {
        name: "Amalitech",
      },
      servers: ["https://iiot-bench.herokuapp.com/"],
    },
  },
  apis: ["connect.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// middlewares
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * tags:
 *  name: Requests
 *  description: Api Requests
 */

// Deffs
/**
 * @swagger
 * definitions:
 *  Broker:
 *   type: object
 *   properties:
 *    host:
 *     type: string
 *     example: "broker.emqx.io"
 *    port:
 *     type: string
 *     example: "1883"
 *    clientId:
 *     type: string
 *     example: "mqtt_a6086a790b02"
 *    timeout:
 *     type: string
 *     example: "4000"
 *    username:
 *     type: string
 *     example: "emqx"
 *    password:
 *     type: string
 *     example: "public"
 *   required:
 *     - host
 *     - port
 *     - clientId
 *     - timeout
 *     - username
 *     - password
 */

/**
 * @swagger
 * definitions:
 *  Disconnect:
 *   type: object
 *   properties:
 *    clientId:
 *     type: string
 *     example: "mqtt_a6086a790b02"
 *   required:
 *     - clientId
 */

// Publisher
/**
 * @swagger
 * definitions:
 *  publish:
 *   type: object
 *   properties:
 *    clientId:
 *     type: string
 *     example: "mqtt_a6086a790b02"
 *    topic:
 *     type: string
 *    message:
 *     type: string
 *   required:
 *     - clientId
 *     - topic
 *     - message
 */

// Subscriber
/**
 * @swagger
 * definitions:
 *  publish:
 *   type: object
 *   properties:
 *    clientId:
 *     type: string
 *     example: "mqtt_a6086a790b02"
 *    topic:
 *     type: string
 *   required:
 *     - clientId
 *     - topic
 */

// Get Request
/**
 * @swagger
 * /:
 *  get:
 *     description: Home Page of Server
 *     tags: [Requests]
 *     responses:
 *        '200':
 *            description: A successful response
 */
app.get("/", (req, res) => {
  const indexhtml = `
            <div style="margin-top: 10em;display: flex;align-items: center;justify-content: space-evenly;">
                <h1 style="font-size: 4em;">IIOT <span style="color:#4e73df;">Test Bench</span></h1>
            </div>
    `;
  res.send(indexhtml);
});

// Post Request
// Connection to the broke
/**
 * @swagger
 * /connect:
 *  post:
 *    summary: Connect to Broker
 *    description: Connect to Broker with parameters
 *    parameters:
 *      - in: body
 *        host: body
 *        port: body
 *        clientId: body
 *        timeout: body
 *        username: body
 *        password: body
 *        schema:
 *           $ref: '#definitions/Broker'
 *    requestBody:
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/definitions/Broker'
 *    responses:
 *      200:
 *        description: Connected to Broker Successfully
 *      500:
 *        description: Failed to connect to Broker
 */
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
    Client.addClient(clientId, client);
    console.log(Client.totalClientsNumber());
    res.send({ clientId, status: "connected", msg: "Successfully Connected" });
    console.log(clientobject);
  });
});

// Disconnect
/**
 * @swagger
 * /disconnect:
 *  post:
 *    summary: Disconnect Broker
 *    description: Disconnect to Broker
 *    parameters:
 *        clientId: body
 *        schema:
 *           $ref: '#definitions/Disconnect'
 *    requestBody:
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/definitions/Disconnect'
 *    responses:
 *      200:
 *        description: Connected to Broker Successfully
 *      500:
 *        description: Failed to connect to Broker
 */
app.post("/disconnect", async (req, res) => {
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
/**
 * @swagger
 * /publish:
 *  post:
 *    summary: Publish Topic
 *    description: Publish topic and messages
 *    parameters:
 *        clientId: body
 *        schema:
 *           $ref: '#definitions/publish'
 *    requestBody:
 *      content:
 *       application/json:
 *          schema:
 *           $ref: '#/definitions/publish'
 *    responses:
 *      200:
 *        description: Connected to Broker Successfully
 *      500:
 *        description: Failed to connect to Broker
 */
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

// subscribe
app.post("/subscribe", (req, res) => {
  const { clientId, topic } = req.body;
  let pubobj = { clientId: topic };
  const client = Client.getClient(clientId);
  client.subscribe(topic, () => {
    Client.addSubscribedTopic(pubobj);
    res.send(`Subscribe to topic '${topic}'`);
  });
});

app.listen(Port, () => {
  console.log("App Running...");
});

// Memory Usage Statistics
// const used = process.memoryUsage().heapUsed / 1024 / 1024;
// console.log(`Subscribe Memory Used ${Math.round(used * 100) / 100} MB`);
