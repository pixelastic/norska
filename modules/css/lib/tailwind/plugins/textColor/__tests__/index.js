describe('textColor', () => {
  describe('should contain', () => {
    const actual = pluginClasses('../index.js');
    it.each([
      ['.transparent', { color: 'transparent' }],
      ['.current-color', { color: 'currentColor' }],
      [
        '.black',
        {
          '--text-opacity': '1',
          color: 'rgba(0, 0, 0, var(--text-opacity))',
        },
      ],
    ])('%s', async (key, value) => {
      expect(actual[key]).toEqual(value);
    });
  });
});
