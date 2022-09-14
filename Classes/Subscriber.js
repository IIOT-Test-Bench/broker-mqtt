const Client = require("./Client");

module.exports = class Subscribe {
    constructor(subscriberName, clientId, topic){
        this.subscriberName = subscriberName;
        this.intervalId = this.startPublishing(subscriberName, clientId, topic);
    }

    subscribeToTopic(subscriberName, clientId, topic){
        const client = Client.getClient(clientId);
        client.subscribe(topic, () => {
            Client.addSubscribedTopic([clientId, topic]);
            console.log("Subscribed "+ subscriberName);
            //Return true to confirm successful subscribe
            return true;
        });
        
    }
}