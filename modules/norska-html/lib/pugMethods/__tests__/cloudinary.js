const module = require('../cloudinary.js');

describe('norska-html > pugMethods > cloudinary', () => {
  beforeEach(async () => {
    jest.spyOn(module, '__frontendProxy').mockReturnValue('bar');
  });
  describe('in dev', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__isProduction').mockReturnValue(false);
    });
    it('remote url passed to proxy', async () => {
      const input = 'http://www.example.com/foo.png';
      const options = { foo: 'bar' };

      const actual = module(input, options);

      expect(actual).toEqual('bar');
      expect(module.__frontendProxy).toHaveBeenCalledWith(input, options);
    });
    it('local path returned as-is', async () => {
      const input = './foo.png';
      const options = { foo: 'bar' };

      const actual = module(input, options);

      expect(actual).toEqual(input);
      expect(module.__frontendProxy).not.toHaveBeenCalled();
    });
  });
  describe('in production', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__isProduction').mockReturnValue(true);
    });
    it('remote url passed to proxy', async () => {
      const input = 'http://www.example.com/foo.png';
      const options = { foo: 'bar' };

      const actual = module(input, options);

      expect(actual).toEqual('bar');
      expect(module.__frontendProxy).toHaveBeenCalledWith(input, options);
    });
    it('local path fixed to remote url', async () => {
      const input = './foo.png';
      const options = { foo: 'bar' };
      const data = {
        data: { site: { defaultUrl: 'https://www.pixelastic.com' } },
      };

      const actual = module(input, options, data);

      expect(actual).toEqual('bar');
      expect(module.__frontendProxy).toHaveBeenCalledWith(
        'https://www.pixelastic.com/foo.png',
        options
      );
    });
  });
});
