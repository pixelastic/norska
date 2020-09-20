const generateClasses = require('../../helpers/generateClasses.js');

/**
 * Add .grid-cols-w-X classes to define grid columns by their size, and not
 * their number
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const gridColumnWidth = theme('gridColumnWidth');

    const newClasses = generateClasses(
      gridColumnWidth,
      '.grid-cols-w-',
      'grid-template-columns'
    );

    addUtilities(newClasses, variants);
  };
};
