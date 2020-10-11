const generateClasses = require('../../helpers/generateClasses.js');
/**
 * Adds .-w-* and .-h-* classes to defined a dimension as 100% of available
 * space, minus a cropped distance
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const negativeWidth = theme('negativeWidth');
    const negativeHeight = theme('negativeHeight');

    const widthClasses = generateClasses(negativeWidth, '.-w-', (value) => {
      return {
        width: `calc(100% - ${value})`,
      };
    });
    const heightClasses = generateClasses(negativeHeight, '.-h-', (value) => {
      return {
        height: `calc(100% - ${value})`,
      };
    });

    const allClasses = {
      ...widthClasses,
      ...heightClasses,
    };
    addUtilities(allClasses, variants);
  };
};
