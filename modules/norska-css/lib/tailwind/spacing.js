const scale = {
  // No space at all
  0: '0',
  // Default space
  auto: 'auto',
  // Smaller than the base unit
  '01': '0.25rem',
  '02': '0.5rem',
  '03': '0.75rem',
  '04': '0.875rem',
  // Numeric  scale
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
  // Percentage scale
  '20p': '20%',
  '25p': '25%',
  '33p': 'calc(100% / 3)',
  '40p': '40%',
  '50p': '50%',
  '60p': '60%',
  '66p': 'calc(100% / 1.5)',
  '75p': '75%',
  '80p': '80%',
  '100p': '100%',
  '50vw': '50vw',
  '50vh': '50vh',
  '100vw': '100vw',
  '100vh': '100vh',
};

export default scale;