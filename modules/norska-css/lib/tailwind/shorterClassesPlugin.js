/**
 * Add simpler ways to style bold, strike, etc
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
export default function(variants) {
  return function({ addUtilities, theme }) {
    const fontWeight = theme('fontWeight');
    // Default new classes
    let newClasses = {
      '.strike': {
        textDecoration: 'line-through',
      },
      '.bold': {
        fontWeight: fontWeight.bold,
      },
      '.pointer': {
        cursor: 'pointer',
      },
    };
    addUtilities(newClasses, variants);
  };
}
