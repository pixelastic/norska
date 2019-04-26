import path from 'path';
import config from 'norska-config';

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
      entry: path.resolve(from, 'script.js'),
      // Loader are imported relative to the files they load. We need to
      // overwrite where Webpack should look for them to load them from
      // norska-js and not the root project running norska.
      // But while in development, by using yarn workspaces, dependencies are
      // hoisted to the root, so we need to also make it look a few directories
      // higher.
      resolveLoader: {
        modules: [
          path.join(__dirname, '../node_modules'), // norska-js deps
          path.join(__dirname, '../../../node_modules'), // norska workspace deps
        ],
      },
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
