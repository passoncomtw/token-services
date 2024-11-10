module.exports = {
    apps : [{
      name   : "token-app-api",
      script : "./dist/packages/token-app-api/main.js",
      env_production: {
         NODE_ENV: "production"
      },
      env_development: {
         NODE_ENV: "development"
      }
    }]
  }