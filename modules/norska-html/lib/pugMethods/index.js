const _ = require('golgoth/lib/lodash');
const pugMarkdown = require('./markdown.js');
const pugRevv = require('./revv.js');
const pugInclude = require('./include.js');
const frontendLazyloadAttributes = require('norska-frontend/lib/lazyload/attributes');
const frontendCloudinaryProxy = require('norska-frontend/lib/cloudinary/proxy');

/**
 * Returns an object containing custom methods to pass to every pug file
 * It must be called with the base data object to be made available in the pug
 * files as it needs to be passed down recursively to each include() call
 * @param {object} data Data object to be made available in pug files
 * @param {string} destination Path to the created file
 * @returns {object} Custom methods available in pug files
 **/
module.exports = function(data, destination) {
  const methods = {
    _,
    markdown: pugMarkdown,
    lazyload: frontendLazyloadAttributes,
    cloudinary: frontendCloudinaryProxy,
    include(filepath) {
      return pugInclude(filepath, data, methods);
    },
    revv(filepath) {
      return pugRevv(filepath, destination);
    },
  };

  return methods;
};
