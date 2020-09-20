const generateClasses = require('../../helpers/generateClasses.js');
const rgbColors = require('../../helpers/rgbColors.js');
const toStringRGB = require('../../helpers/toStringRGB.js');

/**
 * Adds .text-shadow that can be controlled with .text-shadow-{color} and
 * .text-shadow-opacity-{value}
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const textShadowColor = theme('textShadowColor');
    const textShadowOpacity = theme('textShadowOpacity');
    const defaultOpacity = textShadowOpacity.default;
    delete textShadowOpacity.default;
    const textShadow = theme('textShadow');
    const validColors = rgbColors(textShadowColor);
    const defaultColor = validColors.default;
    delete validColors.default;

    const baseClasses = generateClasses(
      textShadow,
      '.text-shadow-',
      (value) => {
        return {
          '--text-shadow-rgb': toStringRGB(defaultColor),
          '--text-shadow-opacity': defaultOpacity,
          textShadow: value,
        };
      }
    );

    const colorClasses = generateClasses(
      validColors,
      '.text-shadow-',
      (value) => {
        return {
          '--text-shadow-rgb': toStringRGB(value),
        };
      }
    );

    const opacityClasses = generateClasses(
      textShadowOpacity,
      '.text-shadow-opacity-',
      '--text-shadow-opacity'
    );

    const allClasses = {
      ...baseClasses,
      ...colorClasses,
      ...opacityClasses,
    };

    addUtilities(allClasses, variants);
  };
};
