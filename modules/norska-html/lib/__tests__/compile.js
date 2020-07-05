const current = require('../main');
const config = require('norska-config');
const data = require('norska-data');
const helper = require('norska-helper');
const revv = require('norska-revv');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const writeJson = require('firost/lib/writeJson');

describe('norska-html > compile', () => {
  const tmpDirectory = './tmp/norska-html/compile';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await emptyDir(tmpDirectory);
    jest.spyOn(current, '__consoleWarn').mockReturnValue();
    data.clearCache();
  });
  describe('simple files', () => {
    it('index.pug', async () => {
      const input = config.fromPath(testName);
      const output = config.toPath('index.html');
      await write('p foo', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>foo</p>');
    });
    it('foo.pug', async () => {
      const input = config.fromPath(testName);
      const output = config.toPath('foo/index.html');
      await write('p foo', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>foo</p>');
    });
    it('subdir/deep/index.pug', async () => {
      const input = config.fromPath(testName);
      const output = config.toPath('subdir/deep/index.html');
      await write('p foo', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>foo</p>');
    });
    it('should contain data from _data/', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      const dataFile = config.fromPath('_data/foo.json');
      await write('p=data.foo.bar', input);
      await writeJson({ bar: 'baz' }, dataFile);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>baz</p>');
    });
    it('should fail if file is not in the source folder', async () => {
      const input = '/nope/nope.pug';

      const actual = await current.compile(input);
      expect(actual).toEqual(false);
      expect(current.__consoleWarn).toHaveBeenCalled();
    });
  });
  describe('urls', () => {
    it('should have url.here in root', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=url.here', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>/index.html</p>');
    });
    it('should have url.here in subfolders', async () => {
      const input = config.fromPath('deep/down/index.pug');
      const output = config.toPath('deep/down/index.html');
      await write('p=url.here', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>/deep/down/index.html</p>');
    });
    it('should have url.base in dev', async () => {
      jest.spyOn(helper, 'isProduction').mockReturnValue(false);
      const port = config.get('port');
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=url.base', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual(`<p>http://127.0.0.1:${port}</p>`);
    });
    it('should have url.base in prod', async () => {
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      const dataFile = config.fromPath('_data/site.json');
      await write('p=url.base', input);
      await writeJson({ url: 'http://www.prod.com/' }, dataFile);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>http://www.prod.com/</p>');
    });
    it('should have url.pathToRoot in subfolders', async () => {
      const input = config.fromPath('deep/down/index.pug');
      const output = config.toPath('deep/down/index.html');
      await write('p=url.pathToRoot', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>../../</p>');
    });
    it('should have url.pathToRoot in root', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=url.pathToRoot', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>./</p>');
    });
  });
  describe('files', () => {
    it('should have files.js', async () => {
      config.set('runtime.jsFiles', ['script.js', 'vendors.js']);
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=runtime.jsFiles', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>script.js,vendors.js</p>');
    });
    it('should be empty by default', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=runtime.jsFiles', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p></p>');
    });
  });
  describe('with layout', () => {
    beforeEach(async () => {
      await write('p layout', config.fromPath('_includes/layout.pug'));
    });
    it('relative from root', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('extends _includes/layout', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>layout</p>');
    });
    it('absolute from root', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('extends /_includes/layout', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>layout</p>');
    });
    it('relative from subroot', async () => {
      const input = config.fromPath('deep/index.pug');
      const output = config.toPath('deep/index.html');
      await write('extends ../_includes/layout', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>layout</p>');
    });
    it('absolute from subroot', async () => {
      const input = config.fromPath('deep/index.pug');
      const output = config.toPath('deep/index.html');
      await write('extends /_includes/layout', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>layout</p>');
    });
  });
  describe('compilation error', () => {
    it('should throw if invalid syntax', async () => {
      const input = config.fromPath('index.pug');
      await write('p.invalid:syntax foo', input);

      let actual = null;
      try {
        await current.compile(input);
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ERROR_HTML_COMPILATION_FAILED');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching('Unexpected token')
      );
    });
    it('should throw if missing object key', async () => {
      const input = config.fromPath('index.pug');
      await write('p=foo.key', input);

      let actual = null;
      try {
        await current.compile(input);
      } catch (error) {
        actual = error;
      }

      expect(actual).toHaveProperty('code', 'ERROR_HTML_COMPILATION_FAILED');
      expect(actual).toHaveProperty(
        'message',
        expect.stringMatching("Cannot read property 'key'")
      );
    });
  });
  describe('custom methods', () => {
    it('should contain lodash', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=_.keys({foo: "bar"})', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toEqual('<p>foo</p>');
    });
    describe('markdown', () => {
      it('should allow converting markdown', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await write('div !{markdown("# foo")}', input);

        await current.compile(input);

        const actual = await read(output);
        expect(actual).toEqual('<div><h1>foo</h1></div>');
      });
      it.each([
        ['javascript', 'var x = 42;'],
        ['html', '<strong>O</strong>'],
        ['css', '.here { background: red; }'],
        ['json', '{}'],
        ['pug', '.bold.white text'],
        ['yaml', 'name: aberlaas'],
      ])('should highlight %s', async (languageName, codeExample) => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');

        const markdownContent = `\`\`\`${languageName}\\r${codeExample}\\r\`\`\``;
        await write(
          dedent`
          - markdownContent = "${markdownContent}";
          div !{markdown(markdownContent)}
          `,
          input
        );

        await current.compile(input);

        const actual = await read(output);
        expect(actual).toEqual(
          expect.stringContaining(`language-${languageName}`)
        );
      });
    });
    describe('include', () => {
      it('should include file content', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await write('p=include("include.txt")', input);
        await write('foo', config.fromPath('include.txt'));

        await current.compile(input);

        const actual = await read(output);
        expect(actual).toEqual('<p>foo</p>');
      });
      it('should return an error placeholder if file does not exist', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await write('p=include("include.txt")', input);

        await current.compile(input);

        const actual = await read(output);
        expect(actual).toMatch(new RegExp('<p>ERROR: (.*)</p>'));
      });
      describe('pug', () => {
        it('should parse pug file content', async () => {
          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await write('p !{include("include.pug")}', input);
          await write('strong.bg-red foo', config.fromPath('include.pug'));

          await current.compile(input);

          const actual = await read(output);
          expect(actual).toEqual('<p><strong class="bg-red">foo</strong></p>');
        });
        it('included file should contain lodash', async () => {
          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await write('p !{include("include.pug")}', input);
          await write(
            'strong=_.keys({ foo: "bar"})',
            config.fromPath('include.pug')
          );

          await current.compile(input);

          const actual = await read(output);
          expect(actual).toEqual('<p><strong>foo</strong></p>');
        });
        it('included file should contain top level data', async () => {
          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await write('p !{include("include.pug")}', input);
          await write('strong=data.foo.bar', config.fromPath('include.pug'));
          await writeJson({ bar: 'baz' }, config.fromPath('_data/foo.json'));

          await current.compile(input);

          const actual = await read(output);
          expect(actual).toEqual('<p><strong>baz</strong></p>');
        });
        it('recursive includes should work', async () => {
          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await write('p !{include("include.pug")}', input);
          await write(
            'span !{include("include2.pug")}',
            config.fromPath('include.pug')
          );
          await write('strong foo', config.fromPath('include2.pug'));

          await current.compile(input);

          const actual = await read(output);
          expect(actual).toEqual('<p><span><strong>foo</strong></span></p>');
        });
      });
    });
    describe('revv', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should add the file to the revv manifest', async () => {
        const input = config.fromPath('index.pug');
        await write('a(href=revv("foo.txt")) foo', input);

        await current.compile(input);

        const actual = revv.manifest();
        expect(actual).toHaveProperty(['foo.txt'], null);
      });
      it('should return a {revv: path} placeholder', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await write('a(href=revv("foo.txt")) foo', input);

        await current.compile(input);

        const actual = await read(output);
        expect(actual).toEqual('<a href="{revv: foo.txt}">foo</a>');
      });
      it('should keep the same path in dev', async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(false);

        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await write('a(href=revv("foo.txt")) foo', input);

        await current.compile(input);

        const actual = await read(output);
        expect(actual).toEqual('<a href="foo.txt">foo</a>');
      });
    });
  });
  describe('tweaks', () => {
    it('should contain ensureUrlTrailingSlashSource', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=tweaks.ensureUrlTrailingSlashSource', input);

      await current.compile(input);

      const actual = await read(output);
      expect(actual).toStartWith('<p>(function(){');
      expect(actual).toEndWith('})()</p>');
    });
  });
  describe('runtime', () => {
    it('shoud contain the last git commit', async () => {
      const input = config.fromPath('index.pug');
      const output = config.toPath('index.html');
      await write('p=runtime.gitCommit', input);

      await current.compile(input);

      const actual = await read(output);
      const expected = new RegExp('^<p>[0-9a-f]{7}</p>$');
      expect(actual).toMatch(expected);
    });
  });
});
