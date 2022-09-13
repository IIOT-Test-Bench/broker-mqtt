//Function to generate random client Id for users that would select option
const generateID = (lim) => {
    let strArr = [];
    //using a sample string 
    //String.fromCharCode()
    for(let i=0; i<lim; i++){
        strArr.push(String.fromCharCode(getRandomNumber(97, 122)))
    }
    let id = strArr.join("");
    return id;
}

const getRandomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

module.exports = {generateID, getRandomNumber}

console.log(getRandomNumber(40, 50));
console.log(generateID(5));
