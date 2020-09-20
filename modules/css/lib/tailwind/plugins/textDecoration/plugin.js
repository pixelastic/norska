const generateClasses = require('../../helpers/generateClasses.js');

/**
 * Make the text-decoration property configurable, and allow changing the
 * decoration color
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const textDecoration = theme('textDecoration');
    const textDecorationColor = theme('textDecorationColor');
    const defaultColor = textDecorationColor.default;
    delete textDecorationColor.default;

    const baseClasses = generateClasses(textDecoration, '.', (value) => {
      const textDecorationValue = `${value} var(--text-decoration-color)`;
      return {
        '--text-decoration-color': defaultColor,
        textDecoration: textDecorationValue,
      };
    });

    const colorClasses = generateClasses(
      textDecorationColor,
      '.underline-',
      '--text-decoration-color'
    );

    const allClasses = {
      ...baseClasses,
      ...colorClasses,
    };
    addUtilities(allClasses, variants);
  };
};
