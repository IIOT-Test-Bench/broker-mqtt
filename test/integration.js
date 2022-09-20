const { should } = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const { options } = require("node-os-utils");
const assert = chai.assert;
const Client = require("../Classes/Client");

const { app } = require("../connect");
chai.use(chaiHttp);

describe("Integration Test", () => {
  parameters = {
    host: "broker.emqx.io",
    port: "1883",
    clientId: `mqtt_${Math.random().toString(16).slice(3)}`,
    timeout: 4000,
    username: "emqx",
    password: "public",
  };
  it("Connection to Broker", (done) => {
    chai
      .request(app)
      .post("/connect")
      .send(parameters)
      .set("Content-Type", "application/json")
      .set("Accept", "application/json")
      .end((error, response) => {
        if (error) {
          done(err);
        } else {
          done();
        }
      });
  });
  it("Disconnect Client from broker", (done) => {
    chai
      .request(app)
      .post("/disconnect")
      .set("Content-Type", "application/json");
  });
});
