import { _, chalk } from 'golgoth';
import path from 'path';
import config from 'norska-config';
import timeSpan from 'time-span';
import firost from 'firost';

export default {
  /**
   * Cache of the site data, read from ./src/_data.json
   **/
  __siteData: {},
  /**
   * Write a warning log message
   * @param {string} text Text to display
   **/
  consoleWarn(text) {
    console.info(chalk.yellow('⚠'), text);
  },
  /**
   * Write a success log message
   * @param {string} text Text to display
   **/
  consoleSuccess(text) {
    console.info(chalk.green('✔'), text);
  },
  /**
   * Write an error log message
   * @param {string} text Text to display
   **/
  consoleError(text) {
    console.info(chalk.red('✘'), text);
  },
  /**
   * Wrapper around the raw require() call, to make it easier to mock in tests
   * @param {string} id Module identifier
   * @returns {*} Module content
   **/
  require(id) {
    return require(id);
  },
  /**
   * Wrapper around the raw process.exit() call, to make it easier to mock in tests
   * @param {string} errorCode Error code to return
   **/
  exit(errorCode) {
    process.exit(errorCode);
  },
  /**
   * Utility function to return errors containing a code (like fs-extra is
   * doing) and a message
   * @param {string} errorCode Error code
   * @param {string} errorMessage Error message
   * @returns {Error} new Error with .code and .message set
   **/
  error(errorCode, errorMessage) {
    const newError = new Error(errorMessage);
    newError.code = errorCode;
    newError.message = errorMessage;
    return newError;
  },
  /**
   * Read the _data.json file in ./src and returns its content
   * @param {object} userOptions Option object. Allowed keys are:
   * - cache {boolean} default to true. If set to false, will force re-reading
   *   the file
   * @returns {object} The _data.json config object
   **/
  async siteData(userOptions = {}) {
    const options = {
      cache: true,
      ...userOptions,
    };

    // Return the cache value if we already read it
    if (options.cache && !_.isEmpty(this.__siteData)) {
      return this.__siteData;
    }

    // Check that the file actually exists
    const filepath = config.fromPath('_data.json');
    if (!(await firost.exists(filepath))) {
      this.consoleWarn(`Cannot find config file ${filepath}`);
      return {};
    }

    // Read and record data to cache
    const data = await firost.readJson(filepath);
    this.__siteData = data;
    return data;
  },

  // Write a file to disk
  async writeFile(what, where, timer) {
    await firost.write(what, where);

    const extname = path.extname(where);
    const to = config.to();
    let displayName = path.relative(to, where);
    const colors = {
      '.html': 'magenta',
      '.css': 'yellow',
    };
    if (colors[extname]) {
      displayName = chalk[colors[extname]](displayName);
    }

    let message = `✔ Saving ${displayName}`;
    if (timer) {
      message = `${message} in ${timer.elapsed()}`;
    }

    console.info(message);
  },
  timer() {
    const running = timeSpan();
    return {
      elapsed() {
        return `${_.round(running.seconds(), 2)}s`;
      },
    };
  },
};
