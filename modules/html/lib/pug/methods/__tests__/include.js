const pug = require('../../index.js');
const config = require('norska-config');
const write = require('firost/write');

describe('norska-html > pug > methods > include', () => {
  const tmpDirectory = './tmp/norska-html/pug/methods/include';
  beforeAll(async () => {
    await config.init({
      root: tmpDirectory,
    });
    await write('norska', config.fromPath('repo-name.txt'));
    await write(
      'strong!=_.camelCase("git hub")',
      config.fromPath('lodash.pug')
    );
    await write('ul!=include("li.pug")', config.fromPath('ul.pug'));
    await write('li List element', config.fromPath('li.pug'));
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
  ])('%s', async (_name, source, expected) => {
    const actual = await pug.convert(dedent`
    block content
      ${source}`);
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
