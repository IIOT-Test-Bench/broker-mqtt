module.exports = class Client {
  static clientList = {};
  static totalClients = 0;
  static publishedTopics = [];
  static subscribedTopics = [];

  //Add a new connected client
  static addClient(clientId, clientObj) {
    this.clientList[clientId] = clientObj;
    ++this.totalClients;
    console.log(this.clientList[clientId]);
  }

  static totalClientsNumber() {
    return this.totalClients;
  }

  static allPublishedTopics() {
    let topics = Object.values(this.publishedTopics);
    return topics;
  }
  static addPublishedTopic(clientAndTopicObject) {
    this.publishedTopics.push(clientAndTopicObject);
  }

  static addSubscribedTopic(clientAndTopicObject) {
    this.subscribedTopics.push(clientAndTopicObject);
    console.log(this.subscribedTopics);
  }
};
