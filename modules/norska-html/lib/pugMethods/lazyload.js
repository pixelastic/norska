const _ = require('golgoth/lib/lodash');
const helper = require('norska-helper');
const frontendPlaceholderize = require('norska-frontend/lib/lazyload/placeholderize');
const pugRevv = require('./revv.js');
const pugImg = require('./img.js');
const pugRemoteUrl = require('./remoteUrl.js');

/**
 * Return an object of src, dataSrc, style and dataBg to use in lazyloading
 * @param {string} userUrl Path to the image
 * @param {object} userOptions
 * - disable: Force loading if set to true
 * @param {object} context Pug context: .data, .methods, .destination
 *
 * @returns {object} Attribute object
 **/
function lazyload(userUrl, userOptions, context) {
  const options = {
    disable: false,
    ...userOptions,
  };
  const isDisabled = options.disable;
  const isDev = !helper.isProduction();
  const isRemote = _.startsWith(userUrl, 'http');
  const isLocal = !isRemote;
  const imageProxyOptions = _.omit(options, ['disable', 'placeholder']);

  const fullUrl = pugImg(userUrl, imageProxyOptions, context);

  let originUrl = userUrl;
  if (isLocal) {
    const revvedUrl = pugRevv(userUrl, { isAbsolute: true }, context);
    originUrl = pugRemoteUrl(revvedUrl, context);
  }
  const placeholderUrl = frontendPlaceholderize(originUrl, options);

  // Use full url as placeholder when disabled
  if (isDisabled) {
    return { full: fullUrl, placeholder: fullUrl };
  }

  // Don't lazyload anything in dev for local images
  if (isDev && isLocal) {
    return {
      full: fullUrl,
      placeholder: fullUrl,
    };
  }

  // Local files must be made remote for placeholder generation
  return {
    full: fullUrl,
    placeholder: placeholderUrl,
  };
}
module.exports = lazyload;
