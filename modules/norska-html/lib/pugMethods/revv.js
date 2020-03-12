const _ = require('golgoth/lib/lodash');
const helper = require('norska-helper');
const path = require('path');
const config = require('norska-config');
const revv = require('norska-revv');

/**
 * Mark a file for revving
 * @param {string} filepath File to rev
 * @param {string} destination Path to the created file
 * @returns {string} {revv: path} placeholder
 **/
module.exports = function(filepath, destination) {
  if (!helper.isProduction()) {
    return filepath;
  }

  // Normalize the file path from the root
  // We force the removal of any starting slash to avoid people targeting
  // files outside of their repo
  const forcedRelativePath = _.trimStart(filepath, '/');
  const fullPathSourceFile = config.fromPath(destination);
  const fullPath = path.resolve(
    path.dirname(fullPathSourceFile),
    forcedRelativePath
  );
  const relativePath = path.relative(config.from(), fullPath);

  revv.add(relativePath);

  return `{revv: ${relativePath}}`;
};
