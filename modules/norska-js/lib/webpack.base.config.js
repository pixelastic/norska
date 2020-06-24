const path = require('path');

module.exports = {
  // Loader are imported relative to the files they load. We need to
  // overwrite where Webpack should look for them to load them from
  // norska-js and not the root project running norska.
  // But while in development, by using yarn workspaces, dependencies are
  // hoisted to the root, so we need to also make it look a few directories
  // higher.
  resolveLoader: {
    modules: [
      path.join(process.cwd(), './node_modules'), // project deps
      path.join(__dirname, '../node_modules'), // norska-js deps
      path.join(__dirname, '../../../node_modules'), // norska workspace deps
    ],
  },
  output: {
    library: 'script',
    libraryTarget: 'umd',
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.pug$/,
        use: { loader: 'pug-loader' },
      },
    ],
  },
};
