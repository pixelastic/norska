const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      conditionals: theme,
    },
  },
  plugin: {
    name: 'conditionals',
    method: plugin,
  },
};
