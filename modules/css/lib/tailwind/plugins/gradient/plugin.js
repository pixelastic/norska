const generateClasses = require('../../helpers/generateClasses.js');

/**
 * Allow using .bg-gradient-from-{color} and .bg-gradient-to-{color} with
 * .bg-gradient-x and .bg-gradient-y to generate gradients
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const gradientFrom = theme('gradientFrom');
    const gradientTo = theme('gradientTo');
    const baseClasses = {
      '.bg-gradient-x': {
        '--gradient-from': gradientFrom.default,
        '--gradient-to': gradientTo.default,
        backgroundImage:
          'linear-gradient(90deg, var(--gradient-from), var(--gradient-to))',
      },
      '.bg-gradient-y': {
        '--gradient-from': gradientFrom.default,
        '--gradient-to': gradientTo.default,
        backgroundImage:
          'linear-gradient(180deg, var(--gradient-from), var(--gradient-to))',
      },
    };

    const fromClasses = generateClasses(
      gradientFrom,
      '.bg-gradient-from-',
      '--gradient-from'
    );
    const toClasses = generateClasses(
      gradientTo,
      '.bg-gradient-to-',
      '--gradient-to'
    );

    const allClasses = {
      ...baseClasses,
      ...fromClasses,
      ...toClasses,
    };

    addUtilities(allClasses, variants);
  };
};
