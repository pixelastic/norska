const cloudinary = require('norska-cloudinary');

/**
 * Returns a placeholder version of an image, to be used for lazyloading
 * @param {string} url Initial image url
 * @param {object} userOptions Cloudinary options. See
 * norska-frontent/lib/cloudinary/proxy for more details. Includes a specific
 * .placeholder key for placeholder specific arguments
 * @returns {string} Placeholder version of the image
 **/
module.exports = function (url, userOptions = {}) {
  const placeholderOptions = userOptions.placeholder || {};

  const options = {
    blur: 300,
    ...userOptions,
    quality: 'auto:low',
    ...placeholderOptions,
  };
  return cloudinary.proxy(url, options);
};
