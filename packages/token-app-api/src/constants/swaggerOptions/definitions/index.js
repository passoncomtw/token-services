const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

let definitions = {};
const targetPath = `${__dirname}/src/constants/swaggerOptions/definitions/`;

fs.readdirSync(targetPath)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const route = require(`./${file}`);
    definitions = { ...definitions, ...route };
  });

module.exports = definitions;
