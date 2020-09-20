const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      lineHeight: theme,
    },
    corePlugins: {
      lineHeight: false,
    },
  },
  plugin: {
    name: 'lineHeight',
    method: plugin,
  },
};
