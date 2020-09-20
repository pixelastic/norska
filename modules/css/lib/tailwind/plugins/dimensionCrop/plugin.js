const generateClasses = require('../../helpers/generateClasses.js');
/**
 * Allow defining as .w-base-{size}.w-crop-{size} where it takes the whole
 * {base} minus the {crop}
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addUtilities, theme }) {
    const dimensionBase = theme('dimensionBase');
    const dimensionCrop = theme('dimensionCrop');
    const baseWidthClasses = generateClasses(
      dimensionBase,
      '.w-base-',
      (value) => {
        return {
          '--crop-width': 0,
          width: `calc(${value} - var(--crop-width))`,
        };
      }
    );
    const baseHeightClasses = generateClasses(
      dimensionBase,
      '.h-base-',
      (value) => {
        return {
          '--crop-height': 0,
          height: `calc(${value} - var(--crop-height))`,
        };
      }
    );
    const cropWidthClasses = generateClasses(
      dimensionCrop,
      '.w-crop-',
      '--crop-width'
    );
    const cropHeightClasses = generateClasses(
      dimensionCrop,
      '.h-crop-',
      '--crop-height'
    );

    const allClasses = {
      ...baseWidthClasses,
      ...baseHeightClasses,
      ...cropWidthClasses,
      ...cropHeightClasses,
    };
    addUtilities(allClasses, variants);
  };
};
