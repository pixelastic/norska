const _ = require('golgoth/lib/lodash');
const frontendAttributes = require('norska-frontend/lib/lazyload/attributes');
const pugCloudinary = require('./cloudinary.js');

/**
 * Return an object of src, dataSrc, style and dataBg to use in lazyloading
 * @param {string} userUrl Path to the image
 * @param {object} userOptions
 * - disable: Force loading if set to true
 * @param {object} context Pug context: .data, .methods, .destination
 *
 * @returns {object} Attribute object
 **/
function lazyload(userUrl, userOptions, context) {
  const cloudinaryOptions = _.omit(userOptions, ['disable']);
  const url = pugCloudinary(userUrl, cloudinaryOptions, context);
  console.info(url);

  return lazyload.__frontendAttributes(url, userOptions);
}
lazyload.__frontendAttributes = frontendAttributes;
module.exports = lazyload;
