/**
 * https://tailwindcss.com/docs/border-width/
 *
 * Uses the default spacing scale as a basis, but excludes values where units
 * does not make sense in the context of borders: percentage, vh, vw, auto
 **/
const spacing = require('./shared/spacing.js');
const _ = require('golgoth/lib/lodash');

const borderWidth = _.pickBy(spacing, (value, key) => {
  const isPercentage = _.includes(value, '%');
  const isVh = _.endsWith(value, 'vh');
  const isVw = _.endsWith(value, 'vw');
  const isAuto = key === 'auto';
  return !isPercentage && !isVh && !isVw && !isAuto;
});

module.exports = borderWidth;
