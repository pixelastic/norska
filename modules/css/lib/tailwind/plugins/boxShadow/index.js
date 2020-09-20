const boxShadow = require('./themes/boxShadow.js');
const boxShadowColor = require('./themes/boxShadowColor.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      boxShadow,
      boxShadowColor,
    },
    corePlugins: {
      boxShadow: false,
    },
  },
  plugin: {
    name: 'boxShadow',
    method: plugin,
  },
};
