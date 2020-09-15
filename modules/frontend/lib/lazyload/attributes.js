const imageProxy = require('norska-image-proxy');
const placeholderize = require('./placeholderize.js');
/**
 * Returns .full and .placeholder keys from any image url to use in lazyloading
 * @param {string} url Path to the image
 * @param {object} userOptions
 * - disable: Force loading if set to true
 * @returns {object} Attribute object
 */
module.exports = function (url, userOptions = {}) {
  const options = {
    disable: false,
    placeholder: {},
    ...userOptions,
  };

  const isDisabled = options.disable;
  delete options.disable;

  const fullUrl = imageProxy(url, options);

  if (isDisabled) {
    return {
      full: fullUrl,
      placeholder: fullUrl,
    };
  }

  const placeholderUrl = placeholderize(url, options);
  return {
    full: fullUrl,
    placeholder: placeholderUrl,
  };
};
