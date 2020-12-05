const config = require('norska-css/lib/tailwind/index.js');
const sortKeys = require('norska-css/lib/tailwind/helpers/sortKeys.js');
const _ = require('golgoth/lodash');
module.exports = {
  testString:
    'You can cut our wings but we will always remember what it was like to fly.',
  theme(themeKey) {
    return _.chain(config)
      .get(`theme.${themeKey}`)
      .keys()
      .thru(sortKeys)
      .value();
  },
  themeWithValues(themeKey) {
    const theme = _.get(config, `theme.${themeKey}`);
    const keys = this.theme(themeKey);
    return _.transform(
      keys,
      (result, key) => {
        result.push({
          key,
          value: theme[key],
        });
      },
      []
    );
  },
  // getTheme(item) {
  // return [];
  // const theme = _.get(config, `theme.${item}`);
  // const sortedKeys = sortKeys(_.keys(theme));
  // return _.map(sortedKeys, (key) => {
  //   const value = theme[key];
  //   return { key, value };
  // });
  // },
  // getThemeKeys(item) {
  // const keys = _.keys(_.get(config, `theme.${item}`));
  // return sortKeys(keys);
  // },
  // getClasses(themeKey, prefix) {
  // const keys = this.getThemeKeys(themeKey);
  // return _.map(keys, (key) => `${prefix}-${key}`);
  // },
};
