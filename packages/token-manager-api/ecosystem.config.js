module.exports = {
  apps : [{
    name: 'token-wallet-api',
    script: 'server.js',
    watch: false,
    env_prod: {
      'NODE_ENV': 'prod',
    },
  }]
};