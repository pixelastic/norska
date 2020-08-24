const current = require('../index');
const config = require('norska-config');
const write = require('firost/lib/write');
const data = require('norska-data');
const read = require('firost/lib/read');
const writeJson = require('firost/lib/writeJson');

describe('norska-html > pug', () => {
  const tmpDirectory = './tmp/norska-html/pug';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      data.clearCache();
    });
    it('should create a file from a template', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      await write('p foo', input);

      await current.compile(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<p>foo</p>');
    });
    it('should use site data', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      const dataPath = config.fromPath('_data/foo.json');
      await write('p=data.foo.bar', input);
      await writeJson({ bar: 'baz' }, dataPath);

      await current.compile(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<p>baz</p>');
    });
    it('should allow overriding site data', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      const dataPath = config.fromPath('_data/foo.json');
      await write('p=data.foo.bar', input);
      await writeJson({ bar: 'baz' }, dataPath);

      await current.compile(input, output, { foo: { bar: 'quux' } });

      const actual = await read(output);
      expect(actual).toEqual('<p>quux</p>');
    });
  });
  describe('convert', () => {
    beforeEach(async () => {
      await write(
        dedent`
      .container
        block content
      `,
        config.fromPath('_includes/layout.pug')
      );
    });
    it.each([
      ['Nominal case', 'p foo', '<p>foo</p>', {}],
      [
        'With relative layout',
        dedent`
          extends _includes/layout.pug

          block content
            p foo
          `,
        '<div class="container"><p>foo</p></div>',
        {},
      ],
      [
        'With absolute layout in subfolder',
        dedent`
          extends /_includes/layout.pug

          block content
            p foo
          `,
        '<div class="container"><p>foo</p></div>',
        {
          from: 'subfolder/index.pug',
        },
      ],
      [
        'With relative layout in subfolder',
        dedent`
          extends ../_includes/layout.pug

          block content
            p foo
          `,
        '<div class="container"><p>foo</p></div>',
        {
          from: 'subfolder/index.pug',
        },
      ],
      ['With lodash', 'p=_.keys({foo: "bar"})', '<p>foo</p>', {}],
      ['With markdown', 'p!=markdown("# foo")', '<p><h1>foo</h1></p>', {}],
      ['Manual revving', 'p!=revv("style.css")', '<p>style.css</p>', {}],
      ['Manual img link', 'p!=img("cover.png")', '<p>cover.png</p>', {}],
      [
        'With mixins',
        dedent`
      +times(2)
        p Text
        `,
        '<p>Text</p><p>Text</p>',
        {},
      ],
    ])('%s', async (_name, source, expected, options) => {
      const actual = await current.convert(source, options);
      expect(actual).toEqual(expected);
    });
  });
  describe('errors', () => {
    it.each([
      ['Invalid syntax', 'p.invalid:syntax foo', 'Unexpected token', {}],
      ['Missing data', 'p=nope.nope', 'Cannot read property', {}],
    ])('%s', async (_name, source, expected) => {
      const sourcePath = config.fromPath('index.pug');
      const destinationPath = config.toPath('index.html');
      await write(source, sourcePath);

      let actual = null;
      try {
        await current.compile(sourcePath, destinationPath);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ERROR_PUG_COMPILATION_FAILED');
      expect(actual).toHaveProperty('message', expect.stringMatching(expected));
    });
  });
});
