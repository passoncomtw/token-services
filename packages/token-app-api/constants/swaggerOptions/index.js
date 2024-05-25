const dotenv = require('dotenv');
dotenv.config();

const paths = require('./paths');
const definitions = require('./definitions');
const host = process.env.SWAGGER_DOMAIN;

const options = {
  swagger: "2.0",
  info: {
    version: "1.0.0", //version of the OpenAPI Specification
    title: "錢包 app api",
    description: "錢包 app api",
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  host,
  basePath: "/",
  tags: [
    {
      name: "錢包",
      description: "使用者用 app",
    },
  ],
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  // securityDefinitions: {
  //   Bearer: {
  //     type: 'apiKey',
  //     name: 'Authorization',
  //     in: 'header',
  //   }
  // },
  paths: {
    ...paths,
  },
  definitions: {
    ...definitions
  },
};

module.exports.specs = options;
