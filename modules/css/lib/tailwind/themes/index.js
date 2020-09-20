// Fallback configs
const colors = require('./shared/colors.js');
const spacing = require('./shared/spacing.js');

// Specific configs
const borderRadius = require('./borderRadius.js');
const borderWidth = require('./borderWidth.js');
const fontSize = require('./fontSize.js');
const height = require('./height.js');
const inset = require('./inset.js');
const maxHeight = require('./maxHeight.js');
const maxWidth = require('./maxWidth.js');
const minHeight = require('./minHeight.js');
const minWidth = require('./minWidth.js');
const opacity = require('./opacity.js');
const scale = require('./scale.js');
const width = require('./width.js');
const zIndex = require('./zIndex.js');

module.exports = {
  theme: {
    borderRadius,
    borderWidth,
    colors,
    fontSize,
    height,
    inset,
    maxHeight,
    maxWidth,
    minHeight,
    width,
    minWidth,
    opacity,
    scale,
    spacing,
    zIndex,
  },
};
