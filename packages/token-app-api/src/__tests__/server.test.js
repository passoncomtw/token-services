const dotenv = require('dotenv');

dotenv.config();

const expressApp = require("../helpers/expressAppHelper");
const request = require("supertest");

module.exports.mockApp = request(expressApp);
