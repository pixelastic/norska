const proxy = require('../cloudinary/proxy.js');
const placeholderize = require('./placeholderize.js');
/**
 * Returns .full and .placeholder keys from any image url to use in lazyloading
 * @param {string} url Path to the image
 * @param {object} userOptions
 * - disable: Force loading if set to true
 * @returns {object} Attribute object
 */
module.exports = function(url, userOptions = {}) {
  const options = {
    disable: false,
    ...userOptions,
  };

  const isDisabled = options.disable;

  const fullUrl = proxy(url);

  if (isDisabled) {
    return {
      full: fullUrl,
      placeholder: fullUrl,
    };
  }

  const placeholderUrl = placeholderize(url);
  return {
    full: fullUrl,
    placeholder: placeholderUrl,
  };
};
