const proxy = require('../cloudinary/proxy');
/**
 * Returns a placeholder version of an image, to be used for lazyloading
 * @param {string} url Initial image url
 * @returns {string} Placeholder version of the image
 **/
module.exports = function(url) {
  const options = {
    width: 0.5,
    height: 0.5,
    quality: 10,
    blur: 300,
  };
  return proxy(url, options);
};
