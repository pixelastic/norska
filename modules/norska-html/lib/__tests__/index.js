import module from '../index';
import config from 'norska-config';
import data from 'norska-data';
import helper from 'norska-helper';
import revv from 'norska-revv';
import firost from 'firost';

describe('norska-html', () => {
  const tmpDirectory = './tmp/norska-html/index';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await firost.emptyDir(tmpDirectory);
  });
  describe('pugFilesPattern', () => {
    it('should find pug file in source', async () => {
      await firost.write('dummy', config.fromPath('index.pug'));
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).toContain(config.fromPath('index.pug'));
    });
    it('should find pug file in sub directory of source', async () => {
      await firost.write('dummy', config.fromPath('subdir/index.pug'));
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).toContain(config.fromPath('subdir/index.pug'));
    });
    it('should not find files in _directories', async () => {
      await firost.write('dummy', config.fromPath('_subdir/index.pug'));
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).not.toContain(config.fromPath('_subdir/index.pug'));
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
      data.clearCache();
    });
    describe('simple files', () => {
      it('index.html', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p foo', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>foo</p>');
      });
      it('subdir/index.html', async () => {
        const input = config.fromPath('subdir/index.pug');
        const output = config.toPath('subdir/index.html');
        await firost.write('p foo', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>foo</p>');
      });
      it('subdir/deep/index.html', async () => {
        const input = config.fromPath('subdir/deep/index.pug');
        const output = config.toPath('subdir/deep/index.html');
        await firost.write('p foo', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>foo</p>');
      });
      it('should contain data from _data/', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        const dataFile = config.fromPath('_data/foo.json');
        await firost.write('p=data.foo.bar', input);
        await firost.writeJson({ bar: 'baz' }, dataFile);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>baz</p>');
      });
      it('should fail if file is not in the source folder', async () => {
        const input = '/nope/nope.pug';

        const actual = await module.compile(input);
        expect(actual).toEqual(false);
        expect(helper.consoleWarn).toHaveBeenCalled();
      });
    });
    describe('urls', () => {
      it('should have url.here in root', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p=url.here', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>/index.html</p>');
      });
      it('should have url.here in subfolders ', async () => {
        const input = config.fromPath('deep/down/index.pug');
        const output = config.toPath('deep/down/index.html');
        await firost.write('p=url.here', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>/deep/down/index.html</p>');
      });
      it('should have url.base in dev', async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(false);
        const port = config.get('port');
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p=url.base', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual(`<p>http://127.0.0.1:${port}</p>`);
      });
      it('should have url.base in prod', async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        const dataFile = config.fromPath('_data/site.json');
        await firost.write('p=url.base', input);
        await firost.writeJson({ url: 'http://www.prod.com/' }, dataFile);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>http://www.prod.com/</p>');
      });
      it('should have url.pathToRoot in subfolders ', async () => {
        const input = config.fromPath('deep/down/index.pug');
        const output = config.toPath('deep/down/index.html');
        await firost.write('p=url.pathToRoot', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>../../</p>');
      });
      it('should have url.pathToRoot in root ', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p=url.pathToRoot', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>./</p>');
      });
    });
    describe('files', () => {
      it('should have files.js', async () => {
        config.set('runtime.jsFiles', ['script.js', 'vendors.js']);
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p=runtime.jsFiles', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>script.js,vendors.js</p>');
      });
      it('should be empty by default', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p=runtime.jsFiles', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p></p>');
      });
    });
    describe('with layout', () => {
      beforeEach(async () => {
        await firost.write('p layout', config.fromPath('_includes/layout.pug'));
      });
      it('relative from root', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('extends _includes/layout', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>layout</p>');
      });
      it('absolute from root', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('extends /_includes/layout', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>layout</p>');
      });
      it('relative from subroot', async () => {
        const input = config.fromPath('deep/index.pug');
        const output = config.toPath('deep/index.html');
        await firost.write('extends ../_includes/layout', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>layout</p>');
      });
      it('absolute from subroot', async () => {
        const input = config.fromPath('deep/index.pug');
        const output = config.toPath('deep/index.html');
        await firost.write('extends /_includes/layout', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>layout</p>');
      });
    });
    describe('compilation error', () => {
      it('should throw if invalid syntax', async () => {
        const input = config.fromPath('index.pug');
        await firost.write('p.invalid:syntax foo', input);

        let actual = null;
        try {
          await module.compile(input);
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
        await firost.write('p=foo.key', input);

        let actual = null;
        try {
          await module.compile(input);
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
        await firost.write('p=_.keys({foo: "bar"})', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>foo</p>');
      });
      it('should allow converting markdown', async () => {
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('div !{markdown("# foo")}', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<div><h1>foo</h1></div>');
      });
      describe('include', () => {
        it('should include file content', async () => {
          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await firost.write('p=include("include.txt")', input);
          await firost.write('foo', config.fromPath('include.txt'));

          await module.compile(input);

          const actual = await firost.read(output);
          expect(actual).toEqual('<p>foo</p>');
        });
        it('should return an error placeholder if file does not exist', async () => {
          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await firost.write('p=include("include.txt")', input);

          await module.compile(input);

          const actual = await firost.read(output);
          expect(actual).toMatch(new RegExp('<p>ERROR: (.*)</p>'));
        });
        describe('pug', () => {
          it('should parse pug file content', async () => {
            const input = config.fromPath('index.pug');
            const output = config.toPath('index.html');
            await firost.write('p !{include("include.pug")}', input);
            await firost.write(
              'strong.bg-red foo',
              config.fromPath('include.pug')
            );

            await module.compile(input);

            const actual = await firost.read(output);
            expect(actual).toEqual(
              '<p><strong class="bg-red">foo</strong></p>'
            );
          });
          it('included file should contain lodash', async () => {
            const input = config.fromPath('index.pug');
            const output = config.toPath('index.html');
            await firost.write('p !{include("include.pug")}', input);
            await firost.write(
              'strong=_.keys({ foo: "bar"})',
              config.fromPath('include.pug')
            );

            await module.compile(input);

            const actual = await firost.read(output);
            expect(actual).toEqual('<p><strong>foo</strong></p>');
          });
          it('included file should contain top level data', async () => {
            const input = config.fromPath('index.pug');
            const output = config.toPath('index.html');
            await firost.write('p !{include("include.pug")}', input);
            await firost.write(
              'strong=data.foo.bar',
              config.fromPath('include.pug')
            );
            await firost.writeJson(
              { bar: 'baz' },
              config.fromPath('_data/foo.json')
            );

            await module.compile(input);

            const actual = await firost.read(output);
            expect(actual).toEqual('<p><strong>baz</strong></p>');
          });
          it('recursive includes should work', async () => {
            const input = config.fromPath('index.pug');
            const output = config.toPath('index.html');
            await firost.write('p !{include("include.pug")}', input);
            await firost.write(
              'span !{include("include2.pug")}',
              config.fromPath('include.pug')
            );
            await firost.write('strong foo', config.fromPath('include2.pug'));

            await module.compile(input);

            const actual = await firost.read(output);
            expect(actual).toEqual('<p><span><strong>foo</strong></span></p>');
          });
        });
      });
      describe('revv', () => {
        beforeEach(() => {
          jest.spyOn(helper, 'isProduction').mockReturnValue(true);
          firost.cache.clear(revv.cacheKey);
        });
        it('should add the file to the revv manifest', async () => {
          const input = config.fromPath('index.pug');
          await firost.write('a(href=revv("foo.txt")) foo', input);

          await module.compile(input);

          const actual = revv.manifest();
          expect(actual).toHaveProperty(['foo.txt'], null);
        });
        it('should return a {revv: path} placeholder', async () => {
          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await firost.write('a(href=revv("foo.txt")) foo', input);

          await module.compile(input);

          const actual = await firost.read(output);
          expect(actual).toEqual('<a href="{revv: foo.txt}">foo</a>');
        });
        it('should keep the same path in dev', async () => {
          jest.spyOn(helper, 'isProduction').mockReturnValue(false);

          const input = config.fromPath('index.pug');
          const output = config.toPath('index.html');
          await firost.write('a(href=revv("foo.txt")) foo', input);

          await module.compile(input);

          const actual = await firost.read(output);
          expect(actual).toEqual('<a href="foo.txt">foo</a>');
        });
      });
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest
        .spyOn(firost, 'spinner')
        .mockReturnValue({ tick() {}, success() {}, failure() {} });
    });
    describe('excluded files', () => {
      it('folder starting with _ should not be processed', async () => {
        await firost.write('p foo', config.fromPath('_foo/index.pug'));

        await module.run();

        const actual = await firost.exist(config.toPath('_foo/index.html'));
        expect(actual).toEqual(false);
      });
    });
    describe('compilation error', () => {
      it('should throw if one of the compilation fails', async () => {
        await firost.write('p foo', config.fromPath('index.pug'));
        await firost.write(
          'p.invalid:syntax foo',
          config.fromPath('error.pug')
        );

        let actual = null;
        try {
          await module.run();
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ERROR_HTML_COMPILATION_FAILED');
      });
    });
  });
});
