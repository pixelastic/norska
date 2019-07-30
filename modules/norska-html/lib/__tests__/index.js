import module from '../index';
import config from 'norska-config';
import helper from 'norska-helper';
import firost from 'firost';
import pug from 'pug';
import { chalk } from 'golgoth';

describe('norska-html', () => {
  beforeEach(async () => {
    await config.init({
      from: './tmp/norska-html/src',
      to: './tmp/norska-html/dist',
    });
    await firost.emptyDir('./tmp/norska-html');
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
      it('should contain data from _data.json', async () => {
        jest.spyOn(helper, 'siteData').mockReturnValue({ foo: { bar: 'baz' } });
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p=foo.bar', input);

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
        jest
          .spyOn(helper, 'siteData')
          .mockReturnValue({ site: { url: 'http://www.prod.com/' } });
        const input = config.fromPath('index.pug');
        const output = config.toPath('index.html');
        await firost.write('p=url.base', input);

        await module.compile(input);

        const actual = await firost.read(output);
        expect(actual).toEqual('<p>http://www.prod.com/</p>');
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
      beforeEach(() => {
        jest.spyOn(pug, 'compile').mockImplementation(() => {
          throw { toString: jest.fn().mockReturnValue('pug error') };
        });
        jest.spyOn(chalk, 'red').mockImplementation(input => {
          return `${input} in red`;
        });
        jest.spyOn(helper, 'consoleError').mockReturnValue();
      });
      it('should display an error if compilation fails', async () => {
        const input = config.fromPath('index.pug');
        await firost.write('p foo', input);

        await module.compile(input);

        expect(helper.consoleError).toHaveBeenCalledWith('pug error in red');
      });
      it('should return false if compilation fails', async () => {
        const input = config.fromPath('index.pug');
        await firost.write('p foo', input);

        const actual = await module.compile(input);

        expect(actual).toEqual(false);
      });
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
    });
    describe('excluded files', () => {
      it('folder starting with _ should not be processed', async () => {
        await firost.write('p foo', config.fromPath('_foo/index.pug'));

        await module.run();

        const actual = await firost.exist(config.toPath('_foo/index.html'));
        expect(actual).toEqual(false);
      });
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
      await firost.mkdirp(config.from());
    });
    afterEach(async () => {
      await firost.unwatchAll();
    });
    describe('individual files', () => {
      it('should recompile individual pug files when changed', async () => {
        await firost.write('p foo', config.fromPath('index.pug'));
        await module.watch();
        await firost.write('p bar', config.fromPath('index.pug'));

        await firost.waitForWatchers();
        const actual = await firost.read(config.toPath('index.html'));
        expect(actual).toEqual('<p>bar</p>');
      });
      it('should compile individual pug files when created', async () => {
        await module.watch();
        await firost.write('p foo', config.fromPath('index.pug'));

        await firost.waitForWatchers();
        const actual = await firost.read(config.toPath('index.html'));
        expect(actual).toEqual('<p>foo</p>');
      });
    });
    describe('_data/', () => {
      it('should run everything when files in _data/ are created', async () => {
        await firost.write('p=foo.bar', config.fromPath('index.pug'));
        await module.watch();
        await firost.writeJson(
          { bar: 'baz' },
          config.fromPath('_data/foo.json')
        );

        await firost.waitForWatchers();
        const actual = await firost.read(config.toPath('index.html'));
        expect(actual).toEqual('<p>baz</p>');
      });
      it('should run everything when files in _data/ are modified', async () => {
        await firost.writeJson(
          { bar: 'baz' },
          config.fromPath('_data/foo.json')
        );
        await firost.write('p=foo.bar', config.fromPath('index.pug'));
        await module.watch();
        await firost.writeJson(
          { bar: 'quxx' },
          config.fromPath('_data/foo.json')
        );

        await firost.waitForWatchers();
        const actual = await firost.read(config.toPath('index.html'));
        expect(actual).toEqual('<p>quxx</p>');
      });
    });
    describe('includes', () => {
      it('should run everything when an included file is added', async () => {
        await firost.write(
          'extends /_includes/layout',
          config.fromPath('index.pug')
        );
        await module.watch();
        await firost.write('p foo', config.fromPath('_includes/layout.pug'));

        await firost.waitForWatchers();
        const actual = await firost.read(config.toPath('index.html'));
        expect(actual).toEqual('<p>foo</p>');
      });
      it('should run everything when an included file is modified', async () => {
        await firost.write(
          'extends /_includes/layout',
          config.fromPath('index.pug')
        );
        await firost.write('p foo', config.fromPath('_includes/layout.pug'));
        await module.watch();
        await firost.write('p bar', config.fromPath('_includes/layout.pug'));

        await firost.waitForWatchers();
        const actual = await firost.read(config.toPath('index.html'));
        expect(actual).toEqual('<p>bar</p>');
      });
    });
  });
});
