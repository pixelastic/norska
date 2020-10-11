const negativeWidth = require('./themes/negativeWidth.js');
const negativeHeight = require('./themes/negativeHeight.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      negativeWidth,
      negativeHeight,
    },
  },
  plugin: {
    name: 'negativeDimensions',
    method: plugin,
  },
};
