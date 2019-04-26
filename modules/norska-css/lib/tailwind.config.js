/* eslint-disable import/no-commonjs */
const _ = require('golgoth').lodash;
const norskaConfig = require('norska-config').default;
const userConfigHook = norskaConfig.get('css.tailwind.configHook');

const colors = {
  transparent: 'transparent',
  inherit: 'inherit',

  white: '#ffffff',
  'white-10': 'rgba(255, 255, 255, .10)',
  'white-25': 'rgba(255, 255, 255, .25)',
  'white-50': 'rgba(255, 255, 255, .50)',
  'white-65': 'rgba(255, 255, 255, .65)',
  'white-75': 'rgba(255, 255, 255, .75)',
  'white-90': 'rgba(255, 255, 255, .90)',

  black: '#22292f',
  'black-pure': '#000',
  'black-10': 'rgba(0, 0, 0, .10)',
  'black-25': 'rgba(0, 0, 0, .25)',
  'black-50': 'rgba(0, 0, 0, .50)',
  'black-65': 'rgba(0, 0, 0, .65)',
  'black-75': 'rgba(0, 0, 0, .75)',
  'black-90': 'rgba(0, 0, 0, .90)',

  'grey-darkest': '#3d4852',
  'grey-darker': '#606f7b',
  'grey-dark': '#8795a1',
  grey: '#b8c2cc',
  'grey-light': '#dae1e7',
  'grey-lighter': '#f1f5f8',
  'grey-lightest': '#f8fafc',

  'red-darkest': '#3b0d0c',
  'red-darker': '#621b18',
  'red-dark': '#cc1f1a',
  red: '#e3342f',
  'red-light': '#ef5753',
  'red-lighter': '#f9acaa',
  'red-lightest': '#fcebea',

  'orange-darkest': '#462a16',
  'orange-darker': '#613b1f',
  'orange-dark': '#de751f',
  orange: '#f6993f',
  'orange-light': '#faad63',
  'orange-lighter': '#fcd9b6',
  'orange-lightest': '#fff5eb',

  'yellow-darkest': '#453411',
  'yellow-darker': '#684f1d',
  'yellow-dark': '#f2d024',
  yellow: '#ffed4a',
  'yellow-light': '#fff382',
  'yellow-lighter': '#fff9c2',
  'yellow-lightest': '#fcfbeb',

  'green-darkest': '#0f2f21',
  'green-darker': '#1a4731',
  'green-dark': '#1f9d55',
  green: '#38c172',
  'green-light': '#51d88a',
  'green-lighter': '#a2f5bf',
  'green-lightest': '#e3fcec',

  'teal-darkest': '#0d3331',
  'teal-darker': '#20504f',
  'teal-dark': '#38a89d',
  teal: '#4dc0b5',
  'teal-light': '#64d5ca',
  'teal-lighter': '#a0f0ed',
  'teal-lightest': '#e8fffe',

  'blue-darkest': '#12283a',
  'blue-darker': '#1c3d5a',
  'blue-dark': '#2779bd',
  blue: '#3490dc',
  'blue-light': '#6cb2eb',
  'blue-lighter': '#bcdefa',
  'blue-lightest': '#eff8ff',

  'indigo-darkest': '#191e38',
  'indigo-darker': '#2f365f',
  'indigo-dark': '#5661b3',
  indigo: '#6574cd',
  'indigo-light': '#7886d7',
  'indigo-lighter': '#b2b7ff',
  'indigo-lightest': '#e6e8ff',

  'purple-darkest': '#21183c',
  'purple-darker': '#382b5f',
  'purple-dark': '#794acf',
  purple: '#9561e2',
  'purple-light': '#a779e9',
  'purple-lighter': '#d6bbfc',
  'purple-lightest': '#f3ebff',

  'pink-darkest': '#451225',
  'pink-darker': '#6f213f',
  'pink-dark': '#eb5286',
  pink: '#f66d9b',
  'pink-light': '#fa7ea8',
  'pink-lighter': '#ffbbca',
  'pink-lightest': '#ffebef',
};

const dimensionScale = {
  auto: 'auto',
  '0': '0',
  '1': '1rem',
  '1x': '1.5rem',
  '2': '2rem',
  '2x': '3rem',
  '3': '4rem',
  '3x': '6rem',
  '4': '8rem',
  '4x': '12rem',
  '5': '16rem',
  '10': '10%',
  '15': '15%',
  '20': '20%',
  '25': '25%',
  '30': '30%',
  '33': 'calc(100% / 3)',
  '40': '40%',
  '50': '50%',
  '60': '60%',
  '66': 'calc(100% / 1.5)',
  '70': '70%',
  '75': '75%',
  '80': '80%',
  '90': '90%',
  '100': '100%',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
};

