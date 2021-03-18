const cloudinary = require('./services/cloudinary.js');
const weserv = require('./services/weserv.js');
/**
 * Pass an image url through the image proxy
 * @param {string} url Image url
 * @param {object} options Options to transform the image.
 * @param {string} options.service Name of the image proxy service to use,
 * defaults to weserv
 * @returns {string} Full url with transforms applied
 **/
module.exports = function (url, options = {}) {
  if (options.cloudinary) {
    const cloudinaryOptions = {
      bucketName: options.cloudinary,
      ...options,
    };
    delete cloudinaryOptions.cloudinary;
    return cloudinary(url, cloudinaryOptions);
  }

  return weserv(url, options);
};
