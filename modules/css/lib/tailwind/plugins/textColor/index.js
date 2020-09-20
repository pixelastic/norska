const textColor = require('./themes/textColor.js');
const textOpacity = require('./themes/textOpacity.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      textColor,
      textOpacity,
    },
    corePlugins: {
      textColor: false,
      textOpacity: false,
    },
  },
  plugin: {
    name: 'textColor',
    method: plugin,
  },
};
