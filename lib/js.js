import _ from 'lodash';
import path from 'path';
import chalk from 'chalk';
import webpack from 'webpack';
import helper from './helper';
import config from './config';
import webpackConfigurator from './configs/webpackConfigurator';

export default {
  // Compile all css files
  async run(userOptions) {
    const options = {
      isProduction: true,
      ...userOptions,
    };

    const webpackConfig = webpackConfigurator.getConfig(options.isProduction);
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
        const displayName = chalk.green(webpackConfig.output.filename);
        console.info(`✔ Saving ${displayName}`);
        resolve('yep');
      });
    });
  },

  watch() {
    // Rebuild main file when changed
    helper.watch(path.join(config.from()), '*.js', () => {
      this.run({ isProduction: false });
    });
  },
};
