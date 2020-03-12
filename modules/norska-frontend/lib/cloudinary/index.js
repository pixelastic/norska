const firostError = require('firost/lib/error');

module.exports = {
  config: {},
  /**
   * Init Cloudinary, setting all needed config options
   * @param {object} userConfig
   * - bucketName
   **/
  init(userConfig = {}) {
    this.config = {
      bucketName: null,
      ...userConfig,
    };
  },
  get(key) {
    const value = this.config[key];
    if (value) {
      return value;
    }
    throw firostError(
      'CLOUDINARY_MISSING_CONFIG',
      `No config defined for ${key}`
    );
  },
};
