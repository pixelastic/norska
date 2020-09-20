const bullet = require('./themes/bullet.js');
const bulletColor = require('./themes/bulletColor.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      bullet,
      bulletColor,
    },
  },
  plugin: {
    name: 'bullets',
    method: plugin,
  },
};
