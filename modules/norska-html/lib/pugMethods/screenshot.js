const cloudinary = require('norska-cloudinary');
const _ = require('golgoth/lib/lodash');
const { URL } = require('url');
const normalizeUrl = require('firost/lib/normalizeUrl');
const pugCloudinary = require('./cloudinary');

/**
 * Returns the url of a screenshot of the current page
 *
 * @param {string} userUrl Url to take a screenshot of. Default to current page
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Final url of the image
 */
const screenshot = (userUrl, context) => {
  const pageUrl = userUrl || screenshot.currentUrl(context);
  const microlinkUrl = screenshot.microlink(pageUrl);

  // Without Cloudinary, we use the microlink url directly
  if (!screenshot.cloudinaryEnabled()) {
    return microlinkUrl;
  }

  // With Cloudinary, we add a version in the url to bypass the cache on each
  // deploy
  const revvedUrl = screenshot.revvedUrl(microlinkUrl, context);
  return pugCloudinary(revvedUrl, { width: 800 }, context);
};
/**
 * Add the last commit to the search parameters of the URL so it's cached as
 * a different resource
 * @param {string} originUrl Url to revv
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Revved url
 **/
screenshot.revvedUrl = (originUrl, context) => {
  const newUrl = new URL(originUrl);
  const gitCommit = _.get(context, 'data.runtime.gitCommit');
  newUrl.searchParams.append('norskaGitCommit', gitCommit);
  return normalizeUrl(newUrl.toString());
};
/**
 * Returns an url of a screenshot of the specified url, using microlink
 * @param {string} originUrl Webpage to take a screenshot ot
 * @returns {string} Url of the screenshot
 **/
screenshot.microlink = (originUrl) => {
  const newUrl = new URL('https://api.microlink.io/');
  newUrl.search = new URLSearchParams({
    embed: 'screenshot.url',
    meta: false,
    screenshot: true,
    url: normalizeUrl(originUrl),
  });
  return normalizeUrl(newUrl.toString());
};
/**
 * Return the complete absolute url of the current page
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Full url of the current page
 **/
screenshot.currentUrl = (context) => {
  const defaultUrl = _.get(context, 'data.data.site.defaultUrl');
  const here = _.get(context, 'data.url.here');
  return `${defaultUrl}${here}`;
};
/**
 * Check if Cloudinary is enabled
 * @returns {boolean} True if enabled, false otherwise
 **/
screenshot.cloudinaryEnabled = () => {
  return _.get(cloudinary, 'config.enable');
};
module.exports = screenshot;
