const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      flexbox: theme,
    },
  },
  plugin: {
    name: 'flexbox',
    method: plugin,
  },
};
