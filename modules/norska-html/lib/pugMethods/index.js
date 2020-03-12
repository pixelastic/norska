const _ = require('golgoth/lib/lodash');
const pugMarkdown = require('./markdown.js');
const pugRemoteUrl = require('./remoteUrl.js');
const pugRevv = require('./revv.js');
const pugInclude = require('./include.js');
const pugCloudinary = require('./cloudinary.js');
const pugLazyload = require('./lazyload.js');

/**
 * Returns an object containing custom methods to pass to every pug file
 * It must be called with the base data object to be made available in the pug
 * files as it needs to be passed down recursively to each include() call
 * @param {object} data Data object to be made available in pug files
 * @param {string} destination Path to the created file
 * @returns {object} Custom methods available in pug files
 **/
module.exports = function(data, destination) {
  const context = { data, destination };
  const methods = {
    _,
    markdown: pugMarkdown,
    remoteUrl: _.partialRight(pugRemoteUrl, context),
    lazyload: _.partialRight(pugLazyload, context),
    cloudinary: _.partialRight(pugCloudinary, context),
    include: _.partialRight(pugInclude, context),
    revv: _.partialRight(pugRevv, context),
  };
  // We re-add methods into context so it's correctly recursively passed to each
  // method
  context.methods = methods;

  return methods;
};
