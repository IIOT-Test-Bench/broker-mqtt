const Client = require("./Client");

module.exports = class Publisher {

    //Set time in seconds
    constructor(publisherName, interval, clientId, topicLvl){
        this.publisherName = publisherName;
        this.interval = interval;
        this.intervalId = this.startPublishing(publisherName, interval, clientId, topicLvl);
    }

    startPublishing(publisherName, interval, clientId, topicLvl) {
        let intervalId = setInterval(() => {
            console.log(`${publisherName} - ${intervalId}: ${this.publishTopic(clientId, topicLvl)}`);
        }, interval * 1000);
        console.log("Started");
        return intervalId;
    }

    stopPublishing(intervalId) {
        clearInterval(intervalId)
    }

    publishTopic(clientId, topicLevel){
        const client = Client.getClient(clientId);
        const topic = "aaaabb";
        const message = "Lets test the publish";
        console.log("mmmmmmmmm",Client.allPublishedTopics());
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
