const chai = require("chai");
const assert = chai.assert;

const {
  generateID,
  getRandomNumber,
} = require("../HelperFunctions/generateClientId");

describe("Unit Testing", () => {
  it("Should generate random client Id for users", () => {
    let randomClient = generateID(7);
    assert.isNotNull(randomClient);
    assert.isString(randomClient);
    ass;
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
