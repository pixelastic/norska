const imageProxy = require('norska-image-proxy');

/**
 * Returns a placeholder version of an image, to be used for lazyloading
 * @param {string} url Initial image url
 * @param {object} userOptions Image proxy option. See norska-image-proxy for more details
 * .placeholder key for placeholder specific arguments
 * @returns {string} Placeholder version of the image
 **/
module.exports = function (url, userOptions = {}) {
  const placeholderOptions = userOptions.placeholder || {};

  const options = {
    blur: 5,
    quality: 50,
    ...userOptions,
    ...placeholderOptions,
  };
  delete options.placeholder;
  return imageProxy(url, options);
};
