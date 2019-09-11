import { _, chalk } from 'golgoth';

export default {
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
   * Wrapper to get the current process.env.NODE_ENV variable.
   * Wrapping it makes it easier to mock in tests
   * @returns {string} The current NODE_ENV value
   **/
  currentEnvironment() {
    return _.get(process, 'env.NODE_ENV', 'development');
  },
  /**
   * Returns true if currently running in production mode
   * @returns {boolean} True if currently in production, false otherwise
   **/
  isProduction() {
    const keywords = ['prod', 'production'];
    return _.includes(keywords, this.currentEnvironment());
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
};
