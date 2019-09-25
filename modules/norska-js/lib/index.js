import EventEmitter from 'events';
import config from 'norska-config';
import firost from 'firost';
import helper from 'norska-helper';
import webpackDevConfig from './webpack.dev.config.js';
import webpackProdConfig from './webpack.prod.config.js';
import webpack from 'webpack';
import { _, pify } from 'golgoth';

export default {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return {
      input: 'script.js',
      output: 'script.js',
    };
  },
  /**
   * Return the correct Webpack config object
   * Note: The config is slightly different if we're building for production or
   * for dev (dev is faster), and it also correctly set the input and ouput
   * field based on what is defined in the configuration
   * @returns {object} Webpack configuration object
   **/
  async loadConfig() {
    const baseConfig = helper.isProduction()
      ? webpackProdConfig
      : webpackDevConfig;
    const webpackConfig = _.merge({}, baseConfig, {
      entry: config.fromPath(config.get('js.input')),
      output: {
        path: config.to(),
        filename: config.get('js.output'),
      },
    });
    // Check that entry file exists, and fail early if it does not
    const entryFile = _.get(webpackConfig, 'entry', null);
    if (!(await firost.exist(entryFile))) {
      return false;
    }
    return webpackConfig;
  },
  /**
   * Return a webpack instance with .run() and .watch() methods
   * Note: It will promisify the .run and .watch methods
   * @returns {boolean|object} False if config is invalid, Webpack object
   * otherwise
   **/
  async getCompiler() {
    const webpackConfig = await this.loadConfig();
    if (!webpackConfig) {
      return false;
    }

    const compiler = this.__webpack(webpackConfig);
    compiler.run = this.__pify(compiler.run.bind(compiler));
    // compiler.watch = this.__pify(compiler.watch.bind(compiler));
    return compiler;
  },
  /**
   * Displays a recap of the compilation, including file compiled and time
   * elapsed
   * @param {object} stats Stats object, as returned by webpack
   **/
  displayStats(stats) {
    const filename = _.get(stats, 'compilation.options.output.filename');
    const time = stats.endTime - stats.startTime;
    helper.consoleSuccess(`${filename} compiled in ${time}ms`);
  },
  /**
   * Build the output js file once
   * @returns {boolean} True if compilation worked, false otherwise
   **/
  async run() {
    const compiler = await this.getCompiler();
    if (!compiler) {
      return false;
    }

    const stats = await compiler.run();
    if (stats.hasErrors()) {
      const errorMessage = stats.toJson().errors.join('\n');
      throw helper.error('ERROR_WEBPACK_COMPILATION_FAILED', errorMessage);
    }
    this.displayStats(stats);
  },
  /**
   * Run webpack and listen for dev changes
   * @returns {Event} Event emitter firing 'error' and 'build' events
   **/
  async watch() {
    const compiler = await this.getCompiler();
    if (!compiler) {
      return false;
    }

    const pulse = new EventEmitter();
    this.watcher = compiler.watch({}, (err, stats) => {
      if (stats.hasErrors()) {
        pulse.emit('error', stats);
        const errorMessage = stats.toJson().errors.join('\n');
        helper.consoleError(errorMessage);
        return;
      }
      pulse.emit('build', stats);
      this.displayStats(stats);
    });
    return pulse;
  },
  /**
   * Webpack watcher instance, to be able to call .unwatch() to stop watching
   * (used in tests)
   **/
  watcher: null,
  /**
   * Stop watching for file changes
   * Note: This is very useful in tests to prevent the watch to run forever
   **/
  unwatch() {
    this.watcher.close();
  },
  /**
   * Wrapper around webpack(), to make it easier to mock in tests
   * @param {object} config Webpack config
   * @returns {object} Webpack compiler
   **/
  __webpack: webpack,
  /**
   * Wrapper around pify(), to make it easier to mock in tests
   * @param {Function} method Method to promisify
   * @returns {Function} Promisified method
   **/
  __pify: pify,
};
