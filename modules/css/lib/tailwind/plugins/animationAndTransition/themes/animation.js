module.exports = {
  none: {
    animationName: 'none',
  },
  spin: {
    animationName: 'spin',
    '--duration': '1s',
    '--timing-function': 'linear',
    '--animation-iteration-count': 'infinite',
  },
  ping: {
    animationName: 'ping',
    '--duration': '1s',
    '--timing-function': 'cubic-bezier(0, 0, 0.2, 1)',
    '--animation-iteration-count': 'infinite',
  },
  pulse: {
    animationName: 'pulse',
    '--duration': '2s',
    '--timing-function': 'cubic-bezier(0.4, 0, 0.6, 1)',
    '--animation-iteration-count': 'infinite',
  },
  bounce: {
    animationName: 'bounce',
    '--duration': '1s',
    '--animation-iteration-count': 'infinite',
  },
};
