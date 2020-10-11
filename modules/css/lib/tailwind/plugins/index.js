const animationAndTransition = require('./animationAndTransition');
const boxShadow = require('./boxShadow');
const bullets = require('./bullets');
const conditionals = require('./conditionals');
const debug = require('./debug');
const flexbox = require('./flexbox');
const fontFamily = require('./fontFamily');
const fontWeight = require('./fontWeight');
const grayscale = require('./grayscale');
const gridColumnWidth = require('./gridColumnWidth');
const lineHeight = require('./lineHeight');
const misc = require('./misc');
const negativeDimensions = require('./negativeDimensions');
const scrollMargin = require('./scrollMargin');
const textColor = require('./textColor');
const textDecoration = require('./textDecoration');
const textShadow = require('./textShadow');
const typography = require('./typography');
const _ = require('golgoth/lib/lodash');

const pluginList = [
  animationAndTransition,
  boxShadow,
  bullets,
  conditionals,
  debug,
  flexbox,
  fontFamily,
  fontWeight,
  grayscale,
  gridColumnWidth,
  lineHeight,
  misc,
  negativeDimensions,
  scrollMargin,
  textColor,
  textDecoration,
  textShadow,
  typography,
];

// Merge all plugin configuration together
let aggregatedConfig = { plugins: [] };
_.each(pluginList, (pluginConfig) => {
  _.merge(aggregatedConfig, pluginConfig.config);
  aggregatedConfig.plugins.push(pluginConfig.plugin);
});

module.exports = aggregatedConfig;
