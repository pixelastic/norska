const defaultConfig = require('./config.js');
module.exports = {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return defaultConfig;
  },
  async shouldCancelBuild() {
    return false;
  },
  async cancelBuild() {
  }
};
