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
};
