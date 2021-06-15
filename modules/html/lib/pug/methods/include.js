const fs = require('fs');
const nodePath = require('path');
const pug = require('pug');
const firostError = require('firost/error');
const mixins = require('../mixins/index.js');
const path = require('../../path.js');

/**
 * Workaround for Pug not having dynamic include by default
 * This will read the file in the src or theme directory and return it
 * If it's a pug file, it will even parse it
 * @param {string} filepath Path to the file to include, relative to source
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Content to include
 **/
module.exports = function (filepath, context) {
  const input = path.findFile(filepath);
  if (!input) {
    throw firostError(
      'ERROR_PUG_INCLUDE_MISSING',
      `The file ${filepath} can't be found for inclusion`
    );
  }

  const content = fs.readFileSync(input, 'utf8');
  const extname = nodePath.extname(input);
  if (extname === '.pug') {
    // We make sure we pass both the data from the parent, and this set of
    // methods recursively
    const mixinSource = mixins.getSource();
    const withMixins = `${mixinSource}\n\n${content}`;
    return pug.compile(withMixins)({ ...context.data, ...context.methods });
  }
  return content;
};
