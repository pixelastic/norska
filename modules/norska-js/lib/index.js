import { _, chalk, firost } from 'golgoth';
import path from 'path';
import webpack from 'webpack';
import config from 'norska-config';
import webpackConfigurator from './webpack.config.js';

export default {
  // Compile all css files
  async run(userOptions) {
    const options = {
      isProduction: true,
      ...userOptions,
    };

    const webpackConfig = webpackConfigurator.getConfig(options.isProduction);

    // Throw a warning if js entrypoint defined but does not exist
    const jsEntryPoint = _.get(webpackConfig, 'entry');
    const entryPointExists = await firost.exists(jsEntryPoint);
    if (!entryPointExists) {
      console.info(
        chalk.yellow(`⚠ Cannot find JavaScript file in ${jsEntryPoint}`)
      );
      return false;
    }

    console.info(webpackConfig);
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
    const watchedFiles = path.join(config.from(), '*.js');
    firost.watch(watchedFiles, () => {
      this.run({ isProduction: false });
    });
  },
};
