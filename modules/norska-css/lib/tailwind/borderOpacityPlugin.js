import { _ } from 'golgoth';

/**
 * Allow using .border-opacity-1 to change the border opacity
 * To do so, we need to use rgba for colors and use a variable for the alpha
 * channel
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
export default function(variants) {
  return function({ addUtilities, theme }) {
    const opacities = theme('opacity');
    const newClasses = _.transform(
      opacities,
      (result, opacityValue, opacityName) => {
        const className = `.border-opacity-${opacityName}`;
        result[className] = {
          '--border-opacity': opacityValue,
        };
      },
      {}
    );

    addUtilities(newClasses, variants);
  };
}
