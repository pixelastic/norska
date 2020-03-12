const config = require('norska-config');
const fs = require('fs');
const path = require('path');
const pug = require('pug');

/**
 * Workaround for Pug not having dynamic include by default
 * This will read the file in the src directory and return it
 * If it's a pug file, it will even parse it
 * @param {string} filepath Path to the file to include, relative to source
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Content to include
 **/
module.exports = function(filepath, context) {
  const input = config.fromPath(filepath);
  if (!fs.existsSync(input)) {
    return `ERROR: ${input} does not exist`;
  }

  const content = fs.readFileSync(input, 'utf8');
  const extname = path.extname(input);
  if (extname === '.pug') {
    // We make sure we pass both the data from the parent, and this set of
    // methods recursively
    return pug.compile(content)({ ...context.data, ...context.methods });
  }
  return content;
};
