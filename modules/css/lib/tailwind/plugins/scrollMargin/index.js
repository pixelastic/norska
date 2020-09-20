const theme = require('../../themes/width.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      scrollMargin: theme,
    },
  },
  plugin: {
    name: 'scrollMargin',
    method: plugin,
  },
};
