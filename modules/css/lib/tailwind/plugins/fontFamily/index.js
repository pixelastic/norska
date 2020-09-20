const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      fontFamily: theme,
    },
    corePlugins: {
      fontFamily: false,
    },
  },
  plugin: {
    name: 'fontFamily',
    method: plugin,
  },
};
