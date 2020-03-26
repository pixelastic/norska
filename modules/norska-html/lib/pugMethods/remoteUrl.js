const _ = require('golgoth/lib/lodash');
const config = require('norska-config');
const path = require('path');

/**
 * Returns an absolute url from a local path
 *
 * @param {string} rawPath Path to the local file
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Final url
 */
function remoteUrl(rawPath, context = {}) {
  const rawDefaultUrl = _.get(context, 'data.data.site.defaultUrl');
  const defaultUrl = _.trimEnd(rawDefaultUrl, '/');
  let targetPath = _.trimStart(rawPath, '/');

  const isRelativeToSubFolder = _.startsWith(targetPath, '.');
  if (isRelativeToSubFolder) {
    const destinationFolder = path.dirname(config.toPath(context.destination));
    const absolutePath = path.resolve(destinationFolder, targetPath);
    targetPath = path.relative(config.to(), absolutePath);
  }

  return `${defaultUrl}/${targetPath}`;
}

module.exports = remoteUrl;
