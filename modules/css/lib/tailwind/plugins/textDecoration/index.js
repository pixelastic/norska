const textDecoration = require('./themes/textDecoration.js');
const textDecorationColor = require('./themes/textDecorationColor.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      textDecoration,
      textDecorationColor,
    },
    corePlugins: {
      textDecoration: false,
    },
  },
  plugin: {
    name: 'textDecoration',
    method: plugin,
  },
};
