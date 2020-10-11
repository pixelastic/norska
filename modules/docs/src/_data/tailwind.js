const config = require('norska-css/lib/tailwind/index.js');
console.info(config.theme.height);
const sortKeys = require('norska-css/lib/tailwind/helpers/sortKeys.js');
const _ = require('golgoth/lib/lodash');
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
  getTheme(item) {
    const theme = _.get(config, `theme.${item}`);
    const sortedKeys = sortKeys(_.keys(theme));
    return _.map(sortedKeys, (key) => {
      const value = theme[key];
      return { key, value };
    });
  },
  getThemeKeys(item) {
    const keys = _.keys(_.get(config, `theme.${item}`));
    return sortKeys(keys);
  },
  getClasses(themeKey, prefix) {
    const keys = this.getThemeKeys(themeKey);
    return _.map(keys, (key) => `${prefix}-${key}`);
  },
};
