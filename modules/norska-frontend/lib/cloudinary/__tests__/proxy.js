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

      expect(actual).toEqual(
        `https://res.cloudinary.com/bucket-foo/image/fetch/${input}`
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
      it('width', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: 42 });
        expect(actual).toContain('w_42');
      });
      it('height', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: 42 });
        expect(actual).toContain('h_42');
      });
      it('quality', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: 42 });
        expect(actual).toContain('q_42');
      });
      it('opacity', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: 42 });
        expect(actual).toContain('o_42');
      });
      it('format', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: 42 });
        expect(actual).toContain('f_42');
      });
      it('blur', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: 42 });
        expect(actual).toContain('e_blur:42');
      });
      it('pixelify', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: 42 });
        expect(actual).toContain('e_pixelate:42');
      });
      it('grayscale', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { [testName]: true });
        expect(actual).toContain('/e_grayscale/');
      });
      it('several transforms', async () => {
        const input = 'http://www.example.com/foo.png';
        const actual = module(input, { width: 42, height: 70 });
        expect(actual).toContain('/fetch/h_70,w_42/');
      });
    });
  });
});
