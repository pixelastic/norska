const defaultConfig = require('tailwindcss/defaultConfig.js');
const defaultTheme = defaultConfig.theme;
const _ = require('golgoth/lib/lodash');
const themeConfig = require('./themes');
const pluginConfig = require('./plugins');

const baseConfig = {
  // Pug does not allow the ":" character in shorthand classnames
  separator: '_',
  // Norska already purges the CSS, so we disable the builtin purge
  purge: false,
  variants: {
    // Base
    backgroundColor: [
      'responsive',
      'hover',
      'focus',
      'focus-within',
      'conditionals',
    ],
    backgroundOpacity: ['responsive', 'hover', 'focus', 'focus-within'],
    display: ['responsive', 'hover', 'focus', 'conditionals'],
    height: ['responsive', 'hover'],
    position: ['responsive', 'hover'],
    width: ['responsive', 'hover'],
    zIndex: ['responsive', 'hover'],
    // Custom
    animationAndTransition: ['hover', 'focus'],
    boxShadow: ['responsive', 'hover', 'focus'],
    opacity: ['responsive', 'hover', 'focus', 'focus-within', 'conditionals'],
    flexbox: ['responsive'],
    grayscale: ['hover', 'focus', 'focus-within'],
    lineHeight: ['responsive'],
    misc: ['responsive', 'hover', 'focus'],
    textColor: ['responsive', 'hover', 'focus', 'focus-within', 'conditionals'],
    textDecoration: ['responsive', 'hover', 'focus'],
  },
};

// Merge the theme and plugin configs together with the base one
const fullConfig = _.merge({}, baseConfig, themeConfig, pluginConfig);

// Adds the default theme values to the custom theme, so all keys are defined
fullConfig.theme = {
  ...defaultTheme,
  ...fullConfig.theme,
};

// At this point, the plugins are only plugin configuration objects, we need to
// call them
const rawPlugins = fullConfig.plugins;
fullConfig.plugins = [];
_.each(rawPlugins, (plugin) => {
  const { name, method } = plugin;
  const pluginVariants = _.get(fullConfig, `variants.${name}`, []);

  fullConfig.plugins.push(method(pluginVariants));
});

module.exports = fullConfig;
