const defaultConfig = require('./config.js');
const enable = require('./enable.js');
const build = require('./build.js');
module.exports = {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return defaultConfig;
  },
  /**
   * Enable Netlify on the current repo
   * Expected to be called by norska init
   **/
  async enable() {
    await enable.run();
  },
  /**
   * Check if the current build should happen
   * Expected to be called by norska build in production
   * @returns {boolean} True if should happen, false otherwise
   **/
  async shouldBuild() {
    return await build.shouldBuild();
  },
  /**
   * Cancels the current build
   * Expected to be called by norska build in production
   **/
  async cancelBuild() {
    await build.cancel();
  },
};
