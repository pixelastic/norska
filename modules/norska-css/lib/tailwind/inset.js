import spacing from './spacing.js';
import { _ } from 'golgoth';

// Use same scale as default spacing, but also add negative values
const scale = _.clone(spacing);
export default _.transform(
  scale,
  (result, value, key) => {
    result[`-${key}`] = `-${value}`;
  },
  scale
);
