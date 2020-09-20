const generateClasses = require('../../helpers/generateClasses.js');

/**
 * Add .scroll-mt-X classes to add a scroll margin to prevent elements from
 * being hidden behind a fixed header
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const scrollMargin = theme('scrollMargin');

    const newClasses = generateClasses(
      scrollMargin,
      '.scroll-mt-',
      'scroll-margin-top'
    );

    addUtilities(newClasses, variants);
  };
};
