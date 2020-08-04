const current = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const read = require('firost/lib/read');

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

      await current.createPage(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<p>dummy</p>');
    });
  });
  describe('times', () => {
    it('should display the block n times', async () => {
      const input = config.fromPath('foo.pug');
      const output = config.toPath('output.html');
      await write(
        dedent`
      +times(3)
        p foo
      `,
        input
      );

      await current.createPage(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<p>foo</p><p>foo</p><p>foo</p>');
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
        '<img class="lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=10" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il" loading="lazy"/>',
      ],
      [
        '+img(src="https://there.com/foo.png" options={width: 100})',
        '<img class="lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=10&w=100" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il&w=100" loading="lazy"/>',
      ],
      [
        '+img(src="https://there.com/foo.png" options={placeholder: {blur:100}})',
        '<img class="lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=100&il&q=10" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il" loading="lazy"/>',
      ],
    ])('%s', async (input, expected) => {
      const source = config.fromPath('source.pug');
      const destination = config.toPath('destination.html');
      await write(input, source);

      await current.createPage(source, destination);

      const actual = await read(destination);
      expect(actual).toEqual(expected);
    });
  });
});
