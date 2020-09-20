/**
 * Simplify font-weight to bold and no-bold
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const fontWeight = theme('fontWeight');
    addUtilities(fontWeight, variants);
  };
};
