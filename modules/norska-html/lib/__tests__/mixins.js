const module = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const frontendCloudinary = require('norska-cloudinary/lib/frontend');
frontendCloudinary.init({ bucketName: 'bucket' });

describe('norska-html > mixins', () => {
  const tmpDirectory = './tmp/norska-html/mixins';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await emptyDir(tmpDirectory);
  });
  describe('test_dummy', () => {
    it('should include builtin mixins', async () => {
      const input = config.fromPath('foo.pug');
      const output = config.toPath('output.html');
      await write('+test_dummy', input);

      await module.createPage(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<p>dummy</p>');
    });
  });
  describe('img', () => {
    it.each([
      // pug code | html code
      ['+img', '<img class="lazyload"/>'],
      ['+img(alt="foo")', '<img class="lazyload" alt="foo"/>'],
      ['+img.foo', '<img class="lazyload foo"/>'],
      [
        '+img(src="https://there.com/foo.png")',
        '<img class="lazyload" src="https://res.cloudinary.com/bucket/image/fetch/e_blur:300,f_auto,q_auto:low/https://there.com/foo.png" data-src="https://res.cloudinary.com/bucket/image/fetch/f_auto/https://there.com/foo.png" loading="lazy"/>',
      ],
      [
        '+img(src="https://there.com/foo.png" options={width: 100})',
        '<img class="lazyload" src="https://res.cloudinary.com/bucket/image/fetch/e_blur:300,f_auto,q_auto:low,w_100/https://there.com/foo.png" data-src="https://res.cloudinary.com/bucket/image/fetch/f_auto,w_100/https://there.com/foo.png" loading="lazy"/>',
      ],
      [
        '+img(src="https://there.com/foo.png" options={placeholder: {blur:8000}})',
        '<img class="lazyload" src="https://res.cloudinary.com/bucket/image/fetch/e_blur:8000,f_auto,q_auto:low/https://there.com/foo.png" data-src="https://res.cloudinary.com/bucket/image/fetch/f_auto/https://there.com/foo.png" loading="lazy"/>',
      ],
    ])('%s', async (input, expected) => {
      const source = config.fromPath('source.pug');
      const destination = config.toPath('destination.html');
      await write(input, source);

      await module.createPage(source, destination);

      const actual = await read(destination);
      expect(actual).toEqual(expected);
    });
  });
});
