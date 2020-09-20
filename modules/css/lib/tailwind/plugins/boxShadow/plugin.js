const generateClasses = require('../../helpers/generateClasses.js');
const rgbColors = require('../../helpers/rgbColors.js');
const toStringRGB = require('../../helpers/toStringRGB.js');

/**
 * Allow changing the color of a shadow with .box-shadow-red
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const boxShadow = theme('boxShadow');
    const boxShadowColor = theme('boxShadowColor');
    const validColors = rgbColors(boxShadowColor);
    const defaultColor = validColors.default;
    delete validColors.default;

    const baseClasses = generateClasses(boxShadow, '.shadow-', (value) => {
      return {
        '--box-shadow-rgb': toStringRGB(defaultColor),
        boxShadow: value,
      };
    });

    const colorClasses = generateClasses(validColors, '.shadow-', (value) => {
      return {
        '--box-shadow-rgb': toStringRGB(value),
      };
    });

    const allClasses = {
      ...baseClasses,
      ...colorClasses,
    };

    addUtilities(allClasses, variants);
  };
};
