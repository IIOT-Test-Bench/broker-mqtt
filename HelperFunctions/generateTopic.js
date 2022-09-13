const {generateID} = require("./generateClientId");
// import generateID from "./generateClientId";

const generateTopic = (topicLen, topicLvl) => {
    let initialStr = generateID(topicLen);
    for(let i=0; i<topicLvl; i++){
        initialStr += `/${generateID(topicLen)}`;
    }
    return initialStr;
}


module.exports = {generateTopic};
