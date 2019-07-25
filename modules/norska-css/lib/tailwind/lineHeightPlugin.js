import { _ } from 'golgoth';
import colors from './colors';

/**
 * Add colored bullets
 * @returns {Function} Plugin function
 **/
export default function() {
  return function({ addUtilities }) {
    const newClasses = {
      '.bullet:before': { content: '"• "' },
      '.bullet-arrow:before': { content: '"> "' },
      '.bullet-cross:before': { content: '"✗ "' },
      '.bullet-tick:before': { content: '"✓ "' },
    };
    // Add numbered bullets
    _.times(10, index => {
      newClasses[`.bullet-${index}:before`] = {
        content: `"${index}. "`,
      };
    });
    // Colored bullets
    _.each(colors, (value, colorName) => {
      newClasses[`.bullet-${colorName}:before`] = {
        color: value,
      };
    });
    addUtilities(newClasses);
  };
}
