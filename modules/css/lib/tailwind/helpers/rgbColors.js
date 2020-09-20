const _ = require('golgoth/lib/lodash');
const hexToRGB = require('./hexToRGB.js');
/**
 * Converts an object of colors to their RGB values, excluding those that can't
 * be converted to RGB
 * @param {object} colors Object of colors
 * @returns {object} Same object, with colors converted to RGB
 **/
module.exports = function (colors) {
  return _.chain(colors)
    .transform((result, value, key) => {
      const rgbValue = hexToRGB(value);
      if (!rgbValue) {
        return;
      }
      result[key] = rgbValue;
    }, {})
    .value();
};
