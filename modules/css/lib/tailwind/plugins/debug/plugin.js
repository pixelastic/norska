const _ = require('golgoth/lib/lodash');
const generateClasses = require('../../helpers/generateClasses.js');
/**
 * Add nested layers of outlines when an element is marked with a .debug class
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const newClasses = generateClasses(
      theme('debug'),
      (key) => {
        return ['.debug', _.repeat('> * ', key)].join(' ');
      },
      (value) => {
        return {
          outline: `1px solid ${value}`,
        };
      }
    );
    addUtilities(newClasses, variants);
  };
};
