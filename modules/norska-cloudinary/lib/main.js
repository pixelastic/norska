const defaultConfig = require('./config.js');
module.exports = {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return defaultConfig;
  },
  /**
   * Init Cloudinary, setting all needed config options
   * @param {object} userConfig Custom config passed by the use
   * @returns {object} Returns the instance, for chaining
   **/
  init(userConfig = {}) {
    this.config = {
      ...this.defaultConfig(),
      ...userConfig,
    };
    return this;
  },
  // Stores the current config
  config: {},
  /**
   * Proxify an url through cloudinary
   * @param {string} userUrl Image url
   * @param {object} userOptions Options to transform the image. See ./proxy.js
   * for details
   * @returns {string} Full url with transforms applied
   */
  proxy(userUrl, userOptions) {
    // Note: We require the file in the function call, otherwise it creates
    // a circular dependency and one dependency does not resolve
    const proxy = require('./proxy.js');
    return proxy(userUrl, userOptions);
  },
};
