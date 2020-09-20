const _ = require('golgoth/lib/lodash');
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
  const animationName = theme('animationName');
  const keyframes = _.transform(
    animationName,
    (result, value, key) => {
      result[`@keyframes ${key}`] = value;
    },
    {}
  );
  addBase(keyframes);

  // Define the .animation-{name}
  const animationDelay = theme('animationDelay');
  const animationDuration = theme('animationDuration');
  const animationIterationCount = theme('animationIterationCount');
  const animationPlayState = theme('animationPlayState');
  const animationTimingFunction = theme('animationTimingFunction');
  const defaultProperties = {
    '--animation-delay': animationDelay.default,
    '--animation-duration': animationDuration.default,
    '--animation-iteration-count': animationIterationCount.default,
    '--animation-play-state': animationPlayState.default,
    '--animation-timing-function': animationTimingFunction.default,
    animationDelay: 'var(--animation-delay)',
    animationDuration: 'var(--animation-duration)',
    animationIterationCount: 'var(--animation-iteration-count)',
    animationPlayState: 'var(--animation-play-state)',
    animationTimingFunction: 'var(--animation-timing-function)',
  };

  const animationNameClasses = generateClasses(
    animationName,
    '.animation-',
    (value, key) => {
      return {
        ...defaultProperties,
        animationName: key,
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
    '.animation-',
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
  const transitionDelay = theme('transitionDelay');
  const transitionDuration = theme('transitionDuration');
  const transitionProperty = theme('transitionProperty');
  const transitionTimingFunction = theme('transitionTimingFunction');

  const defaultProperties = {
    '--transition-delay': transitionDelay.default,
    '--transition-duration': transitionDuration.default,
    '--transition-timing-function': transitionTimingFunction.default,
    transitionDelay: 'var(--transition-delay)',
    transitionDuration: 'var(--transition-duration)',
    transitionTimingFunction: 'var(--transition-timing-function)',
  };
  const transitionPropertyClasses = generateClasses(
    transitionProperty,
    '.transition-',
    (value, _key) => {
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
  const animationDelay = theme('animationDelay');
  const animationDuration = theme('animationDuration');
  const animationTimingFunction = theme('animationTimingFunction');
  const transitionDelay = theme('transitionDelay');
  const transitionDuration = theme('transitionDuration');
  const transitionTimingFunction = theme('transitionTimingFunction');

  const allDelays = { ...animationDelay, ...transitionDelay };
  const delayClasses = generateClasses(allDelays, '.delay-', (value, key) => {
    return {
      '--animation-delay': animationDelay[key],
      '--transition-delay': transitionDelay[key],
    };
  });

  const allDurations = { ...animationDuration, ...transitionDuration };
  const durationClasses = generateClasses(
    allDurations,
    '.duration-',
    (value, key) => {
      return {
        '--animation-duration': animationDuration[key],
        '--transition-duration': transitionDuration[key],
      };
    }
  );

  const allTimingFunctions = {
    ...animationTimingFunction,
    ...transitionTimingFunction,
  };
  const easeClasses = generateClasses(
    allTimingFunctions,
    '.ease-',
    (value, key) => {
      return {
        '--animation-timing-function': animationTimingFunction[key],
        '--transition-timing-function': transitionTimingFunction[key],
      };
    }
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
