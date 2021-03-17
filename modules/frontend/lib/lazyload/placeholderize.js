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

  // Different default options based on the service used
  const weservOptions = {
    blur: 5,
    quality: 50,
  };
  const cloudinaryOptions = {
    blur: 300,
    quality: 'auto:low',
  };
  const defaultOptions = placeholderOptions.cloudinary
    ? cloudinaryOptions
    : weservOptions;

  const options = {
    ...defaultOptions,
    ...userOptions,
    ...placeholderOptions,
  };
  delete options.placeholder;
  return imageProxy(url, options);
};
