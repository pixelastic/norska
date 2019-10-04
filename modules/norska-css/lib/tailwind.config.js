/* eslint-disable import/no-commonjs */
import backgroundColor from './tailwind/backgroundColor';
import textColor from './tailwind/textColor';
import borderRadius from './tailwind/borderRadius';
import borderColor from './tailwind/borderColor';
import boxShadow from './tailwind/boxShadow';
import colors from './tailwind/colors';
import fontSize from './tailwind/fontSize';
import opacity from './tailwind/opacity';
import spacing from './tailwind/spacing';
import inset from './tailwind/inset';
import zIndex from './tailwind/zIndex';
import backgroundGradientPlugin from './tailwind/backgroundGradientPlugin';
import backgroundOpacityPlugin from './tailwind/backgroundOpacityPlugin';
import borderOpacityPlugin from './tailwind/borderOpacityPlugin';
import bulletsPlugin from './tailwind/bulletsPlugin';
import debugPlugin from './tailwind/debugPlugin';
import flexboxPlugin from './tailwind/flexboxPlugin';
import grayscalePlugin from './tailwind/grayscalePlugin';
import lineHeightPlugin from './tailwind/lineHeightPlugin';
import shorterClassesPlugin from './tailwind/shorterClassesPlugin';
import textColorPlugin from './tailwind/textColorPlugin';
import textOpacityPlugin from './tailwind/textOpacityPlugin';

module.exports = {
  separator: '_',
  theme: {
    backgroundColor,
    borderColor,
    borderRadius,
    boxShadow,
    colors,
    fontSize,
    height: spacing,
    maxHeight: spacing,
    maxWidth: spacing,
    minHeight: spacing,
    minWidth: spacing,
    borderWidth: spacing,
    inset,
    opacity,
    spacing,
    textColor,
    width: spacing,
    zIndex,
  },
  variants: {
    cursor: ['responsive', 'hover'],
    height: ['responsive', 'hover'],
    position: ['responsive', 'hover'],
    width: ['responsive', 'hover'],
    zIndex: ['responsive', 'hover'],
  },
  plugins: [
    backgroundOpacityPlugin(['hover']),
    backgroundGradientPlugin(),
    borderOpacityPlugin(),
    bulletsPlugin(),
    debugPlugin(),
    flexboxPlugin(['responsive']),
    grayscalePlugin(['hover']),
    lineHeightPlugin(),
    shorterClassesPlugin(['responsive', 'hover']),
    textColorPlugin(['hover']),
    textOpacityPlugin(['hover']),
  ],
};
