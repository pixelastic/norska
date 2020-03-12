/**
 * Pass a local or remote url through the Cloudinary proxy
 * @param {string} userUrl URL or path to the image
 * @param {object} userOptions Cloudinary options. See
 * norska-frontent/lib/cloudinary/proxy for more details
 *
 * @returns {string} Final url
 **/
module.exports = function(userUrl, userOptions) {
  // If remote, pass to remote method
  // If local and in prod, attempt to fix with prefix
  // Otherwise, back to initial value
};
