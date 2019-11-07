import module from '../index';
import config from 'norska-config';
import data from 'norska-data';
import helper from 'norska-helper';
import firost from 'firost';

describe('norska-html', () => {
  const tmpDirectory = './tmp/norska-html/slow';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await firost.emptyDir(tmpDirectory);
  });
  describe('watch', () => {
    beforeEach(async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
      await firost.mkdirp(config.from());
      data.clearCache();
      jest.spyOn(helper, 'consoleSuccess').mockReturnValue();
      jest
        .spyOn(firost, 'spinner')
        .mockReturnValue({ tick() {}, success() {}, failure() {} });
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
      describe('json', () => {
        it('should run everything when files in _data/ are created', async () => {
          await firost.write('p=data.foo.bar', config.fromPath('index.pug'));
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
          await firost.write('p=data.foo.bar', config.fromPath('index.pug'));
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
      describe('js', () => {
        it('should run everything when files in _data/ are created', async () => {
          const uuid = firost.uuid();
          await firost.write(
            `p=data['${uuid}'].bar`,
            config.fromPath('index.pug')
          );
          await module.watch();
          await firost.write(
            'export default { bar: "baz" }',
            config.fromPath(`_data/${uuid}.js`)
          );

          await firost.waitForWatchers();
          const actual = await firost.read(config.toPath('index.html'));
          expect(actual).toEqual('<p>baz</p>');
        });
        it('should run everything when .js files in _data/ are modified', async () => {
          const uuid = firost.uuid();
          await firost.write(
            'export default { bar: "baz" }',
            config.fromPath(`_data/${uuid}.js`)
          );
          await firost.write(
            `p=data['${uuid}'].bar`,
            config.fromPath('index.pug')
          );
          await module.watch();
          await firost.write(
            'export default { bar: "quxx" }',
            config.fromPath(`_data/${uuid}.js`)
          );

          await firost.waitForWatchers();
          const actual = await firost.read(config.toPath('index.html'));
          expect(actual).toEqual('<p>quxx</p>');
        });
      });
    });
    describe('includes', () => {
      describe('pug', () => {
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
      describe('any extension', () => {
        it('should run everything when an included file is added', async () => {
          await firost.write(
            'include /_includes/include.txt',
            config.fromPath('index.pug')
          );
          await module.watch();
          await firost.write('foo', config.fromPath('_includes/include.txt'));

          await firost.waitForWatchers();
          const actual = await firost.read(config.toPath('index.html'));
          expect(actual).toEqual('foo');
        });
        it('should run everything when an included file is modified', async () => {
          await firost.write(
            'include /_includes/include.txt',
            config.fromPath('index.pug')
          );
          await firost.write('foo', config.fromPath('_includes/include.txt'));
          await module.watch();
          await firost.write('bar', config.fromPath('_includes/include.txt'));

          await firost.waitForWatchers();
          const actual = await firost.read(config.toPath('index.html'));
          expect(actual).toEqual('bar');
        });
      });
    });
    describe('compilation errors', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'consoleError').mockReturnValue();
      });
      it('should display the errors', async () => {
        await module.watch();
        await firost.write(
          'p.invalid:syntax foo',
          config.fromPath('error.pug')
        );

        await firost.waitForWatchers();

        expect(helper.consoleError).toHaveBeenCalledWith(
          expect.stringMatching('Unexpected token')
        );
      });
    });
  });
});
