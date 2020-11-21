const current = require('../index');
const config = require('norska-config');
const write = require('firost/write');
const data = require('norska-data');
const read = require('firost/read');
const writeJson = require('firost/writeJson');

describe('norska-html > pug', () => {
  const tmpDirectory = './tmp/norska-html/pug';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
      theme: `${tmpDirectory}/node_modules/norska-theme-something/src`,
    });
    // Default layout in theme
    await write(
      dedent`
        .default
          block content
    `,
      config.themePath('_includes/layouts/default.pug')
    );
    await current.init();
  });
  describe('compile', () => {
    beforeEach(async () => {
      data.clearCache();
    });
    it('should create a file from a template', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      await write('block content\n  p foo', input);

      await current.compile(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<div class="default"><p>foo</p></div>');
    });
    it('should use site data', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      const dataPath = config.fromPath('_data/foo.json');
      await write('block content\n  p=data.foo.bar', input);
      await writeJson({ bar: 'baz' }, dataPath);

      await current.compile(input, output);

      const actual = await read(output);
      expect(actual).toEqual('<div class="default"><p>baz</p></div>');
    });
    it('should allow overriding site data', async () => {
      const input = config.fromPath('_templates/foo.pug');
      const output = config.toPath('output.html');
      const dataPath = config.fromPath('_data/foo.json');
      await write('block content\n  p=data.foo.bar', input);
      await writeJson({ bar: 'baz' }, dataPath);

      await current.compile(input, output, { foo: { bar: 'quux' } });

      const actual = await read(output);
      expect(actual).toEqual('<div class="default"><p>quux</p></div>');
    });
    it('should save file in runtime.htmlFiles', async () => {
      const input = 'input.pug';
      const output = 'output.html';
      await write('block content\n  p=data.foo.bar', config.fromPath(input));

      await current.compile(input, output);
      expect(config.get(['runtime', 'htmlFiles', input])).toEqual(output);
    });
  });
  describe('convert', () => {
    beforeEach(async () => {
      // Custom layout in project
      await write(
        dedent`
          .project
            block content
      `,
        config.fromPath('_includes/layouts/project.pug')
      );
      // Custom layout in theme
      await write(
        dedent`
          .docs
            block content
      `,
        config.themePath('_includes/layouts/docs.pug')
      );
      // Custom mixins in project
      await write(
        'mixin test_mixin()\n  p test mixin content',
        config.fromPath('_includes/mixins.pug')
      );
    });
    it.each([
      [
        'Default layout from theme',
        dedent`
          block content
            p foo
        `,
        '<div class="default"><p>foo</p></div>',
      ],
      [
        'Custom theme layout',
        dedent`
        //- ---
        //- layout: docs
        //- ---
        block content
          p foo
        `,
        '<div class="docs"><p>foo</p></div>',
      ],
      [
        'Custom project layout',
        dedent`
        //- ---
        //- layout: project
        //- ---
        block content
          p foo
        `,
        '<div class="project"><p>foo</p></div>',
      ],
      [
        'Specific default',
        dedent`
        //- ---
        //- layout: default
        //- ---
        block content
          p foo
        `,
        '<div class="default"><p>foo</p></div>',
      ],
      [
        'lodash is available as _',
        dedent`
          block content
            p=_.keys({foo: "bar"})
        `,
        '<div class="default"><p>foo</p></div>',
      ],
      [
        'markdown() method is available',
        dedent`
          block content
            !=markdown("content")
        `,
        '<div class="default"><p>content</p></div>',
      ],
      [
        'revv() method is available',
        dedent`
          block content
            p!=revv("style.css")
        `,
        '<div class="default"><p>style.css</p></div>',
      ],
      [
        'img() method is available',
        dedent`
          block content
            p!=img("cover.png")
        `,
        '<div class="default"><p>cover.png</p></div>',
      ],
      [
        '+times() mixin is available',
        dedent`
          block content
            +times(2)
              p Text
        `,
        '<div class="default"><p>Text</p><p>Text</p></div>',
      ],
      [
        'custom mixins are available',
        dedent`
          block content
            +test_mixin()
        `,
        '<div class="default"><p>test mixin content</p></div>',
      ],
      [
        'frontmatter is available as data.meta',
        dedent`
        //- ---
        //- title: My title
        //- ---
          block content
            p=data.meta.title
        `,
        '<div class="default"><p>My title</p></div>',
      ],
    ])('%s', async (_name, source, expected) => {
      const actual = await current.convert(source);
      expect(actual).toEqual(expected);
    });
  });
  describe('errors', () => {
    it.each([
      [
        'Invalid syntax',
        dedent`
          block content
            p.invalid:syntax foo
        `,
        'Unexpected token',
      ],
      [
        'Missing data',
        dedent`
          block content
            p=nope.nope
        `,
        'Cannot read property',
      ],
      [
        'Missing layout',
        dedent`
          //- ---
          //- layout: nope
          //- ---
          block content
            p foo
        `,
        'Missing layout: nope',
      ],
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
  describe('frontMatter', () => {
    it.each([
      ['No frontmatter', '.container Content', {}, '.container Content'],
      [
        'One key in frontmatter',
        dedent`
        //- ---
        //- title: My title
        //- ---
        
        .container Content
        `,
        {
          title: 'My title',
        },
        '.container Content',
      ],
      [
        'Multiple keysin frontmatter',
        dedent`
        //- ---
        //- title: My title
        //- description: My description
        //- ---
        
        .container Content
        `,
        {
          title: 'My title',
          description: 'My description',
        },
        '.container Content',
      ],
      [
        'Unclosed frontmatter',
        dedent`
        //- ---
        
        .container Content
        `,
        {},
        '//- ---\n\n.container Content',
      ],
    ])('%s', async (_name, pugSource, attributes, body) => {
      const actual = current.frontMatter(pugSource);
      expect(actual).toHaveProperty('attributes', attributes);
      expect(actual).toHaveProperty('body', body);
    });
  });
});
