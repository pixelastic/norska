const _ = require('golgoth/lodash');
const generateClasses = require('../../helpers/generateClasses.js');

/**
 * Returns the classes relative to the animations
 * @param {object} Object of plugin methods (see https://tailwindcss.com/docs/plugins/#app for details)
 * @param {Function} Object.theme for looking up values in the user's theme configuration
 * @param {Function} Object.addBase for registering new base styles
 * @returns {object} Object of classes
 */
function generateAnimationClasses({ theme, addBase }) {
  // Define the animation @keyframes
  const keyframes = theme('keyframes');
  const baseKeyframes = _.transform(
    keyframes,
    (result, value, key) => {
      result[`@keyframes ${key}`] = value;
    },
    {}
  );
  addBase(baseKeyframes);

  // Define the .animate-{name}
  const animation = theme('animation');
  const animationDelay = theme('delay');
  const animationDuration = theme('duration');
  const animationIterationCount = theme('animationIterationCount');
  const animationPlayState = theme('animationPlayState');
  const animationTimingFunction = theme('timingFunction');
  const defaultProperties = {
    '--delay': animationDelay.default,
    '--duration': animationDuration.default,
    '--animation-iteration-count': animationIterationCount.default,
    '--animation-play-state': animationPlayState.default,
    '--timing-function': animationTimingFunction.default,
    animationDelay: 'var(--delay)',
    animationDuration: 'var(--duration)',
    animationIterationCount: 'var(--animation-iteration-count)',
    animationPlayState: 'var(--animation-play-state)',
    animationTimingFunction: 'var(--timing-function)',
  };

  const animationNameClasses = generateClasses(
    animation,
    '.animate-',
    (value) => {
      return {
        ...defaultProperties,
        ...value,
      };
    }
  );
  const animationLoopClasses = generateClasses(
    animationIterationCount,
    '.loop-',
    '--animation-iteration-count'
  );
  const animationPlayStateClasses = generateClasses(
    animationPlayState,
    '.animate-',
    '--animation-play-state'
  );

  return {
    ...animationNameClasses,
    ...animationLoopClasses,
    ...animationPlayStateClasses,
  };
}
/**
 * Returns the classes relative to the transitions
 * @param {object} Object of plugin methods (see https://tailwindcss.com/docs/plugins/#app for details)
 * @param {Function} Object.theme for looking up values in the user's theme configuration
 * @returns {object} Object of classes
 */
function generateTransitionClasses({ theme }) {
  const transitionDelay = theme('delay');
  const transitionDuration = theme('duration');
  const transitionProperty = theme('transitionProperty');
  const transitionTimingFunction = theme('timingFunction');

  const defaultProperties = {
    '--delay': transitionDelay.default,
    '--duration': transitionDuration.default,
    '--timing-function': transitionTimingFunction.default,
    transitionDelay: 'var(--delay)',
    transitionDuration: 'var(--duration)',
    transitionTimingFunction: 'var(--timing-function)',
  };
  const transitionPropertyClasses = generateClasses(
    transitionProperty,
    '.transition-',
    (value) => {
      return {
        ...defaultProperties,
        transitionProperty: value,
      };
    }
  );

  return transitionPropertyClasses;
}
/**
 * Returns the classes shared between animation and transitions
 * @param {object} Object of plugin methods (see https://tailwindcss.com/docs/plugins/#app for details)
 * @param {Function} Object.theme for looking up values in the user's theme configuration
 * @returns {object} Object of classes
 */
function generateSharedClasses({ theme }) {
  const delay = theme('delay');
  const duration = theme('duration');
  const timingFunction = theme('timingFunction');

  const delayClasses = generateClasses(delay, '.delay-', '--delay');
  const durationClasses = generateClasses(duration, '.duration-', '--duration');
  const easeClasses = generateClasses(
    timingFunction,
    '.ease-',
    '--timing-function'
  );

  return {
    ...delayClasses,
    ...durationClasses,
    ...easeClasses,
  };
}
/**
 * Enhance default transitions with a default duration, delay and easing
 * Enable support for animations with loop and play state
 * Shares duration, delay and easing classes between the two
 * @param {Array} variants Tailwind potential variants
 * @returns {Function} Plugin function
 **/
module.exports = function (variants) {
  return function ({ addBase, addUtilities, theme }) {
    const animationClasses = generateAnimationClasses({ addBase, theme });
    const transitionClasses = generateTransitionClasses({ theme });
    const sharedClasses = generateSharedClasses({ theme });

    const allClasses = {
      ...animationClasses,
      ...transitionClasses,
      ...sharedClasses,
    };

    addUtilities(allClasses, variants);
  };
};
