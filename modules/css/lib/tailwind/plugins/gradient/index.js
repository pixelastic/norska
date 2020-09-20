const gradientFrom = require('./themes/gradientFrom.js');
const gradientTo = require('./themes/gradientTo.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      gradientFrom,
      gradientTo,
    },
  },
  plugin: {
    name: 'gradient',
    method: plugin,
  },
};
