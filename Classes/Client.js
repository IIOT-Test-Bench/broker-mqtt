module.exports = class Client {
  static clientList = {};
  static totalClients = 0;
  static messageCount = {};
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
    // console.log(this.constructor);
  }

  static totalClientsNumber() {
    return this.totalClients;
  }

  //get toptal published topics
  static allPublishedTopics() {
    let topics = [];
    for(let elem of this.publishedTopics){
      if(!topics.includes(elem[1])){
        topics.push(elem[1]);
      }
    }
    return topics;
  }

  //Get all topics published by a specific client
  static clientPublishedTopics(userId) {
    let topics = [];
    for(let elem of this.publishedTopics){
      if(!topics.includes(elem[1]) && (elem[0] === userId)){
        topics.push(elem[1]);
      }
    }
    return topics;
  }
  static addPublishedTopic(clientAndTopic) {
    this.publishedTopics.push(clientAndTopic);
  }

  static addSubscribedTopic(clientAndTopic) {
    this.subscribedTopics.push(clientAndTopic);
    // console.log(this.subscribedTopics);
  }

  static getClient(clientid) {
    return this.clientList[clientid];
  }

  static deleteClient(clientid) {
    delete this.clientList[clientid];
    --this.totalClients;
  }

  //Array storing the count of messages per each connected client
  static addMessageCount(clientId) {
    if(this.messageCount[clientId] >= 0){
      this.messageCount[clientId] += 1;
    }else{
      this.messageCount[clientId] = 1;
    }
  }

  static resetMessageCount(clientId) {
    if(this.messageCount[clientId]){
      this.messageCount[clientId] = 0;
    }
  }
  
};
