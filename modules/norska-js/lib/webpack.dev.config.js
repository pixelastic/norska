import baseConfig from './webpack.base.config.js';

export default {
  ...baseConfig,
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [],
};
