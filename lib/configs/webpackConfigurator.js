import path from 'path';
import config from '../config';

const productionConfig = {
  mode: 'production',
  devtool: 'source-map',
  plugins: [],
};
const developmentConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  plugins: [],
  watch: true,
};

export default {
  getConfig(isProduction) {
    const from = config.from();
    const to = config.to();

    const baseConfig = {
      entry: [path.resolve(from, 'script.js')],
      output: {
        path: to,
        filename: 'script.js',
        library: 'script',
        libraryTarget: 'umd',
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            enforce: 'pre',
            use: { loader: 'babel-loader' },
          },
        ],
      },
    };

    return {
      ...baseConfig,
      ...(isProduction ? productionConfig : developmentConfig),
    };
  },
};
