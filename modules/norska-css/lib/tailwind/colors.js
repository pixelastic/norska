import defaultTheme from 'tailwindcss/defaultTheme';
import { _ } from 'golgoth';
import flatten from 'flat';

const flattenColors = flatten(defaultTheme.colors, { delimiter: '-' });
const colors = _.chain(flattenColors)
  // Replace color-X00 with color-X
  .mapKeys((_value, key) => {
    return _.endsWith(key, '00') ? _.replace(key, '00', '') : key;
  })
  // Set default colors to the -6 tone
  .thru(colors => {
    const defaultValues = _.chain(colors)
      .keys()
      .filter(shadeName => {
        return _.endsWith(shadeName, '-6');
      })
      .transform((result, shadeName) => {
        const colorName = _.replace(shadeName, '-6', '');
        result[colorName] = colors[shadeName];
      }, {})
      .value();
    return {
      ...defaultValues,
      ...colors,
    };
  })
  .value();

export default colors;
