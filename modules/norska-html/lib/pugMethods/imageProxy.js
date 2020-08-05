const imageProxy = require('norska-image-proxy');
const config = require('norska-config');
const helper = require('norska-helper');
const pugRemoteUrl = require('./remoteUrl.js');

/**
 * Pass a local or remote url through the image proxu
 * @param {string} userUrl URL or path to the image
 * @param {object} userOptions Image proxy option. See norska-image-proxy for more details
 * @param {object} context Pug context: .data, .methods, .destination
 *
 * @returns {string} Final url
 **/
function pugImageProxy(userUrl, userOptions, context = {}) {
  const isRemote = userUrl.startsWith('http');
  const isProduction = helper.isProduction();

  // Pass remote urls to the image proxy
  if (isRemote) {
    return imageProxy(userUrl, userOptions);
  }

  // Don't touch local urls in dev
  if (!isProduction) {
    return config.relativePath(context.destination, userUrl);
  }

  // Transform local path to remote urls in prod
  const remoteUrl = pugRemoteUrl(userUrl, context);
  return imageProxy(remoteUrl, userOptions);
}

module.exports = pugImageProxy;
