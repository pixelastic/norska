/* eslint-disable import/no-commonjs */
import borderRadius from './tailwind/borderRadius';
import colors from './tailwind/colors';
import fontSize from './tailwind/fontSize';
import zIndex from './tailwind/zIndex';
import spacing from './tailwind/spacing';
import bulletsPlugin from './tailwind/bulletsPlugin';
import debugPlugin from './tailwind/debugPlugin';
import flexboxPlugin from './tailwind/flexboxPlugin';
import grayscalePlugin from './tailwind/grayscalePlugin';
import simplerTextPlugin from './tailwind/simplerTextPlugin';
import textColorPlugin from './tailwind/textColorPlugin';
import lineHeightPlugin from './tailwind/lineHeightPlugin';

module.exports = {
  separator: '_',
  theme: {
    borderRadius,
    colors,
    fontSize,
    spacing,
    minHeight: spacing,
    maxHeight: spacing,
    minWidth: spacing,
    maxWidth: spacing,
    zIndex,
  },
  plugins: [
    bulletsPlugin(),
    debugPlugin(),
    flexboxPlugin(),
    grayscalePlugin(['hover']),
    simplerTextPlugin(),
    textColorPlugin(),
    lineHeightPlugin(),
  ],
};
