const generateClasses = require('../../helpers/generateClasses.js');

/**
 * Change an element to black and white only. Also allow for more fine tuning of
 * the percentage of grayscale
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const newClasses = generateClasses(
      theme('grayscale'),
      '.grayscale-',
      (value) => {
        return {
          filter: `grayscale(${value})`,
        };
      }
    );

    addUtilities(newClasses, variants);
  };
};
