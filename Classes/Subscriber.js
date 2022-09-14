const Client = require("./Client");

module.exports = class Subscribe {
    constructor(subscriberName, clientId, topic){
        this.subscriberName = subscriberName;
        this.result = this.subscribeToTopic(subscriberName, clientId, topic);
    }

    subscribeToTopic(subscriberName, clientId, topic){
        const client = Client.getClient(clientId);
        client.subscribe(topic, () => {
            Client.addSubscribedTopic([clientId, topic]);
            console.log("Subscribed "+ subscriberName);
        });
        
    }
}