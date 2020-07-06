const _ = require('golgoth/lib/lodash');
const pugCloudinary = require('./cloudinary.js');
const pugImg = require('./img.js');
const pugInclude = require('./include.js');
const pugLazyload = require('./lazyload.js');
const pugMarkdown = require('./markdown.js');
const pugMixinImgHelper = require('./mixinImgHelper.js');
const pugMixinNorskaHeadHelper = require('./mixinNorskaHeadHelper.js');
const pugRemoteUrl = require('./remoteUrl.js');
const pugRevv = require('./revv.js');
const pugScreenshot = require('./screenshot.js');

/**
 * Returns an object containing custom methods to pass to every pug file
 * It must be called with the base data object to be made available in the pug
 * files as it needs to be passed down recursively to each include() call
 * @param {object} data Data object to be made available in pug files
 * @param {string} destination Path to the created file
 * @returns {object} Custom methods available in pug files
 **/
module.exports = function (data, destination) {
  const context = { data, destination };
  const methods = {
    cloudinary(url, options) {
      return pugCloudinary(url, options, context);
    },
    include: _.partialRight(pugInclude, context),
    img(url, options) {
      return pugImg(url, options, context);
    },
    lazyload(url, options) {
      return pugLazyload(url, options, context);
    },
    markdown: pugMarkdown,
    remoteUrl: _.partialRight(pugRemoteUrl, context),
    revv(filepath, options) {
      return pugRevv(filepath, options, context);
    },
    screenshot(url) {
      return pugScreenshot(url, context);
    },
    _,

    // These methods are only used in specific mixins
    mixinImgHelper: _.partialRight(pugMixinImgHelper, context),
    mixinNorskaHeadHelper: _.partialRight(pugMixinNorskaHeadHelper, context),
  };
  // We re-add methods into context so it's correctly recursively passed to each
  // method
  context.methods = methods;

  return methods;
};
