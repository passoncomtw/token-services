const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);

let routes = {};
const targetPath = `${__dirname}/src/constants/swaggerOptions/paths/`;

fs.readdirSync(targetPath)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js'
    );
  })
  .forEach((file) => {
    const route = require(`./${file}`);
    routes = { ...routes, ...route };
  });

module.exports = routes;
