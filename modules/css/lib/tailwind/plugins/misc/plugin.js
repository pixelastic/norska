/**
 * Add a few simpler classes that do not fit in any other plugin
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const misc = theme('misc');
    addUtilities(misc, variants);
  };
};
