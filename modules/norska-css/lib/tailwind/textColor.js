import { _ } from 'golgoth';
import colorsAsRGB from './colorsAsRGB';

export default _.transform(
  colorsAsRGB,
  (result, colorValue, colorName) => {
    const rgbColorValue = colorValue.raw
      ? colorValue.raw
      : `rgba(${colorValue.red}, ${colorValue.green}, ${colorValue.blue}, var(--text-opacity, 1))`;
    result[colorName] = rgbColorValue;
  },
  {}
);
