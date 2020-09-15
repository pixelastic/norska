const baseConfig = require('./webpack.base.config.js');

module.exports = {
  ...baseConfig,
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [],
};
