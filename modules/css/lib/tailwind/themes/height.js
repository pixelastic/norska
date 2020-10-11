/**
 * https://tailwindcss.com/docs/height/
 **/
const spacing = require('./shared/spacing.js');
const _ = require('golgoth/lib/lodash');

// Remove any value that does make sense in the context of height:
const height = _.pickBy(spacing, (value) => {
  const isCh = _.endsWith(value, 'ch');
  return !isCh;
});

module.exports = height;
