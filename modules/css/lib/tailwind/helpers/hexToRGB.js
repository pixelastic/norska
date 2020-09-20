const _ = require('golgoth/lib/lodash');
const hexToRGB = require('hex-rgb');
const __cache = {};

module.exports = function (rawHexColor) {
  const hexColor = _.toLower(rawHexColor);

  // Use cached value
  if (__cache[hexColor]) {
    return __cache[hexColor];
  }

  // Ignore non-hexadecimal colors
  if (!_.startsWith(hexColor, '#')) {
    return false;
  }

  const { red, green, blue } = hexToRGB(hexColor);
  return (__cache[hexColor] = { red, green, blue });
};
