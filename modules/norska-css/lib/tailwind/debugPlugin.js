import { _ } from 'golgoth';
import colors from './colors';

/**
 * Add nested layers of outlines when an element is marked with a .debug class
 * @returns {Function} Plugin function
 **/
export default function() {
  const debugColors = ['purple', 'pink', 'green', 'yellow', 'orange', 'red'];
  return function({ addUtilities }) {
    const newClasses = {};
    // Adding colored outlines
    _.times(debugColors.length, depth => {
      const selector = ['.debug', _.repeat('> * ', depth)].join(' ');
      const colorValue = colors[`${debugColors[depth]}-4`];
      newClasses[selector] = {
        outline: `1px solid ${colorValue}`,
      };
    });
    addUtilities(newClasses);
  };
}
