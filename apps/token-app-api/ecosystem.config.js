module.exports = {
  apps : [{
    name: 'token-app-api',
    script: 'server.js',
    watch: '.',
    env: {
      "NODE_ENV": "prod",
    },
  }]
};
