const pug = require('../../index.js');
const config = require('norska-config');

describe('norska-html > pug > methods > isCurrentPage', () => {
  const tmpDirectory = './tmp/norska-html/pug/methods/isCurrentPage';
  beforeAll(async () => {
    await config.init({
      root: tmpDirectory,
    });
  });
  it.each([
    ['index.html', '/'],
    ['index.html', '/index.html'],
    ['blog/index.html', '/blog/'],
    ['blog/index.html', '/blog/index.html'],
  ])('%s is %s', async (destination, input) => {
    const actual = await pug.convert(
      dedent`
    block content
      if isCurrentPage("${input}")
        p OK
    `,
      { to: destination }
    );
    expect(actual).toContain('<p>OK</p>');
  });
});
