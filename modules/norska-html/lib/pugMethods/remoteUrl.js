const _ = require('golgoth/lib/lodash');

/**
 * Returns an absolute url from a local path
 * @param {string} userPath Path to the local file
 * @param {object} context Pug context: .data, .methods, .destination
 *
 * @returns {string} Final url
 **/
function remoteUrl(userPath, context = {}) {
  const websiteUrl = _.chain(context).get('data.data.site.defaultUrl').trimEnd('/').value();
  const remotePath = _.chain(userPath).trimStart('./').value();
  return `${websiteUrl}/${remotePath}`;
}

module.exports = remoteUrl;
