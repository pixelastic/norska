const module = require('../attributes');

describe('norska-frontend > lazyload > attributes', () => {
  it('should return src and dataSrc', async () => {
    const input = 'https://www.example.com/foo.png';
    const actual = module(input);

    expect(actual).toHaveProperty('src', null);
    expect(actual).toHaveProperty('dataSrc', input);
  });
  it('should return style and dataBg', async () => {
    const input = 'https://www.example.com/foo.png';
    const actual = module(input);

    expect(actual).toHaveProperty('style', null);
    expect(actual).toHaveProperty('dataBg', input);
  });
  describe('disabled', () => {
    it('should return src and dataSrc', async () => {
      const input = 'https://www.example.com/foo.png';
      const actual = module(input, { disable: true });

      expect(actual).toHaveProperty('src', input);
      expect(actual).toHaveProperty('dataSrc', null);
    });
    it('should return style and dataBg', async () => {
      const input = 'https://www.example.com/foo.png';
      const actual = module(input, { disable: true });

      expect(actual).toHaveProperty('style', `background-image:url(${input})`);
      expect(actual).toHaveProperty('dataBg', null);
    });
  });
});
