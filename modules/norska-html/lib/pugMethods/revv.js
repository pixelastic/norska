const _ = require('golgoth/lib/lodash');
const helper = require('norska-helper');
const config = require('norska-config');
const revv = require('norska-revv');
const pugRemoteUrl = require('./remoteUrl.js');

/**
 * Mark a file for revving
 *
 * @param {string} filepath File to rev
 * @param {object} userOptions Options to alter behavior
 * - isAbsolute {boolean} Default: false. If set to true, path will be absolute
 *   from the root. Otherwise will use ../ for a relative path from the page
 *   calling it
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} {revv: path} placeholder
 */
module.exports = function (filepath, userOptions = {}, context) {
  if (!helper.isProduction()) {
    return config.relativePath(context.destination, filepath);
  }

  const options = {
    isAbsolute: false,
    ...userOptions,
  };

  const remoteUrl = pugRemoteUrl(filepath, context);
  const baseUrl = _.get(context, 'data.data.site.defaultUrl');
  const pathFromRoot = _.chain(remoteUrl)
    .replace(new RegExp(`^${baseUrl}`), '')
    .trimStart('/')
    .value();

  revv.add(pathFromRoot);

  return options.isAbsolute
    ? `{absoluteRevv: ${pathFromRoot}}`
    : `{revv: ${pathFromRoot}}`;
};
