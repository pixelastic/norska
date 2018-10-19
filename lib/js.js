import helper from './helper';
import _ from 'lodash';
import chalk from 'chalk';
import webpackConfig from '../webpack.config';
import webpack from 'webpack';

export default {
  // Compile all css files
  async run() {
    return await new Promise((resolve, reject) => {
      webpack(webpackConfig, (_err, stats) => {
        if (stats.hasErrors()) {
          const fullStats = stats.toJson();
          _.map(fullStats.errors, error => {
            console.info(chalk.red(error));
          });
          reject(new Error());
          return;
        }

        resolve('yep');
      });
    });
  },

  watch() {
    // Rebuild main file when changed
    helper.watch('./src/*.js', () => {
      this.run();
    });
  },
};
