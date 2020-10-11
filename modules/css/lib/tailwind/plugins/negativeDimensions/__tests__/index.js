describe('negativeDimensions', () => {
  describe('should contain', () => {
    const actual = tailwindPluginClasses('../index.js');
    it.each([
      ['.-w-75p', { width: 'calc(100% - 75%)' }],
      ['.-h-75p', { height: 'calc(100% - 75%)' }],
      ['.-w-auto', undefined],
      ['.-w-none', undefined],
      ['.-w-prose', undefined],
      ['.-h-auto', undefined],
      ['.-h-none', undefined],
      ['.-h-prose', undefined],
    ])('%s', async (key, value) => {
      expect(actual[key]).toEqual(value);
    });
  });
});
