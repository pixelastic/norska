const pug = require('../../index.js');
const config = require('norska-config');

describe('norska-html > pug > mixins > scripts', () => {
  const tmpDirectory = './tmp/norska-html/pug/mixins/scripts';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
  });
  it.each([
    // name, jsFiles, source, destinationPath, expected
    [
      'Nominal case',
      ['script.js', 'vendors.js'],
      '+norska_scripts()',
      'index.html',
      '<script src="./script.js"></script><script src="./vendors.js"></script>',
    ],
    [
      'In subfolder',
      ['script.js', 'vendors.js'],
      '+norska_scripts()',
      'blog/index.html',
      '<script src="../script.js"></script><script src="../vendors.js"></script>',
    ],
    ['With no scripts', [], '+norska_scripts()', 'index.html', ''],
    [
      'With custom content',
      [],
      '+norska_scripts()\n    script(src="custom.js")', // Double indentation on purpose
      'index.html',
      '<script src="custom.js"></script>',
    ],
  ])('%s', async (_name, jsFiles, source, destinationPath, expected) => {
    config.set('runtime.jsFiles', jsFiles);
    const options = { to: destinationPath };
    const actual = await pug.convert(`block content\n  ${source}`, options);
    expect(actual).toContain(expected);
  });
});
