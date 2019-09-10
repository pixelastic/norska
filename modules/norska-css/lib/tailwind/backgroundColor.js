import { _ } from 'golgoth';
import colorsAsRGB from './colorsAsRGB';

export default _.transform(
  colorsAsRGB,
  (result, colorValue, colorName) => {
    result[
      colorName
    ] = `rgba(${colorValue.red}, ${colorValue.green}, ${colorValue.blue}, var(--background-opacity, 1))`;
  },
  {}
);
