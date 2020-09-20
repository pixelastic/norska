const dimensionBase = require('./themes/dimensionBase.js');
const dimensionCrop = require('./themes/dimensionCrop.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      dimensionBase,
      dimensionCrop,
    },
  },
  plugin: {
    name: 'dimensionCrop',
    method: plugin,
  },
};
