import { _ } from 'golgoth';

/**
 * Change an element to black and white only, or several degrees of grayscale
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
export default function(variants) {
  const scale = {
    0: 0,
    1: '.5',
    2: '.75',
    default: 1,
  };
  return function({ addUtilities }) {
    const newClasses = _.transform(
      scale,
      (result, value, key) => {
        let className = '.grayscale';
        if (key !== 'default') {
          className += `-${key}`;
        }
        result[className] = {
          filter: `grayscale(${value})`,
        };
      },
      {}
    );
    addUtilities(newClasses, variants);
  };
}
