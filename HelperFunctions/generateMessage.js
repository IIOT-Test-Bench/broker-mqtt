const {generateID} = require("./generateClientId");

const generateMessage = (wordLength, numOfWords) => {
    let sentence = generateID(wordLength);
    for(let i=0; i<numOfWords - 1 ; i++){
        sentence += ` ${generateID(wordLength)}`;
    }
    return sentence;
}

module.exports = {generateMessage};