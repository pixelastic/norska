const current = require('../cloudinary');

describe('norska-image-proxy > services > cloudinary', () => {
  describe('one bucket', () => {
    const bucketName = 'bucket-foo';
    it('should pass the url through Cloudinary', async () => {
      const input = 'http://www.example.com/foo.png';
      const actual = current(input, { bucketName });

      expect(actual).toStartWith(
        'https://res.cloudinary.com/bucket-foo/image/fetch/'
      );
    });
    it('should encode query string', async () => {
      const input = 'http://www.example.com/foo.png?v=42';
      const actual = current(input, { bucketName });

      expect(actual).toEqual(
        'https://res.cloudinary.com/bucket-foo/image/fetch/f_auto/http://www.example.com/foo.png%3Fv=42'
      );
    });
    it('should set the format to auto', async () => {
      const input = 'http://www.example.com/foo.png';
      const actual = current(input, { bucketName });

      expect(actual).toEqual(
        'https://res.cloudinary.com/bucket-foo/image/fetch/f_auto/http://www.example.com/foo.png'
      );
    });
    it('should throw an error if url is not remote', async () => {
      const input = './foo.png';
      let actual;

      try {
        current(input, { bucketName });
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'CLOUDINARY_PROXY_NOT_URL');
    });
    it('should not change the url if already from cloudinary', async () => {
      const input =
        'https://res.cloudinary.com/bucket-foo/image/fetch/f_auto/http://www.example.com/foo.png';
      const actual = current(input, { bucketName });

      expect(actual).toEqual(input);
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
        [{ unknown: 42 }, 'f_auto'],
      ])('%s => %s', async (options, params) => {
        const input = 'http://www.example.com/foo.png';
        const expected = `https://res.cloudinary.com/bucket-foo/image/fetch/${params}/http://www.example.com/foo.png`;
        const actual = current(input, { bucketName, ...options });
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('array of buckets', () => {
    it('should randomly pick one bucket in the list', async () => {
      const bucketList = ['bucket-one', 'bucket-two'];

      const urlOne = 'http://www.example.com/something.png';
      const actualOne = current(urlOne, {
        bucketName: bucketList,
      });
      expect(actualOne).toStartWith(
        'https://res.cloudinary.com/bucket-one/image/fetch/'
      );

      const urlTwo = 'http://www.example.com/another-thing.png';
      const actualTwo = current(urlTwo, {
        bucketName: bucketList,
      });
      expect(actualTwo).toStartWith(
        'https://res.cloudinary.com/bucket-two/image/fetch/'
      );
    });
  });
});
