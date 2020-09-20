const _ = require('golgoth/lib/lodash');
const defaultConfig = require('tailwindcss/defaultConfig.js');
const defaultScale = defaultConfig.theme.scale;

/**
 * Same as the default scale provided by Tailwind but adds a "p" at the end of
 * the values for consistency.
 * .scale-100 is now .scale-100p
 **/
module.exports = _.transform(
  defaultScale,
  (result, value, key) => {
    result[`${key}p`] = value;
  },
  {}
);
