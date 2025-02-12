module.exports = {
  apps : [{
    name: 'token-admin-api',
    script: 'server.js',
    watch: false,
    env_prod: {
      'NODE_ENV': 'prod',
    },
  }]
};