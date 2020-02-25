const module = require('../main');
const config = require('norska-config');
const data = require('norska-data');
const pEvent = require('p-event');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const unwatchAll = require('firost/lib/unwatchAll');
const waitForWatchers = require('firost/lib/waitForWatchers');
const mkdirp = require('firost/lib/mkdirp');
const writeJson = require('firost/lib/writeJson');
const uuid = require('firost/lib/uuid');

describe('norska-html', () => {
  const tmpDirectory = './tmp/norska-html/slow';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await emptyDir(tmpDirectory);
  });
  describe('watch', () => {
    beforeEach(async () => {
      jest.spyOn(module, '__consoleWarn').mockReturnValue();
      jest.spyOn(module, '__consoleSuccess').mockReturnValue();
      await mkdirp(config.from());
      data.clearCache();
      jest
        .spyOn(module, '__spinner')
        .mockReturnValue({ tick() {}, success() {}, failure() {} });
    });
    afterEach(async () => {
      await unwatchAll();
    });
    describe('individual files', () => {
      it('should recompile individual pug files when changed', async () => {
        await write('p foo', config.fromPath('index.pug'));
        await module.watch();
        await write('p bar', config.fromPath('index.pug'));

        await waitForWatchers();
        const actual = await read(config.toPath('index.html'));
        expect(actual).toEqual('<p>bar</p>');
      });
      it('should compile individual pug files when created', async () => {
        await module.watch();
        await write('p foo', config.fromPath('index.pug'));

        await waitForWatchers();
        const actual = await read(config.toPath('index.html'));
        expect(actual).toEqual('<p>foo</p>');
      });
    });
    describe('_data/', () => {
      describe('json', () => {
        it('should run everything when files in _data/ are created', async () => {
          await write('p=data.foo.bar', config.fromPath('index.pug'));
          await module.watch();
          await writeJson({ bar: 'baz' }, config.fromPath('_data/foo.json'));

          await waitForWatchers();
          const actual = await read(config.toPath('index.html'));
          expect(actual).toEqual('<p>baz</p>');
        });
        it('should run everything when files in _data/ are modified', async () => {
          await writeJson({ bar: 'baz' }, config.fromPath('_data/foo.json'));
          await write('p=data.foo.bar', config.fromPath('index.pug'));
          await module.watch();
          await writeJson({ bar: 'quxx' }, config.fromPath('_data/foo.json'));

          await waitForWatchers();
          const actual = await read(config.toPath('index.html'));
          expect(actual).toEqual('<p>quxx</p>');
        });
      });
      describe('js', () => {
        it('should run everything when files in _data/ are created', async () => {
          const uniqueId = uuid();
          await write(
            `p=data['${uniqueId}'].bar`,
            config.fromPath('index.pug')
          );
          await module.watch();
          await write(
            'module.exports = { bar: "baz" }',
            config.fromPath(`_data/${uniqueId}.js`)
          );

          await waitForWatchers();
          const actual = await read(config.toPath('index.html'));
          expect(actual).toEqual('<p>baz</p>');
        });
        it('should run everything when .js files in _data/ are modified', async () => {
          jest.spyOn(data, 'updateCache');
          const uniqueId = uuid();
          await write(
            'module.exports = { bar: "baz" }',
            config.fromPath(`_data/${uniqueId}.js`)
          );
          await write(
            `p=data['${uniqueId}'].bar`,
            config.fromPath('index.pug')
          );
          await module.watch();
          await write(
            'module.exports = { bar: "quxx" }',
            config.fromPath(`_data/${uniqueId}.js`)
          );

          await waitForWatchers();

          expect(data.updateCache).toHaveBeenCalled();
        });
      });
    });
    describe('includes', () => {
      describe('pug', () => {
        it('should run everything when an included file is added', async () => {
          await write(
            'extends /_includes/layout',
            config.fromPath('index.pug')
          );
          await module.watch();
          await write('p foo', config.fromPath('_includes/layout.pug'));

          await waitForWatchers();
          const actual = await read(config.toPath('index.html'));
          expect(actual).toEqual('<p>foo</p>');
        });
        it('should run everything when an included file is modified', async () => {
          await write(
            'extends /_includes/layout',
            config.fromPath('index.pug')
          );
          await write('p foo', config.fromPath('_includes/layout.pug'));
          await module.watch();
          await write('p bar', config.fromPath('_includes/layout.pug'));

          await waitForWatchers();
          const actual = await read(config.toPath('index.html'));
          expect(actual).toEqual('<p>bar</p>');
        });
      });
      describe('any extension', () => {
        it('should run everything when an included file is added', async () => {
          await write(
            'include /_includes/include.txt',
            config.fromPath('index.pug')
          );
          await module.watch();
          await write('foo', config.fromPath('_includes/include.txt'));

          await waitForWatchers();
          const actual = await read(config.toPath('index.html'));
          expect(actual).toEqual('foo');
        });
        it('should run everything when an included file is modified', async () => {
          await write(
            'include /_includes/include.txt',
            config.fromPath('index.pug')
          );
          await write('foo', config.fromPath('_includes/include.txt'));
          await module.watch();
          await write('bar', config.fromPath('_includes/include.txt'));

          await waitForWatchers();
          const actual = await read(config.toPath('index.html'));
          expect(actual).toEqual('bar');
        });
      });
    });
    describe('runtime.jsFiles', () => {
      beforeEach(async () => {
        config.set('runtime.jsFiles', []);
      });
      it('should run everything whenever the runtime.jsFiles is updated', async () => {
        await write('p=runtime.jsFiles', config.fromPath('index.pug'));
        await module.watch();
        config.set('runtime.jsFiles', ['anything.js']);

        await pEvent(module.pulse, 'run');
        const actual = await read(config.toPath('index.html'));
        expect(actual).toEqual('<p>anything.js</p>');
      });
    });
    describe('compilation errors', () => {
      beforeEach(() => {
        jest.spyOn(module, '__consoleError').mockReturnValue();
      });
      it('should display the errors', async () => {
        await module.watch();
        await write('p.invalid:syntax foo', config.fromPath('error.pug'));

        await waitForWatchers();

        expect(module.__consoleError).toHaveBeenCalledWith(
          expect.stringMatching('Unexpected token')
        );
      });
    });
  });
});
