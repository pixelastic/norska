const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      debug: theme,
    },
  },
  plugin: {
    name: 'debug',
    method: plugin,
  },
};
