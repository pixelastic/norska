const _ = require('golgoth/lib/lodash');
const helper = require('norska-helper');
const config = require('norska-config');
const pugRevv = require('./revv.js');
const pugCloudinary = require('./cloudinary.js');

/**
 * Transform a local or remote path to be used as an image
 * @param {string} filepath Original path
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Final url
 **/
module.exports = function(filepath, context) {
  const isRemote = _.startsWith(filepath, 'http');
  const isDev = !helper.isProduction();

  // Remote images, passed through Cloudinary
  if (isRemote) {
    return pugCloudinary(filepath, {}, context);
  }

  // Local images in dev, return a relative path to the image
  // All paths are handled as relative to the root, except if they are
  // explicitly local (starting with a .)
  if (isDev) {
    return config.relativePath(context.destination, filepath);
  }

  // Local images in prod are revved and through Cloudinary
  const revvedPath = pugRevv(filepath, { isAbsolute: true }, context);
  const cloudinaryPath = pugCloudinary(revvedPath, {}, context);
  return cloudinaryPath;
};
