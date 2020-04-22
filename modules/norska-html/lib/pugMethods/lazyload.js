const _ = require('golgoth/lib/lodash');
const helper = require('norska-helper');
const frontendAttributes = require('norska-frontend/lib/lazyload/attributes');
const frontendPlaceholderize = require('norska-frontend/lib/lazyload/placeholderize');
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
  const cloudinaryOptions = _.omit(options, ['disable', 'placeholder']);

  const fullUrl = pugImg(userUrl, cloudinaryOptions, context);

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
  const remoteUrl = isRemote ? userUrl : pugRemoteUrl(userUrl, context);
  const placeholderCloudinaryOptions = _.get(options, 'placeholder', {});
  const placeholderUrl = frontendPlaceholderize(
    remoteUrl,
    placeholderCloudinaryOptions
  );
  return {
    full: fullUrl,
    placeholder: placeholderUrl,
  };
}
lazyload.__frontendAttributes = frontendAttributes;
module.exports = lazyload;
