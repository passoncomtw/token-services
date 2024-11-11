const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/packages/token-app-api'),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.js',
      tsConfig: './tsconfig.app.json',
      assets: [
        './src/assets',
        './src/controllers',
        './src/database',
        './src/helpers',
        './src/services',
        './src/specs',
        './src/constants',
        './.sequelizerc',
        './.env',
      ],
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
    }),
  ],
};
