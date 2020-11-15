const defaultTheme = require('tailwindcss/defaultConfig.js').theme;
const _ = require('golgoth/lib/lodash');
const themeConfig = require('./themes');
const pluginConfig = require('./plugins');
const config = require('norska-config');

// We only set the purge config when `config` has been initialized and all our
// paths are setup
let purge = false;
if (config.initialized) {
  purge = {
    content: [config.toPath('./**/*.html')],
    preserveHtmlElements: true,
    options: {
      keyframes: true,
    },
  };
}

const customConfig = {
  __isNorskaDefaultConfig: true,
  // Pug does not allow the ":" character in shorthand classnames
  separator: '_',
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge,
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
  // We disable some core plugins
  corePlugins: pluginConfig.corePlugins,
  // The theme key contains both the default values, plus our custom ones
  theme: {
    ...defaultTheme,
    ...themeConfig,
    ...pluginConfig.theme,
  },
};

// We also add the plugins in the format Tailwind expect
const rawPlugins = pluginConfig.plugins;
customConfig.plugins = [];
_.each(rawPlugins, (plugin) => {
  const { name, method } = plugin;
  const pluginVariants = _.get(customConfig, `variants.${name}`, []);

  customConfig.plugins.push(method(pluginVariants));
});

module.exports = customConfig;
