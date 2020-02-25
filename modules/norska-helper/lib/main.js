const _ = require('golgoth/lib/lodash');

module.exports = {
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
};
