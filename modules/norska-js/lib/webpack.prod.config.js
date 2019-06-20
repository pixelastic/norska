import baseConfig from './webpack.base.config.js';

export default {
  ...baseConfig,
  mode: 'production',
  devtool: 'source-map',
  plugins: [],
};
