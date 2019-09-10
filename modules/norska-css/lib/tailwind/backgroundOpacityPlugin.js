import { _ } from 'golgoth';

/**
 * Allow using .bg-opacity-1 to change the background opacity
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
        const className = `.bg-opacity-${opacityName}`;
        result[className] = {
          '--background-opacity': opacityValue,
        };
      },
      {}
    );

    addUtilities(newClasses, variants);
  };
}
