/**
 * Adding missing flex box helpers from Tailwind
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const flexbox = theme('flexbox');
    addUtilities(flexbox, variants);
  };
};
