const lazyload = require('norska/frontend/lazyload');
module.exports = {
  async init() {
    // Lazy loading of images when in viewport
    lazyload.init();
  },
};
