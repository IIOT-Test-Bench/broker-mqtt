const Client = require("./Client");
const {generateTopic} = require("../HelperFunctions/generateTopic");

module.exports = class Publisher {

    //Set time in seconds
    constructor(publisherName, interval, clientId, topic){
        this.publisherName = publisherName;
        this.interval = interval;
        this.intervalId = this.startPublishing(publisherName, interval, clientId, topic);
    }

    startPublishing(publisherName, interval, clientId, topic) {
        let intervalId = setInterval(() => {
            console.log(`${publisherName} - ${intervalId}: ${this.publishTopic(clientId, topic)}`);
        }, interval * 1000);
        console.log("Started");
        return intervalId;
    }

    stopPublishing(intervalId) {
        clearInterval(intervalId)
    }

    publishTopic(clientId, pubTopic){
        const client = Client.getClient(clientId);
        const topic = pubTopic;
        const message = "Lets test the publish";
        console.log("all published topics:",Client.allPublishedTopics());
        client.publish(topic, message, { qos: 0, retain: false }, (error) => {
            if (error) {
                console.log(error);
            } else {
            Client.addPublishedTopic([ clientId, topic ]);
            console.log("Another", Client.allPublishedTopics());
            }
        });
    }
}


// let samplePub2 = new Publisher("Publ2", 1);
