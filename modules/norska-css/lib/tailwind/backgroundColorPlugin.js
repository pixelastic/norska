import { _ } from 'golgoth';
import colors from './colorsAsRGB';

/**
 * Allow using .bg-opacity-1 to change the background opacity
 * To do so, we need to use rgba for colors and use a variable for the alpha
 * channel
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
export default function(variants) {
  return function({ addUtilities, theme }) {
    // Rewrite all bg-color classes with rgba
    let newClasses = _.transform(
      colors,
      (result, colorValue, colorName) => {
        result[`.bg-${colorName}`] = {
          backgroundColor: `rgba(${colorValue.red}, ${colorValue.green}, ${colorValue.blue}, var(--background-opacity, 1))`,
        };
      },
      {}
    );

    // Add .bg-opacity-X helpers
    const opacities = theme('opacity');
    newClasses = _.transform(
      opacities,
      (result, opacityValue, opacityName) => {
        const className = `.bg-opacity-${opacityName}`;
        result[className] = {
          '--background-opacity': opacityValue,
        };
      },
      newClasses
    );

    console.info(newClasses);
    addUtilities(newClasses, variants);
  };
}
