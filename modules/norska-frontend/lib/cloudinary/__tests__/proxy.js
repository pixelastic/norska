const module = require('../proxy');
const cloudinary = require('../index');

describe('norska-frontend > cloudinary > proxy', () => {
  it('should throw an error if no bucketName defined', async () => {
    let actual;
    const input = 'http://www.example.com/foo.png';
    try {
      module(input);
    } catch (err) {
      actual = err;
    }

    expect(actual).toHaveProperty('code', 'CLOUDINARY_MISSING_CONFIG');
  });
  describe('with config', () => {
    beforeEach(async () => {
      cloudinary.init({ bucketName: 'bucket-foo' });
    });
    it('should pass the url through Cloudinary', async () => {
      const input = 'http://www.example.com/foo.png';
      const actual = module(input);

      expect(actual).toStartWith(
        'https://res.cloudinary.com/bucket-foo/image/fetch/'
      );
    });
    it('should encode query string', async () => {
      const input = 'http://www.example.com/foo.png?v=42';
      const actual = module(input);

      expect(actual).toEqual(
        'https://res.cloudinary.com/bucket-foo/image/fetch/f_auto/http%3A%2F%2Fwww.example.com%2Ffoo.png%3Fv%3D42'
      );
    });
    it('should set the format to auto', async () => {
      const input = 'http://www.example.com/foo.png';
      const actual = module(input);

      expect(actual).toEqual(
        'https://res.cloudinary.com/bucket-foo/image/fetch/f_auto/http%3A%2F%2Fwww.example.com%2Ffoo.png'
      );
    });
    it('should throw an error if url is not remote', async () => {
      const input = './foo.png';
      let actual;

      try {
        module(input);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'CLOUDINARY_PROXY_NOT_URL');
    });
    describe('transforms', () => {
      it.each([
        // Object | String
        [{ width: 42 }, 'f_auto,w_42'],
        [{ height: 42 }, 'f_auto,h_42'],
        [{ quality: 42 }, 'f_auto,q_42'],
        [{ opacity: 42 }, 'f_auto,o_42'],
        [{ format: 'jpg' }, 'f_jpg'],
        [{ blur: 42 }, 'e_blur:42,f_auto'],
        [{ pixelify: 42 }, 'f_auto,e_pixelate:42'],
        [{ grayscale: true }, 'f_auto,e_grayscale'],
        [
          { grayscale: true, quality: 90, height: 42 },
          'f_auto,e_grayscale,h_42,q_90',
        ],
      ])('%s => %s', async (options, params) => {
        const input = 'http://www.example.com/foo.png';
        const expected = `https://res.cloudinary.com/bucket-foo/image/fetch/${params}/http%3A%2F%2Fwww.example.com%2Ffoo.png`;
        const actual = module(input, options);
        expect(actual).toEqual(expected);
      });
    });
  });
});
