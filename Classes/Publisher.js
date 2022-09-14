const Client = require("./Client");
const { generateTopic } = require("../HelperFunctions/generateTopic");

module.exports = class Publisher {
  //Set time in seconds
  constructor(publisherName, interval, clientId, topic) {
    this.publisherName = publisherName;
    this.interval = interval;
    this.intervalId = this.startPublishing(
      publisherName,
      interval,
      clientId,
      topic
    );
  }

  startPublishing(publisherName, interval, clientId, topic) {
    let intervalId = setInterval(() => {
      this.publishTopic(clientId, topic);
      console.log(
        `${publisherName} - ${intervalId}: ${this.publishTopic(
          clientId,
          topic
        )}`
      );
    }, interval);
    console.log("Started");
    return intervalId;
  }

  stopPublishing(intervalId) {
    clearInterval(intervalId);
    // console.log("Stopping the interval with the ID", intervalId);
  }

  publishTopic(clientId, pubTopic) {
    const client = Client.getClient(clientId);
    const topic = pubTopic;
    const message = "Lets test the publish";
    // console.log("all published topics:",Client.allPublishedTopics());
    client.publish(topic, message, { qos: 0, retain: false }, (error) => {
      if (error) {
        console.log(error);
      } else {
        Client.addPublishedTopic([clientId, topic]);
        Client.addMessageCount(clientId);
        // console.log("Another", Client.allPublishedTopics());
      }
    });
  }
};

// let samplePub2 = new Publisher("Publ2", 1);
