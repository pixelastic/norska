const animationDelay = require('./themes/animationDelay.js');
const animationDuration = require('./themes/animationDuration.js');
const animationIterationCount = require('./themes/animationIterationCount.js');
const animationName = require('./themes/animationName.js');
const animationPlayState = require('./themes/animationPlayState.js');
const animationTimingFunction = require('./themes/animationTimingFunction.js');
const transitionDelay = require('./themes/transitionDelay.js');
const transitionDuration = require('./themes/transitionDuration.js');
const transitionProperty = require('./themes/transitionProperty.js');
const transitionTimingFunction = require('./themes/transitionTimingFunction.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      animationDelay,
      animationDuration,
      animationIterationCount,
      animationName,
      animationPlayState,
      animationTimingFunction,
      transitionDelay,
      transitionDuration,
      transitionProperty,
      transitionTimingFunction,
    },
    corePlugins: {
      transitionProperty: false,
      transitionDuration: false,
      transitionDelay: false,
      transitionTimingFunction: false,
    },
  },
  plugin: {
    name: 'animationAndTransition',
    method: plugin,
  },
};
