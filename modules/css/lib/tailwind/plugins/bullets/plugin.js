const generateClasses = require('../../helpers/generateClasses.js');

/**
 * Return the class name based on the key.
 * @param {string} key Name of the bullet.
 * @returns {string} The full classname
 */
function getClassName(key) {
  return `.bullet-${key}:before`;
}

/**
 * Allow adding bullets at the start of an element using :before.
 * Also allow changing their color
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const baseClasses = generateClasses(
      theme('bullet'),
      getClassName,
      (value) => {
        return {
          content: `"${value}"`,
        };
      }
    );

    const colorClasses = generateClasses(
      theme('bulletColor'),
      getClassName,
      'color'
    );

    const allClasses = {
      ...baseClasses,
      ...colorClasses,
    };
    addUtilities(allClasses, variants);
  };
};