const widthScale = {
  ...dimensionScale,
  '100vw': '100vw',
};
const heightScale = {
  ...dimensionScale,
  '100vh': '100vh',
};
const backgroundScale = {
  ...dimensionScale,
  auto: 'auto',
  cover: 'cover',
  contain: 'contain',
};

const spacingScale = {
  '0': '0',
  '0x': '.25rem',
  '05': '.5rem',
  '05x': '.75rem',
  '1': '1rem',
  '1x': '1.5rem',
  '2': '2rem',
  '2x': '3rem',
  '3': '4rem',
  '3x': '6rem',
  '4': '8rem',
  '4x': '12rem',
  '5': '16rem',
  '10': '10%',
  '20': '20%',
  '25': '25%',
  '30': '30%',
  '33': 'calc(100% / 3)',
  '40': '40%',
  '50': '50%',
  '60': '60%',
  '66': 'calc(100% / 1.5)',
  '70': '70%',
  '75': '75%',
  '80': '80%',
  '90': '90%',
  '100': '100%',
};
const marginScale = {
  ...spacingScale,
  auto: 'auto',
};

const fontScale = {
  '-2': '0.75rem',
  '-1': '0.875rem',
  '0': '0px',
  '1': '1rem', // 16px
  '2': '1.125rem', // 18px
  '3': '1.25rem', // 20px
  '4': '1.5rem', // 24px
  '5': '1.875rem', // 30px
  '6': '2.25rem', // 36px
  '7': '3rem', // 48px
  '8': '3.5rem', // 56px
};

