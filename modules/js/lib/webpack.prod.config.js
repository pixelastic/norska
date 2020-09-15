const baseConfig = require('./webpack.base.config.js');

module.exports = {
  ...baseConfig,
  mode: 'production',
  devtool: 'source-map',
  plugins: [],
};
