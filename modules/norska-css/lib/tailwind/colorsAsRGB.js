import colors from './colors';
import { _ } from 'golgoth';
import hexToRGB from 'hex-rgb';

const rgbColors = _.transform(
  colors,
  (result, colorValue, colorName) => {
    if (!_.startsWith(colorValue, '#')) {
      result[colorName] = { raw: colorValue };
      return;
    }
    const { red, green, blue } = hexToRGB(colorValue);
    result[colorName] = { red, green, blue };
  },
  {}
);

export default rgbColors;
