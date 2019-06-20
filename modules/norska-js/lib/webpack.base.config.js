import path from 'path';

export default {
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
