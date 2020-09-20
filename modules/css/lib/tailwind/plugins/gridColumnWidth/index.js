const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      gridColumnWidth: theme,
    },
  },
  plugin: {
    name: 'gridColumnWidth',
    method: plugin,
  },
};
