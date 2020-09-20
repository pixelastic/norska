const theme = require('./theme.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      misc: theme,
    },
  },
  plugin: {
    name: 'misc',
    method: plugin,
  },
};
