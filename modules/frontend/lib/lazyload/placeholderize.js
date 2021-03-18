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

  let options = {
    ...userOptions,
    ...placeholderOptions,
  };
  delete options.placeholder;

  // Different default options based on the service used
  const defaultWeservOptions = {
    blur: 5,
    quality: 50,
  };
  const defaultCloudinaryOptions = {
    blur: 500,
    quality: 'auto:low',
  };
  const defaultServiceOptions = options.cloudinary
    ? defaultCloudinaryOptions
    : defaultWeservOptions;

  options = {
    ...defaultServiceOptions,
    ...options,
  };

  return imageProxy(url, options);
};
