const pug = require('../../index.js');
const config = require('norska-config');

describe('norska-html > pug > mixins > times', () => {
  const tmpDirectory = './tmp/norska-html/pug/mixins/times';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
  });
  it.each([
    // name, input, expected
    [
      'Nominal case',
      dedent`
        block content
          +times(3)
            p foo
      `,
      '<p>foo</p><p>foo</p><p>foo</p>',
    ],
  ])('%s', async (_name, source, expected) => {
    const actual = await pug.convert(source);
    expect(actual).toContain(expected);
  });
});
