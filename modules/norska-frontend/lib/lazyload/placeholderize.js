const proxy = require('../cloudinary/proxy');

/**
 * Define scaled down dimensions
 * We use any dimensions specified by the placeholder first
 * Otherwise we manually scale down what is passed to the main image
 * If nothing is passed, we let Cloudinary resize
 * @param {object} options Cloudinary options for the main image
 * @param {string} key Key to transform (width/height)
 * @returns {number} New dimension
 **/
function scaleDown(options, key) {
  // Specific placeholder dimensions is set, we use it
  if (options.placeholder && options.placeholder[key]) {
    return options.placeholder[key];
  }

  // No value specified, we ignore it
  const baseValue = options[key];
  if (!baseValue) {
    return false;
  }

  // Value specified, we manually divide it
  const isRelative = baseValue < 1;
  return isRelative ? (baseValue / 3).toFixed(2) : Math.floor(baseValue / 3);
}
/**
 * Returns a placeholder version of an image, to be used for lazyloading
 * @param {string} url Initial image url
 * @param {object} userOptions Cloudinary options. See
 * norska-frontent/lib/cloudinary/proxy for more details. Includes a specific
 * .placeholder key for placeholder specific arguments
 * @returns {string} Placeholder version of the image
 **/
module.exports = function(url, userOptions) {
  const placeholderOptions = userOptions.placeholder || {};

  // Get actual width and height value
  // We pass them if defined for the placeholder, or we derive them from the
  // main value. If none are set, we only set the width
  const width = scaleDown(userOptions, 'width');
  const height = scaleDown(userOptions, 'height');
  const dimensions = {};
  if (!width && !height) {
    dimensions.width = '0.33';
  }
  if (width) {
    dimensions.width = width;
  }
  if (height) {
    dimensions.height = height;
  }

  const options = {
    blur: 300,
    ...userOptions,
    quality: 10,
    ...placeholderOptions,
    ...dimensions,
    placeholder: null,
  };
  return proxy(url, options);
};
