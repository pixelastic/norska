/**
 * Add simpler ways to style bold, strike, etc
 * @returns {Function} Plugin function
 **/
export default function() {
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
    };
    addUtilities(newClasses);
  };
}
