/* eslint-disable import/no-commonjs */
import backgroundColor from './tailwind/backgroundColor';
import borderRadius from './tailwind/borderRadius';
import boxShadow from './tailwind/boxShadow';
import colors from './tailwind/colors';
import fontSize from './tailwind/fontSize';
import opacity from './tailwind/opacity';
import spacing from './tailwind/spacing';
import zIndex from './tailwind/zIndex';
import backgroundOpacityPlugin from './tailwind/backgroundOpacityPlugin';
import bulletsPlugin from './tailwind/bulletsPlugin';
import debugPlugin from './tailwind/debugPlugin';
import flexboxPlugin from './tailwind/flexboxPlugin';
import grayscalePlugin from './tailwind/grayscalePlugin';
import lineHeightPlugin from './tailwind/lineHeightPlugin';
import shorterClassesPlugin from './tailwind/shorterClassesPlugin';
import textColorPlugin from './tailwind/textColorPlugin';

module.exports = {
  separator: '_',
  theme: {
    backgroundColor,
    borderRadius,
    boxShadow,
    colors,
    fontSize,
    height: spacing,
    maxHeight: spacing,
    maxWidth: spacing,
    minHeight: spacing,
    minWidth: spacing,
    opacity,
    spacing,
    width: spacing,
    zIndex,
  },
  plugins: [
    bulletsPlugin(),
    backgroundOpacityPlugin(['hover']),
    debugPlugin(),
    flexboxPlugin(['responsive']),
    grayscalePlugin(['hover']),
    lineHeightPlugin(),
    shorterClassesPlugin(),
    textColorPlugin(['hover']),
  ],
};
