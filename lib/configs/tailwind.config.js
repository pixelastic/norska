/* eslint-disable import/no-commonjs */
const _ = require('lodash');
const colors = {
  transparent: 'transparent',
  inherit: 'inherit',

  'black-pure': '#000',
  black: '#22292f',
  'grey-3': '#3d4852',
  'grey-2': '#606f7b',
  'grey-1': '#8795a1',
  grey: '#b8c2cc',
  'grey--1': '#dae1e7',
  'grey--2': '#f1f5f8',
  'grey--3': '#f8fafc',
  white: '#ffffff',

  'black-10': 'rgba(0, 0, 0, .10)',
  'black-25': 'rgba(0, 0, 0, .25)',
  'black-50': 'rgba(0, 0, 0, .50)',
  'black-65': 'rgba(0, 0, 0, .65)',
  'black-75': 'rgba(0, 0, 0, .75)',
  'black-90': 'rgba(0, 0, 0, .90)',
  'white-10': 'rgba(255, 255, 255, .10)',
  'white-25': 'rgba(255, 255, 255, .25)',
  'white-50': 'rgba(255, 255, 255, .50)',
  'white-65': 'rgba(255, 255, 255, .65)',
  'white-75': 'rgba(255, 255, 255, .75)',
  'white-90': 'rgba(255, 255, 255, .90)',

  'red-3': '#3b0d0c',
  'red-2': '#621b18',
  'red-1': '#cc1f1a',
  red: '#e3342f',
  'red--1': '#ef5753',
  'red--2': '#f9acaa',
  'red--3': '#fcebea',

  'orange-3': '#462a16',
  'orange-2': '#613b1f',
  'orange-1': '#de751f',
  orange: '#f6993f',
  'orange--1': '#faad63',
  'orange--2': '#fcd9b6',
  'orange--3': '#fff5eb',

  'yellow-3': '#453411',
  'yellow-2': '#684f1d',
  'yellow-1': '#f2d024',
  yellow: '#ffed4a',
  'yellow--1': '#fff382',
  'yellow--2': '#fff9c2',
  'yellow--3': '#fcfbeb',

  'green-3': '#0f2f21',
  'green-2': '#1a4731',
  'green-1': '#1f9d55',
  green: '#38c172',
  'green--1': '#51d88a',
  'green--2': '#a2f5bf',
  'green--3': '#e3fcec',

  'teal-3': '#0d3331',
  'teal-2': '#20504f',
  'teal-1': '#38a89d',
  teal: '#4dc0b5',
  'teal--1': '#64d5ca',
  'teal--2': '#a0f0ed',
  'teal--3': '#e8fffe',

  'blue-3': '#12283a',
  'blue-2': '#1c3d5a',
  'blue-1': '#2779bd',
  blue: '#3490dc',
  'blue--1': '#6cb2eb',
  'blue--2': '#bcdefa',
  'blue--3': '#eff8ff',

  'indigo-3': '#191e38',
  'indigo-2': '#2f365f',
  'indigo-1': '#5661b3',
  indigo: '#6574cd',
  'indigo--1': '#7886d7',
  'indigo--2': '#b2b7ff',
  'indigo--3': '#e6e8ff',

  'purple-3': '#21183c',
  'purple-2': '#382b5f',
  'purple-1': '#794acf',
  purple: '#9561e2',
  'purple--1': '#a779e9',
  'purple--2': '#d6bbfc',
  'purple--3': '#f3ebff',

  'pink-3': '#451225',
  'pink-2': '#6f213f',
  'pink-1': '#eb5286',
  pink: '#f66d9b',
  'pink--1': '#fa7ea8',
  'pink--2': '#ffbbca',
  'pink--3': '#ffebef',
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

// Use font-weight without prefixes (.bold, .thin, etc)
const customFontWeight = _.reduce(fontWeights, (result, value, key) =>
  _.assign(result, {
    [`${key}`]: { fontWeight: value },
  })
);
const customUtilities = {
  'text-outline': {
    'text-shadow':
      '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
  },
  'bg-blur': {
    filter: 'blur(10px)',
  },
};
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
// Use the spacing scale for top/right/bottom/let positioning
const customPositions = _.reduce(
  spacingScale,
  (result, value, key) =>
    _.assign(result, {
      [`top-${key}`]: { top: value },
      [`right-${key}`]: { top: value },
      [`bottom-${key}`]: { top: value },
      [`left-${key}`]: { top: value },
    }),
  {}
);
// Add calculated height and width with cropped parts, like .h-100vh-3
const customCroppedVhVw = _.reduce(
  dimensionScale,
  (result, value, key) => {
    // Only do it for simple scale and half/scales
    const isSimpleScale = key.length === 1;
    const isHalfScale = key.length === 2 && key[1] === 'x';
    if (!(isSimpleScale || isHalfScale)) {
      return result;
    }
    return _.assign(result, {
      [`h-100vh-${key}`]: { height: `calc(100vh - ${value})` },
      [`w-100vw-${key}`]: { width: `calc(100vw - ${value})` },
    });
  },
  {}
);

function addCustomClasses(customClasses) {
  return ({ addUtilities }) => {
    const prefixedClasses = _.mapKeys(customClasses, (value, key) => `.${key}`);
    addUtilities(prefixedClasses);
  };
}

const plugins = [
  addCustomClasses(customFontWeight),
  addCustomClasses(customFlexbox),
  addCustomClasses(customUtilities),
  addCustomClasses(customPositions),
  addCustomClasses(customCroppedVhVw),
];

module.exports = {
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
};
