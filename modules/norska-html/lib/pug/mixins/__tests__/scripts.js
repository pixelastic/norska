const pug = require('../../index.js');
const config = require('norska-config');

describe('norska-html > pug > mixins > scripts', () => {
  const tmpDirectory = './tmp/norska-html/pug/mixins/scripts';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
  });
  it.each([
    // name, jsFiles, source, destinationPath, expected
    [
      'Nominal case',
      ['script.js', 'vendors.js'],
      '+scripts()',
      'index.html',
      '<script src="./script.js"></script><script src="./vendors.js"></script>',
    ],
    [
      'In subfolder',
      ['script.js', 'vendors.js'],
      '+scripts()',
      'blog/index.html',
      '<script src="../script.js"></script><script src="../vendors.js"></script>',
    ],
    ['With no scripts', [], '+scripts()', 'index.html', ''],
    [
      'With custom content',
      [],
      dedent`
        +scripts()
          script(src="custom.js")
      `,
      'index.html',
      '<script src="custom.js"></script>',
    ],
  ])('%s', async (_name, jsFiles, source, destinationPath, expected) => {
    config.set('runtime.jsFiles', jsFiles);
    const options = { to: destinationPath };
    const actual = await pug.convert(source, options);
    expect(actual).toEqual(expected);
  });
});
