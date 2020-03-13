const frontendProxy = require('norska-frontend/lib/cloudinary/proxy');
const pugRemoteUrl = require('./remoteUrl.js');
const helper = require('norska-helper');

const frontendCloudinary = require('norska-frontend/lib/cloudinary');
const config = require('norska-config');
frontendCloudinary.init(config.get('cloudinary'));

/**
 * Pass a local or remote url through the Cloudinary proxy
 * @param {string} userUrl URL or path to the image
 * @param {object} userOptions Cloudinary options. See
 * norska-frontent/lib/cloudinary/proxy for more details
 * @param {object} context Pug context: .data, .methods, .destination
 *
 * @returns {string} Final url
 **/
function cloudinary(userUrl, userOptions, context = {}) {
  const isRemote = userUrl.startsWith('http');
  const isProduction = helper.isProduction();

  // Pass remote urls to Cloudinary
  if (isRemote) {
    return cloudinary.__frontendProxy(userUrl, userOptions);
  }

  // Don't touch local urls in dev
  if (!isProduction) {
    return userUrl;
  }

  // Transform local path to remote urls in prod
  const remoteUrl = cloudinary.__remoteUrl(userUrl, context);
  return cloudinary.__frontendProxy(remoteUrl, userOptions);
}

cloudinary.__frontendProxy = frontendProxy;
cloudinary.__remoteUrl = pugRemoteUrl;

module.exports = cloudinary;
