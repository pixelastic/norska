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

  const fullUrl = pugImg(userUrl, context);

  // Use full url as placeholder when disabled
  if (isDisabled) {
    return { full: fullUrl, placeholder: fullUrl };
  }

  // Use a static spinner for local placeholder in dev
  if (isDev && isLocal) {
    return {
      full: fullUrl,
      placeholder: 'spinner.gif',
    };
  }

  // Local files must be made remote for placeholder generation
  const remoteUrl = isRemote ? userUrl : pugRemoteUrl(userUrl, context);
  const placeholderUrl = frontendPlaceholderize(remoteUrl);
  return {
    full: fullUrl,
    placeholder: placeholderUrl,
  };

  // if (is
  // return {
  //   full: "ok",
  //   placeholder: "place"
  // }
  // const cloudinaryOptions = _.omit(userOptions, ['disable']);
  // const url = pugCloudinary(userUrl, cloudinaryOptions, context);
  // // TODO: Automatically revv files when lazyloading them
  // // TODO: Automatically set a blurred version of the file as a placeholder

  // return lazyload.__frontendAttributes(url, userOptions);
}
lazyload.__frontendAttributes = frontendAttributes;
module.exports = lazyload;
