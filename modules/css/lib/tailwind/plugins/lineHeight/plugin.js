const generateClasses = require('../../helpers/generateClasses.js');
/**
 * Use line-height through .lh-{size} instead of .leading-{size} classes
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const newClasses = generateClasses(
      theme('lineHeight'),
      '.lh-',
      'lineHeight'
    );
    addUtilities(newClasses, variants);
  };
};
