describe('negativeDimensions', () => {
  describe('should contain', () => {
    const actual = tailwindPluginClasses('../index.js');
    it.each([
      [
        '.underline',
        {
          '--text-decoration-color': 'currentColor',
          textDecoration: 'underline var(--text-decoration-color)',
        },
      ],
      [
        '.strike',
        {
          '--text-decoration-color': 'currentColor',
          textDecoration: 'line-through var(--text-decoration-color)',
        },
      ],
      [
        '.no-underline',
        {
          textDecoration: 'none',
        },
      ],
      [
        '.underline-red',
        {
          '--text-decoration-color': '#e53e3e',
        },
      ],
    ])('%s', async (key, value) => {
      expect(actual[key]).toEqual(value);
    });
  });
});
