const {generateID} = require("./generateClientId");
// import generateID from "./generateClientId";

module.exports = generateTopic = (topicLen, topicLvl) => {
    let initialStr = generateID(topicLen);
    for(let i=0; i<topicLvl; i++){
        initialStr += `/${generateID(topicLen)}`;
    }
    return initialStr;
}



console.log(generateTopic(4,3));