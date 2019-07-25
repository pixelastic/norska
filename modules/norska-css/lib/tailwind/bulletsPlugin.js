import { _ } from 'golgoth';

/**
 * Add numeric scale to line-height
 * @returns {Function} Plugin function
 **/
export default function() {
  const values = {
    0: 0,
    1: 1,
    2: 1.25,
    tight: 1.25,
    3: 1.375,
    4: 1.5,
    normal: 1.5,
    5: 1.625,
    6: 2,
    loose: 2,
  };
  return function({ addUtilities }) {
    const newClasses = _.transform(
      values,
      (result, value, key) => {
        result[`.lh-${key}`] = {
          lineHeight: value,
        };
      },
      {}
    );
    addUtilities(newClasses);
  };
}
