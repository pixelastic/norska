/**
 * https://tailwindcss.com/docs/top-right-bottom-left/
 *
 * Use the default spacing scale, but also adds negative values
 **/
const spacing = require('./shared/spacing.js');
const _ = require('golgoth/lib/lodash');

// Use same scale as default spacing, but also add negative values
const inset = _.transform(
  spacing,
  (result, value, key) => {
    result[`-${key}`] = `-${value}`;
  },
  { ...spacing }
);
module.exports = inset;
