import { _ } from 'golgoth';

/**
 * Allow using .text-opacity-1 to change the text opacity
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
        const className = `.text-opacity-${opacityName}`;
        result[className] = {
          '--text-opacity': opacityValue,
        };
      },
      {}
    );

    addUtilities(newClasses, variants);
  };
}
