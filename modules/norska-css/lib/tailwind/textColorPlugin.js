import { _ } from 'golgoth';
import colors from './colors';

/**
 * Allow using .purple instead of .font-purple to color text
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
export default function(variants) {
  return function({ addUtilities }) {
    const newClasses = _.transform(
      colors,
      (result, colorValue, colorName) => {
        result[`.${colorName}`] = { color: colorValue };
      },
      {}
    );
    addUtilities(newClasses, variants);
  };
}
