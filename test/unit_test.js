const chai = require("chai");
const assert = chai.assert;

const {
  generateID,
  getRandomNumber,
} = require("../HelperFunctions/generateClientId");
const { generateMessage } = require("../HelperFunctions/generateMessage");
const { generateTopic } = require("../HelperFunctions/generateTopic");

describe("Unit Testing", () => {
  it("Should generate random client Id for users", () => {
    let randomClient = generateID(7);
    assert.isNotNull(randomClient, "Should not be null");
    assert.isString(randomClient, "Should be a string");
  });
});

describe("Unit Testing", () => {
  it("Should generate Random numbers", () => {
    let randomNumber = getRandomNumber(1, 10);
    assert.isNotNull(randomNumber);
    assert.isNumber(randomNumber);
    assert.isAtLeast(randomNumber, 0);
  });
});

describe("Unit Testing", () => {
  it("Should generate messages", () => {
    let wordLength = 2;
    let numOfWords = 10;
    assert.isNotNull(generateMessage());
    assert.isString(generateMessage());
  });
});

describe("Unit Testing", () => {
  it("Should generate Random Topics", () => {
    let topicLen = 2;
    let topicLvl = 2;
    assert.isNotNull(generateTopic());
    assert.isString(generateTopic());
    assert.isNotArray(generateTopic());
  });
});
