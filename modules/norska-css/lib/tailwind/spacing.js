import { _ } from 'golgoth';

const baseScale = {
  // No space at all
  0: '0',
  // Smaller than the base unit
  '01': '0.25rem',
  '02': '0.5rem',
  '03': '0.75rem',
  '04': '0.875rem',
  // Default scale
  1: '1rem',
  2: '1.25rem',
  3: '1.5rem',
  4: '2rem',
  5: '2.5rem',
  6: '3rem',
  7: '4rem',
  8: '5rem',
  9: '6rem',
  10: '8rem',
  11: '10rem',
  12: '12rem',
  13: '14rem',
  14: '16rem',
};

// Adding percent, vh and vw with a 5 increment
const percentStep = 5;
const units = [
  { name: 'p', unit: '%' },
  { name: 'vh', unit: 'vh' },
  { name: 'vw', unit: 'vw' },
];
const percentScale = _.transform(
  units,
  (result, item) => {
    // Adding each step of the way
    _.times(100 / percentStep, step => {
      const value = (step + 1) * percentStep;
      const scaleName = `${value}${item.name}`;
      const scaleValue = `${value}${item.unit}`;
      result[scaleName] = scaleValue;
    });
    // Also addin custom 33 and 66
    result[`33${item.name}`] = `calc(100${item.unit} / 3)`;
    result[`66${item.name}`] = `calc(100${item.unit} / 1.5)`;
    // Adding full size minus base scale, like .h-100vh-6 that takes the whole
    // vh minus the 6 scale
    _.each(baseScale, (baseValue, baseName) => {
      const scaleName = `100${item.name}-${baseName}`;
      const scaleValue = `calc(100${item.unit} - ${baseValue})`;
      result[scaleName] = scaleValue;
    });
  },
  {}
);

const scale = {
  ...baseScale,
  ...percentScale,
};

export default scale;
