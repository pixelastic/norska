const _ = require('golgoth/lib/lodash');
const helper = require('norska-helper');
const pugRevv = require('./revv.js');
const pugCloudinary = require('./cloudinary.js');
// const path = require('path');
// const config = require('norska-config');
// const revv = require('norska-revv');

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

  // Local images in dev, passed as-is
  if (isDev) {
    return filepath;
  }

  // Local images in prod are revved and through Cloudinary
  return pugCloudinary(pugRevv(filepath, context), {}, context);
};
