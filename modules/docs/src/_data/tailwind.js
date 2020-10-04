const config = require('norska-css/lib/tailwind/index.js');
const sortKeys = require('norska-css/lib/tailwind/helpers/sortKeys.js');
const _ = require('golgoth/lib/lodash');
module.exports = {
  links: [
    {
      groupName: 'Animations',
      items: [
        { url: 'animations', name: 'Animations' },
        { url: 'transitions', name: 'Transitions' },
        { url: 'delays', name: 'Delays' },
        { url: 'durations', name: 'Durations' },
        { url: 'ease', name: 'Timing functions' },
      ],
    },
    {
      groupName: 'Backgrounds',
      items: [
        { url: 'background-color', name: 'Background color' },
        { url: 'background-opacity', name: 'Background opacity' },
      ],
    },
    {
      groupName: 'Borders',
      items: [
        { url: 'border-color', name: 'Borders color' },
        { url: 'border-radius', name: 'Borders radius' },
      ],
    },
    {
      groupName: 'Dimensions',
      items: [
        { url: 'spacing', name: 'Spacing scale' },
        { url: 'base-crop', name: 'Base cropping' },
        { url: 'scroll-margin', name: 'Scroll Margin' },
      ],
    },
    {
      groupName: 'Effects',
      items: [
        { url: 'box-shadow', name: 'Box shadows' },
        { url: 'opacity', name: 'Opacity' },
        { url: 'rotate', name: 'Rotate' },
        { url: 'scale', name: 'Scale' },
      ],
    },
    {
      groupName: 'Helpers',
      items: [
        { url: 'bullets', name: 'Bullets' },
        { url: 'conditionals', name: 'Conditionals' },
        { url: 'debug', name: 'Debug' },
        { url: 'flexbox', name: 'Flexbox' },
        { url: 'misc', name: 'Misc' },
      ],
    },
    {
      groupName: 'Grid',
      items: [{ url: 'grid-column-width', name: 'Column Width' }],
    },
    {
      groupName: 'Positioning',
      items: [
        { url: 'absolute', name: 'Absolute' },
        { url: 'position-hover', name: 'Hover' },
        { url: 'z-index', name: 'Z-index' },
        { url: 'z-index-hover', name: 'Z-index hover' },
      ],
    },
    {
      groupName: 'Text',
      items: [
        { url: 'font-families', name: 'Font families' },
        { url: 'font-sizes', name: 'Font size' },
        { url: 'font-weight', name: 'Font weight' },
        { url: 'line-height', name: 'Line height' },
        { url: 'text-color', name: 'Text color' },
        { url: 'text-decoration', name: 'Text decoration' },
        { url: 'text-decoration-hover', name: 'Text decoration Hover' },
        { url: 'text-opacity', name: 'Text opacity' },
        { url: 'text-shadow', name: 'Text shadow' },
      ],
    },
  ],
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
