/* eslint-disable import/no-commonjs */
import borderRadius from './tailwind/borderRadius';
import colors from './tailwind/colors';
import fontSize from './tailwind/fontSize';
import opacity from './tailwind/opacity';
import zIndex from './tailwind/zIndex';
import spacing from './tailwind/spacing';
import boxShadow from './tailwind/boxShadow';
import bulletsPlugin from './tailwind/bulletsPlugin';
import debugPlugin from './tailwind/debugPlugin';
import flexboxPlugin from './tailwind/flexboxPlugin';
import grayscalePlugin from './tailwind/grayscalePlugin';
import shorterClassesPlugin from './tailwind/shorterClassesPlugin';
import textColorPlugin from './tailwind/textColorPlugin';
import backgroundColorPlugin from './tailwind/backgroundColorPlugin';
import lineHeightPlugin from './tailwind/lineHeightPlugin';

module.exports = {
  separator: '_',
  theme: {
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
    backgroundColorPlugin(['hover']),
    debugPlugin(),
    flexboxPlugin(['responsive']),
    grayscalePlugin(['hover']),
    lineHeightPlugin(),
    shorterClassesPlugin(),
    textColorPlugin(['hover']),
  ],
};
