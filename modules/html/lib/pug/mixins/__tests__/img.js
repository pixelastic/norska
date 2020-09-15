const pug = require('../../index.js');
const config = require('norska-config');

describe('norska-html > pug > mixins > img', () => {
  const tmpDirectory = './tmp/norska-html/pug/mixins/times';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
  });
  it.each([
    // Name, source, output
    ['Nominal case', '+img', '<img/>'],
    ['With only a alt', '+img(alt="foo")', '<img alt="foo"/>'],
    ['With only a class', '+img.foo', '<img class="foo"/>'],
    [
      'With a remote url',
      '+img(src="https://there.com/foo.png")',
      '<img class="lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il" loading="lazy"/>',
    ],
    [
      'With a remote url and a class',
      '+img.rounded(src="https://there.com/foo.png")',
      '<img class="rounded lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il" loading="lazy"/>',
    ],
    [
      'With options',
      '+img(src="https://there.com/foo.png" options={width: 100})',
      '<img class="lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=5&il&q=50&w=100" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il&w=100" loading="lazy"/>',
    ],
    [
      'With placeholder options',
      '+img(src="https://there.com/foo.png" options={placeholder: {blur:100}})',
      '<img class="lazyload" src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&blur=100&il&q=50" data-src="https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Ffoo.png&af&il" loading="lazy"/>',
    ],
  ])('%s', async (_name, source, expected) => {
    const actual = await pug.convert(dedent`
    block content
      ${source}`);
    expect(actual).toContain(expected);
  });
});
