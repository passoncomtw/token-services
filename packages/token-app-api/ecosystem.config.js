module.exports = {
    apps : [{
      name   : "token-app-api",
      script : "./main.js",
      env_production: {
         NODE_ENV: "production"
      },
      env_development: {
         NODE_ENV: "development"
      }
    }]
  }