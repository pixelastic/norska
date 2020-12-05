const rgbColors = require('../../helpers/rgbColors.js');
const generateClasses = require('../../helpers/generateClasses.js');
const _ = require('golgoth/lodash');

/**
 * Allow using .purple instead of .font-purple to color text
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const textColor = theme('textColor');
    const validColors = rgbColors(textColor);
    const textOpacity = theme('textOpacity');

    const baseClasses = generateClasses(validColors, '.', (value) => {
      const { red, green, blue } = value;
      const rgbaColorValue = `rgba(${red}, ${green}, ${blue}, var(--text-opacity))`;
      return {
        '--text-opacity': textOpacity.default,
        color: rgbaColorValue,
      };
    });

    const opacityClasses = generateClasses(
      textOpacity,
      '.text-opacity-',
      '--text-opacity'
    );

    const rawKeys = _.difference(_.keys(textColor), _.keys(validColors));
    const rawClasses = _.transform(
      rawKeys,
      (result, key) => {
        result[`.${key}`] = {
          color: textColor[key],
        };
      },
      {}
    );

    const allClasses = {
      ...baseClasses,
      ...opacityClasses,
      ...rawClasses,
    };
    addUtilities(allClasses, variants);
  };
};
