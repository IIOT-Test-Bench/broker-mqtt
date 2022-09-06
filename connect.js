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
      servers: ["http://localhost:3000"],
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
// Connection to the broker
/**
 * @swagger
 * /connect:
 *  post:
 *   Summary: Connection to a broker
 *   tags: [Requests]
 *   requestBody:
 *        required: true
 *        content:
 *           application/json:
 *   responses:
 *       200:
 *         description: Connected to Broker Successfully
 */
app.post("/connect", async (req, res) => {
  const { host, port, clientId, timeout, username, password } = req.body;
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
    // console.log(clientobject);
  });
});

// Disconnect
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
