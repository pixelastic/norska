const lazySizes = require('lazysizes');

module.exports = {
  /**
   * Enable lazyloading of images when they enter the viewport
   **/
  init() {
    lazySizes.init();
  },
};
