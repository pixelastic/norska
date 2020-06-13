const cloudinary = require('norska-cloudinary');
const config = require('norska-config');
const helper = require('norska-helper');
const pugRemoteUrl = require('./remoteUrl.js');

/**
 * Pass a local or remote url through the Cloudinary proxy
 * @param {string} userUrl URL or path to the image
 * @param {object} userOptions Cloudinary options. See
 * norska-frontent/lib/cloudinary/proxy for more details
 * @param {object} context Pug context: .data, .methods, .destination
 *
 * @returns {string} Final url
 **/
function pugCloudinary(userUrl, userOptions, context = {}) {
  const isRemote = userUrl.startsWith('http');
  const isProduction = helper.isProduction();

  // Pass remote urls to Cloudinary
  if (isRemote) {
    return cloudinary.proxy(userUrl, userOptions);
  }

  // Don't touch local urls in dev
  if (!isProduction) {
    return config.relativePath(context.destination, userUrl);
  }

  // Transform local path to remote urls in prod
  const remoteUrl = pugRemoteUrl(userUrl, context);
  return cloudinary.proxy(remoteUrl, userOptions);
}

module.exports = pugCloudinary;
