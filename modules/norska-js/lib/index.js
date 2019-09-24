import { _ } from 'golgoth';
import webpack from 'webpack';
import firost from 'firost';
import config from 'norska-config';
import helper from 'norska-helper';
import webpackProdConfig from './webpack.prod.config.js';
import webpackDevConfig from './webpack.dev.config.js';

export default {
  defaultConfig() {
    return {
      input: 'script.js',
      output: 'script.js',
    };
  },
  loadConfig(baseConfig) {
    return _.merge({}, baseConfig, {
      entry: config.fromPath(config.get('js.input')),
      output: {
        path: config.to(),
        filename: config.get('js.output'),
      },
    });
  },
  /**
   * Returns a webpack compiler from the specified config, and store it in cache
   * with the specified key. Any further call with the same key will fetch it
   * from the cache instead of rebuilding it
   * @param {object} config Webpack config object
   * @param {string} name Cache key identified
   * @returns {object} Webpack compiler object
   **/
  getCompiler(config, name) {
    const cacheKey = `norska.js.compilers.${name}`;
    if (firost.cache.has(cacheKey)) {
      return firost.cache.read(cacheKey);
    }
    return firost.cache.write(cacheKey, this.__webpack(config));
  },
  /**
   * Runs a webpack compiler. Returns the stats object on success
   * @param {object} compiler Webpack compiler
   * @returns {object} Stats object on success, errors on error
   **/
  async runCompiler(compiler) {
    return await new Promise((resolve, reject) => {
      compiler.run((_err, stats) => {
        if (stats.hasErrors()) {
          const errorMessage = stats.toJson().errors.join('\n');
          reject(
            helper.error('ERROR_WEBPACK_COMPILATION_FAILED', errorMessage)
          );
          return;
        }
        resolve(stats);
      });
    });
  },
  /**
   * Wrapper around the webpack compiler to catch errors and sanity check inputs
   * @param {object} config Webpack config
   * @returns {boolean} True on success, exit on error
   **/
  async runWebpack(config) {
    // Check that entry file exists, and fail early if it does not
    const entryFile = _.get(config, 'entry', null);
    if (!(await firost.exist(entryFile))) {
      helper.consoleWarn(
        `Cannot find ${entryFile}. Skipping Webpack compilation.`
      );
      return false;
    }

    const buildCompiler = this.getCompiler(config, 'prod');

    try {
      const stats = await this.runCompiler(buildCompiler);
      this.displayResults(stats);
      return true;
    } catch (err) {
      helper.consoleError(`[norska-js]: ${err.code}`);
      helper.consoleError(err.message);
      helper.exit(1);
    }
  },
  /**
   * Displays a recap of the compilation, including file compiled and time
   * elapsed
   * @param {object} stats Stats object, as returned by webpack
   **/
  displayResults(stats) {
    const filename = _.get(stats, 'compilation.options.output.filename');
    const time = stats.endTime - stats.startTime;
    helper.consoleSuccess(`${filename} compiled in ${time}ms`);
  },
  /**
   * Run webpack for production once
   * @returns {boolean} True if compilation worked, false otherwise
   **/
  async run() {
    const config = this.loadConfig(webpackProdConfig);
    return await this.runWebpack(config);
  },
  /**
   * Run webpack and listen for dev changes
   * @returns {boolean} True if compilation worked, false otherwise
   **/
  async watch() {
    const webpackConfig = this.loadConfig(webpackDevConfig);
    await firost.watch(webpackConfig.entry, async () => {
      await this.runWebpack(webpackConfig);
    });
  },
  /**
   * Wrapper around webpack(), to make it easier to mock in tests
   * @param {object} config Webpack config
   * @returns {object} Webpack compiler
   **/
  __webpack(config) {
    return webpack(config);
  },
};
