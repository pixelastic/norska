const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      grayscale: theme,
    },
  },
  plugin: {
    name: 'grayscale',
    method: plugin,
  },
};
