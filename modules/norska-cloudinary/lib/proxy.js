const cloudinary = require('./main.js');

/**
 * Pass an image url through the Cloudinary proxy
 * @param {string} userUrl Image url
 * @param {object} userOptions Options to transform the image
 * - width {number}
 *   Resize image to this width
 *   Can be either a number of pixels, or a ratio (number between 0 and 1)
 *   https://cloudinary.com/documentation/image_transformation_reference#width_parameter
 * - height {number}
 *   Resize image to this height
 *   Can be either a number of pixels, or a ratio (number between 0 and 1)
 *   https://cloudinary.com/documentation/image_transformation_reference#height_parameter
 * - quality {number}
 *   Reduce quality of the image, for smaller size
 *   Should be a number between 1 (lowest quality) and 100 (highest quality)
 *   https://cloudinary.com/documentation/image_transformation_reference#quality_parameter
 * - format {string}
 *   Convert file format to the best suited
 *   Either auto or png
 *   https://cloudinary.com/documentation/image_transformation_reference#fetch_format_parameter
 * - blur {number}
 *   Apply a blur effect on the image
 *   Should be a number between 1 and 2000
 *   https://cloudinary.com/documentation/image_transformation_reference#effect_parameter
 * - grayscale {boolean}
 *   Pass the image in shades of gray
 *   https://cloudinary.com/documentation/image_transformation_reference#effect_parameter
 * - pixelify {number}
 *   Force picture pixelisation
 *   Should be a number between 1 and 200
 *   https://cloudinary.com/documentation/image_transformation_reference#effect_parameter
 *
 *  @returns {string} Full url with transforms applied
 **/
const proxy = function(userUrl, userOptions = {}) {
  // Fail fast and do nothing if:
  // - Module is disabled
  // - bucketName is not defined
  // - url is already a cloudinary one
  const isDisabled = !cloudinary.config.enable;
  const hasNoBucketName = !cloudinary.config.bucketName;
  const isAlreadyCloudinary = userUrl.startsWith('https://res.cloudinary.com/');
  if (!isDisabled && hasNoBucketName) {
    proxy.__consoleWarn(
      'You tried to pass an image through Cloudinary but have no bucketName defined'
    );
  }
  if (isDisabled || hasNoBucketName || isAlreadyCloudinary) {
    return userUrl;
  }

  // Throw an error if not a remote url
  const isRemote = userUrl.startsWith('http');
  if (!isRemote) {
    const error = new Error(`URL ${userUrl} is not valid`);
    error.code = 'CLOUDINARY_PROXY_NOT_URL';
    throw error;
  }
  const bucketName = cloudinary.config.bucketName;
  const baseUrl = `https://res.cloudinary.com/${bucketName}/image/fetch/`;
  const originUrl = userUrl.replace('?', '%3F');

  const options = {
    format: 'auto', // We force to the best format available
    ...userOptions,
  };

  const availableOptions = {
    blur: 'e_blur:',
    format: 'f_',
    grayscale: 'e_grayscale',
    height: 'h_',
    opacity: 'o_',
    pixelify: 'e_pixelate:',
    quality: 'q_',
    width: 'w_',
  };

  const parsedOptions = Object.keys(options)
    .sort()
    .map(key => {
      const prefix = availableOptions[key];
      if (!prefix) {
        return false;
      }
      const value = options[key];
      // If the value is "true", we simply add the prefix
      if (value === true) {
        return prefix;
      }
      return `${prefix}${value}`;
    })
    .filter(Boolean);
  const optionsAsString = parsedOptions.length
    ? parsedOptions.join(',') + '/'
    : '';

  return `${baseUrl}${optionsAsString}${originUrl}`;
};
proxy.__consoleWarn = console.warn;
module.exports = proxy;
