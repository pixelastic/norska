const proxy = require('../cloudinary/proxy');
/**
 * Returns a placeholder version of an image, to be used for lazyloading
 * @param {string} url Initial image url
 * @param {object} userOptions Cloudinary options. See
 * norska-frontent/lib/cloudinary/proxy for more details
 * @returns {string} Placeholder version of the image
 **/
module.exports = function(url, userOptions) {
  const options = {
    width: 0.5,
    height: 0.5,
    quality: 10,
    blur: 300,
    ...userOptions,
  };
  return proxy(url, options);
};
