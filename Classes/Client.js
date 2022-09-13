module.exports = class Client {
  static clientList = {};
  static totalClients = 0;
  static publishedTopics = [];
  static subscribedTopics = [];

  constructor(clientid, clientobj){
    this.id = clientid;
    this.obj = clientobj;

    this.addClient(this.id, this.obj);
  }

  //Add a new connected client
  addClient(clientId, clientObj) {
    this.constructor.clientList[clientId] = clientObj;
    ++this.constructor.totalClients;
    console.log(this.constructor);
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

  static getClient(clientid) {
    return this.clientList[clientid];
  }

  static deleteClient(clientid) {
    delete this.clientList[clientid];
    --this.totalClients;
  }
};
