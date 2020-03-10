const module = require('../lazyload');

describe('norska-frontend', () => {
  describe('background', () => {
    it('should set no style and a dataBg', async () => {
      const input = './foo.png';
      const actual = module.background(input);

      expect(actual).toHaveProperty('style', null);
      expect(actual).toHaveProperty('dataBg', input);
    });
    describe('when disabled', () => {
      it('should set the style and no dataBg', async () => {
        const input = './foo.png';
        const actual = module.background(input, { disable: true });

        expect(actual).toHaveProperty(
          'style',
          `background-image:url(${input})`
        );
        expect(actual).toHaveProperty('dataBg', null);
      });
    });
  });
});
