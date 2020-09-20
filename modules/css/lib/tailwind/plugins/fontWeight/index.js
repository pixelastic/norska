const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      fontWeight: theme,
    },
    corePlugins: {
      fontWeight: false,
    },
  },
  plugin: {
    name: 'fontWeight',
    method: plugin,
  },
};
