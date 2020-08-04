const imageProxy = require('norska-images');

/**
 * Returns a placeholder version of an image, to be used for lazyloading
 * @param {string} url Initial image url
 * @param {object} userOptions Image proxy option. See norska-images/lib/main.js
 * for more details
 * .placeholder key for placeholder specific arguments
 * @returns {string} Placeholder version of the image
 **/
module.exports = function (url, userOptions = {}) {
  const placeholderOptions = userOptions.placeholder || {};

  const options = {
    blur: 5,
    quality: 10,
    ...userOptions,
    ...placeholderOptions,
  };
  return imageProxy(url, options);
};