const fontWeights = {
  hairline: 100,
  thin: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

const borderRadius = {
  '0': '0',
  '1': '.125rem',
  '2': '.25rem',
  '3': '.5rem',
  auto: '6px',
  '100': '9999px',
};

const zIndex = {
  auto: 'auto',
  '-2': -20,
  '-1': -10,
  '0': 0,
  '1': 10,
  '2': 20,
  '3': 30,
  '4': 40,
  '5': 50,
};

const opacity = {
  '0': '0',
  '15': '.15',
  '25': '.25',
  '50': '.5',
  '75': '.75',
  '100': '1',
};

/**
 * Custom classes, not part of defaul tailwind, added as plugins
 **/
const customFlexbox = {
  flrnw: {
    flexDirection: 'row',
  },
  flrw: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  flcnw: {
    flexDirection: 'column',
  },
  flcw: {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  fln: {
    flex: 'none',
  },
  fla: {
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
  },
  flccv: {
    justifyContent: 'center',
  },
  flcch: {
    alignItems: 'center',
  },
  flrcv: {
    alignItems: 'center',
  },
  flrch: {
    justifyContent: 'center',
  },
  flc: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flral: {
    justifyContent: 'flex-start',
  },
  flrar: {
    justifyContent: 'flex-end',
  },
  flcat: {
    justifyContent: 'flex-start',
  },
  flcab: {
    justifyContent: 'flex-end',
  },
  flspa: {
    justifyContent: 'space-around',
  },
  flspb: {
    justifyContent: 'space-between',
  },
};
const customUtilities = {
  'text-outline': {
    'text-shadow':
      '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
  },
  'bg-blur': {
    filter: 'blur(10px)',
  },
};

// Font weight
const customFontWeight = {};
_.each(fontWeights, (value, key) => {
  // Use without prefix: .bold, .thin, etc
  customFontWeight[key] = { fontWeight: value };
});
// Spacing
const customPositions = {};
_.each(spacingScale, (value, key) => {
  // Absolute positioning using same scale as margin/padding
  customPositions[`top-${key}`] = { top: value };
  customPositions[`right-${key}`] = { right: value };
  customPositions[`bottom-${key}`] = { bottom: value };
  customPositions[`left-${key}`] = { left: value };
});
// Dimensions
const customCroppedVhVw = {};
_.each(dimensionScale, (value, key) => {
  // Allow width/height equal to "full size minus X"
  // Only do it for simple scale and half/scales
  const isSimpleScale = key.length === 1;
  const isHalfScale = key.length === 2 && key[1] === 'x';
  if (!(isSimpleScale || isHalfScale)) {
    return;
  }
  customCroppedVhVw[`h-100vh-${key}`] = { height: `calc(100vh - ${value})` };
  customCroppedVhVw[`w-100vw-${key}`] = { width: `calc(100vw - ${value})` };
});
// Colors
const customOutlines = {};
const customGradients = {};
_.each(colors, (value1, key1) => {
  // Use color for outlines
  customOutlines[`outline-${key1}`] = { outline: `1px solid ${value1}` };
  // Create gradients
  _.each(colors, (value2, key2) => {
    if (key1 === key2) {
      return;
    }
    customGradients[`bgh-${key1}-to-${key2}`] = {
      backgroundImage: `linear-gradient(75deg,${value1}, ${value2})`,
    };
    customGradients[`bgv-${key1}-to-${key2}`] = {
      backgroundImage: `linear-gradient(165deg,${value1}, ${value2})`,
    };
  });
});

function addCustomClasses(customClasses) {
  return ({ addUtilities }) => {
    const prefixedClasses = _.mapKeys(customClasses, (value, key) => `.${key}`);
    addUtilities(prefixedClasses);
  };
}

const plugins = [
  addCustomClasses(customFlexbox),
  addCustomClasses(customUtilities),
  addCustomClasses(customFontWeight),
  addCustomClasses(customPositions),
  addCustomClasses(customCroppedVhVw),
  addCustomClasses(customOutlines),
  addCustomClasses(customGradients),
];

module.exports = userConfigHook({
  textSizes: fontScale,
  fontWeights,
  width: widthScale,
  minWidth: widthScale,
  maxWidth: widthScale,

  height: heightScale,
  minHeight: heightScale,
  maxHeight: heightScale,

  padding: spacingScale,

  margin: marginScale,
  negativeMargin: marginScale,

  colors,
  zIndex,
  opacity,
  borderRadius,

  plugins,
  screens: {
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    print: { raw: 'print' },
  },
  textColors: colors,
  backgroundColors: colors,
  backgroundSize: backgroundScale,
  borderWidths: {
    default: '1px',
    '0': '0',
    '1': '2px',
    '2': '4px',
    '3': '8px',
  },
  borderColors: global.Object.assign({ default: colors['grey--1'] }, colors),
  fonts: {
    sans: [
      'system-ui',
      'BlinkMacSystemFont',
      '-apple-system',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif',
    ],
    serif: [
      'Constantia',
      'Lucida Bright',
      'Lucidabright',
      'Lucida Serif',
      'Lucida',
      'DejaVu Serif',
      'Bitstream Vera Serif',
      'Liberation Serif',
      'Georgia',
      'serif',
    ],
    mono: [
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },
  // Line-height
  leading: {
    '0': '0',
    '01': 1,
    '1': 1.25,
    '2': 1.5,
    '3': 2,
  },
  // Letter-spacing
  tracking: {
    tight: '-0.05em',
    normal: '0',
    wide: '0.05em',
    poppins: '1.5px',
  },
  shadows: {
    '1': '0 2px 4px 0 rgba(0,0,0,0.10)',
    '2': '0 4px 8px 0 rgba(0,0,0,0.12), 0 2px 4px 0 rgba(0,0,0,0.08)',
    '3': '0 15px 30px 0 rgba(0,0,0,0.11), 0 5px 15px 0 rgba(0,0,0,0.08)',
    inner: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
    '0': 'none',
  },
  svgFill: {
    current: 'currentColor',
  },
  svgStroke: {
    current: 'currentColor',
  },

  modules: {
    appearance: ['responsive'],
    backgroundAttachment: ['responsive'],
    backgroundColors: ['responsive', 'hover', 'focus'],
    backgroundPosition: ['responsive'],
    backgroundRepeat: ['responsive'],
    backgroundSize: ['responsive'],
    borderColors: ['responsive', 'hover'],
    borderRadius: ['responsive'],
    borderStyle: ['responsive'],
    borderWidths: ['responsive'],
    cursor: ['responsive'],
    display: ['responsive'],
    flexbox: ['responsive'],
    float: ['responsive'],
    fonts: ['responsive'],
    fontWeights: ['responsive', 'hover'],
    height: ['responsive'],
    leading: ['responsive'],
    lists: ['responsive'],
    margin: ['responsive'],
    maxHeight: ['responsive'],
    maxWidth: ['responsive'],
    minHeight: ['responsive'],
    minWidth: ['responsive'],
    negativeMargin: ['responsive'],
    opacity: ['responsive'],
    overflow: ['responsive'],
    padding: ['responsive'],
    pointerEvents: ['responsive'],
    position: ['responsive'],
    resize: ['responsive'],
    shadows: ['responsive', 'hover'],
    svgFill: [],
    svgStroke: [],
    textAlign: ['responsive'],
    textColors: ['responsive', 'hover'],
    textSizes: ['responsive'],
    textStyle: ['responsive', 'hover'],
    tracking: ['responsive'],
    userSelect: ['responsive'],
    verticalAlign: ['responsive'],
    visibility: ['responsive'],
    whitespace: ['responsive'],
    width: ['responsive'],
    zIndex: ['responsive'],
  },

  /*
  |-----------------------------------------------------------------------------
  | Advanced Options         https://tailwindcss.com/docs/configuration#options
  |-----------------------------------------------------------------------------
  |
  | Here is where you can tweak advanced configuration options. We recommend
  | leaving these options alone unless you absolutely need to change them.
  |
  */

  options: {
    prefix: '',
    important: false,
    separator: '_',
  },
});
