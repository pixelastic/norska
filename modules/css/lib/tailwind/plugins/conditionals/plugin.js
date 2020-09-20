const _ = require('golgoth/lib/lodash');

/**
 * Set .if to a checkbox and .then_bg-red to another element and the element
 * will be red only when the checkbox is checked
 * Also works with radio button
 * @returns {Function} Plugin function
 **/
module.exports = function () {
  return function ({ addVariant, theme }) {
    const conditionals = theme('conditionals');

    addVariant('conditionals', ({ modifySelectors, separator }) => {
      _.each(conditionals, (thenClass, ifClass) => {
        modifySelectors(({ className }) => {
          const siblingSelector = `.${ifClass}:checked ~ .${thenClass}${separator}${className}`;
          const siblingChildrenSelector = `.${ifClass}:checked ~ * .${thenClass}${separator}${className}`;
          return `${siblingSelector}, ${siblingChildrenSelector}`;
        });
      });
    });
  };
};
