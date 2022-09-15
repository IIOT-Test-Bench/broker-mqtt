const chai = require("chai");
const assert = chai.assert;

const {
  generateID,
  getRandomNumber,
} = require("../HelperFunctions/generateClientId");

describe("Unit Testing", () => {
  it("Should generate random client Id for users", () => {
    assert.isNotNull(generateID);
  });
});
