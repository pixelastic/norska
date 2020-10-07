const animationIterationCount = require('./themes/animationIterationCount.js');
const animationPlayState = require('./themes/animationPlayState.js');
const animation = require('./themes/animation.js');
const delay = require('./themes/delay.js');
const duration = require('./themes/duration.js');
const keyframes = require('./themes/keyframes.js');
const timingFunction = require('./themes/timingFunction.js');
const transitionProperty = require('./themes/transitionProperty.js');
const plugin = require('./plugin.js');
module.exports = {
  config: {
    theme: {
      animationIterationCount,
      animationPlayState,
      animation,
      delay,
      duration,
      keyframes,
      timingFunction,
      transitionProperty,
    },
    corePlugins: {
      animation: false,
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
