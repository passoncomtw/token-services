require("dotenv").config()
const isEmpty = require("lodash/isEmpty");

const {
  DB_USERNAME,
  DB_DATABASE,
  DB_PASSWORD,
  DB_HOST,
  DB_DIALECT,
  DB_PORT,
} = process.env;

const config = {
  username: DB_USERNAME,
  database: DB_DATABASE,
  host: DB_HOST,
  dialect: DB_DIALECT,
  port: isEmpty(DB_PORT)? 5432: DB_PORT,
  password: isEmpty(DB_PASSWORD)? undefined: DB_PASSWORD,
};

module.exports = config;
