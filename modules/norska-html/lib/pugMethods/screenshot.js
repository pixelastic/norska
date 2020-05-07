const _ = require('golgoth/lib/lodash');
const pugCloudinary = require('./cloudinary');

/**
 * Returns the url of a screenshot of the current page
 *
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Final url of the image
 */
module.exports = function(context) {
  // Get calling url
  const defaultUrl = _.get(context, 'data.data.site.defaultUrl');
  const urlHere = _.get(context, 'data.url.here');
  const fullUrl = `${defaultUrl}${urlHere}`;

  // Build microlink screenshot link
  const microlinkOptions = {
    url: fullUrl,
    screenshot: true,
    meta: false,
    embed: 'screenshot.url',
  };
  const microlinkQueryString = _.chain(microlinkOptions)
    .map((value, key) => {
      return `${key}=${value}`;
    })
    .sort()
    .join('&')
    .value();
  const microlinkUrl = `https://api.microlink.io/?${microlinkQueryString}`;

  // If Cloudinary is configured, we pass the url through it, otherwise we stay
  // with the direct microlink url
  try {
    return pugCloudinary(microlinkUrl, { width: 800 }, context);
  } catch (_err) {
    return microlinkUrl;
  }
};
