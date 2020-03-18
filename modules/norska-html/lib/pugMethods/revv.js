const _ = require('golgoth/lib/lodash');
const helper = require('norska-helper');
const path = require('path');
const config = require('norska-config');
const revv = require('norska-revv');

/**
 * Mark a file for revving
 * @param {string} filepath File to rev
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} {revv: path} placeholder
 **/
module.exports = function(filepath, context) {
  if (!helper.isProduction()) {
    return filepath;
  }

  // Add to manifest the path to the file, relative to the root
  const normalizedFilepath = _.trimStart(filepath, '/');

  const fromRoot = config.from();
  const destination = path.resolve(fromRoot, context.destination);
  const destinationRoot = path.dirname(destination);
  const isRelative = _.startsWith(filepath, '.');
  const baseRoot = isRelative ? destinationRoot : fromRoot;
  const fullPath = path.resolve(baseRoot, normalizedFilepath);
  const pathFromRoot = path.relative(fromRoot, fullPath);

  revv.add(pathFromRoot);

  return `{revv: ${pathFromRoot}}`;
};
