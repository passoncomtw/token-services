const dotenv = require("dotenv");

dotenv.config();

const expressApp = require("../helpers/expressAppHelper");
const request = require("supertest");

describe("Test Server ", () => {
  it("should test server success", (done) => {
    done();
  });
});

module.exports.mockApp = request(expressApp);
