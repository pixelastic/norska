const pug = require('../../index.js');
const config = require('norska-config');
const write = require('firost/write');

describe('norska-html > pug > methods > include', () => {
  const tmpDirectory = './tmp/norska-html/pug/methods/include';
  beforeAll(async () => {
    await config.init({
      root: tmpDirectory,
    });
    await pug.init();
    await write('norska', config.fromPath('repo-name.txt'));
    await write(
      'strong!=_.camelCase("git hub")',
      config.fromPath('lodash.pug')
    );
    await write('ul!=include("li.pug")', config.fromPath('ul.pug'));
    await write('li List element', config.fromPath('li.pug'));
    await write('<svg />', config.themeFromPath('assets/logo.svg'));
  });
  it.each([
    // name, source, expected
    ['Including text file', 'p=include("repo-name.txt")', '<p>norska</p>'],
    [
      'Included files have lodash',
      'p!=include("lodash.pug")',
      '<p><strong>gitHub</strong></p>',
    ],
    [
      'Include files recursively',
      'div!=include("ul.pug")',
      '<div><ul><li>List element</li></ul></div>',
    ],
    [
      'Included files have default mixins',
      '+times(3)\n    p item',
      '<p>item</p><p>item</p><p>item</p>',
    ],
    [
      'Include file from theme',
      '.h-5!=include("assets/logo.svg")',
      '<div class="h-5"><svg /></div>',
    ],
  ])('%s', async (_name, source, expected) => {
    const pugSource = `block content\n  ${source}`;
    const actual = await pug.convert(pugSource);
    expect(actual).toContain(expected);
  });
  it('should throw an error if included file does not exist', async () => {
    const source = dedent`
      block content
        div!=include("nope.txt")
      `;
    let actual = null;
    try {
      await pug.convert(source);
    } catch (err) {
      actual = err;
    }
    expect(actual).toHaveProperty('code', 'ERROR_PUG_INCLUDE_MISSING');
  });
});
