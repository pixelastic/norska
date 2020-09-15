const current = require('../main');
const path = require('path');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');

describe('norska-config', () => {
  const tmpDirectory = path.resolve('./tmp/norska-config');
  describe('defaultConfig', () => {
    it('should set the default port', () => {
      const actual = current.defaultConfig();

      expect(actual).toHaveProperty('port');
    });
    it('should set the default root as the current folder', async () => {
      const actual = current.defaultConfig();

      expect(actual).toHaveProperty('root', process.cwd());
    });
    it('should set the default source folder', () => {
      const actual = current.defaultConfig();

      expect(actual).toHaveProperty('from', './src');
    });
    it('should set the default destination folder', () => {
      const actual = current.defaultConfig();

      expect(actual).toHaveProperty('to', './dist');
    });
    it('should have an empty list of jsFiles', () => {
      const actual = current.defaultConfig();

      expect(actual).toHaveProperty('runtime.jsFiles', []);
    });
  });
  describe('cliConfig', () => {
    it('should not return the positional arguments', () => {
      const input = { _: ['foo', 'bar'], from: 'foo' };
      const actual = current.cliConfig(input);

      expect(actual).not.toHaveProperty('_');
    });
    it('should split dot notation into objects', () => {
      const input = { 'foo.bar': 'baz' };
      const actual = current.cliConfig(input);

      expect(actual).toHaveProperty('foo', { bar: 'baz' });
    });
  });
  describe('init', () => {
    it('should set __config with default values', async () => {
      const defaultConfig = current.defaultConfig();
      await current.init();

      expect(current).toHaveProperty('__config.root', defaultConfig.root);
      expect(current).toHaveProperty('__config.port', defaultConfig.port);
    });
    it('current config should extend base config', async () => {
      await current.init({}, { foo: 'ok', hooks: { foo: 'ok' } });

      expect(current).toHaveProperty('__config.foo', 'ok');
      expect(current).toHaveProperty('__config.hooks.foo', 'ok');
    });
    it('current config should be able to override default config', async () => {
      await current.init({}, { port: 'ok' });

      expect(current).toHaveProperty('__config.port', 'ok');
    });
    it('file config should overwrite default config', async () => {
      jest.spyOn(current, 'fileConfig').mockReturnValue({ port: 'ok' });

      await current.init();

      expect(current).toHaveProperty('__config.port', 'ok');
    });
    it('file config should be able to overwrite only leaves of current config', async () => {
      const currentsConfig = { sub: { foo: 'nope', bar: 'ok' } };
      jest.spyOn(current, 'fileConfig').mockReturnValue({ sub: { foo: 'ok' } });

      await current.init({}, currentsConfig);

      expect(current).toHaveProperty('__config.sub.foo', 'ok');
    });
    it('CLI args should be able to overwrite any key', async () => {
      jest.spyOn(current, 'fileConfig').mockReturnValue({ port: 'nope' });

      await current.init({ port: 'ok' }, { port: 'nope' });

      expect(current).toHaveProperty('__config.port', 'ok');
    });
    it('CLI args should be able to overwrite any deep key', async () => {
      jest
        .spyOn(current, 'fileConfig')
        .mockReturnValue({ one: { two: { foo: 'nope' } } });

      await current.init(
        { one: { two: { foo: 'ok', bar: 'ok' } } },
        { one: { two: { bar: 'nope' } } }
      );

      expect(current).toHaveProperty('__config.one.two.foo', 'ok');
      expect(current).toHaveProperty('__config.one.two.bar', 'ok');
    });
    it('CLI args should be able to create nested objects', async () => {
      jest
        .spyOn(current, 'cliConfig')
        .mockReturnValue({ css: { subcurrent: { key: 'qux' } } });

      await current.init();

      expect(current).toHaveProperty('__config.css.subcurrent.key', 'qux');
    });
    it('from and to should be relative to the root', async () => {
      await current.init({ root: tmpDirectory, from: './foo', to: './bar' });

      expect(current).toHaveProperty('__config.from', `${tmpDirectory}/foo`);
      expect(current).toHaveProperty('__config.to', `${tmpDirectory}/bar`);
    });
    it('from and to path should stay absolute if given as absolute', async () => {
      await current.init({
        from: `${tmpDirectory}/custom-from`,
        to: `${tmpDirectory}/custom-to`,
      });

      expect(current).toHaveProperty(
        '__config.from',
        `${tmpDirectory}/custom-from`
      );
      expect(current).toHaveProperty(
        '__config.to',
        `${tmpDirectory}/custom-to`
      );
    });
    it('Deep CLI args should only change deep keys, not whole object', async () => {
      const currentsConfig = { deep: { foo: 'yes', bar: 'yes' } };
      jest.spyOn(current, 'fileConfig').mockReturnValue({});
      jest.spyOn(current, 'cliConfig').mockReturnValue({ deep: { foo: 'no' } });

      await current.init({}, currentsConfig);

      expect(current).toHaveProperty('__config.deep.foo', 'no');
      expect(current).toHaveProperty('__config.deep.bar', 'yes');
    });
    it('norska.config.js should be loaded from the default root', async () => {
      jest
        .spyOn(current, 'defaultConfig')
        .mockReturnValue({ root: 'defaultRoot', from: 'src', to: 'dist' });
      jest.spyOn(current, 'fileConfig').mockReturnValue({});
      jest.spyOn(current, 'cliConfig').mockReturnValue({});

      await current.init({}, {});

      expect(current.fileConfig).toHaveBeenCalledWith('defaultRoot');
    });
    it('norska.config.js should be loaded from --root root', async () => {
      jest
        .spyOn(current, 'defaultConfig')
        .mockReturnValue({ root: 'defaultRoot', from: 'src', to: 'dist' });
      jest.spyOn(current, 'fileConfig').mockReturnValue({});
      jest.spyOn(current, 'cliConfig').mockReturnValue({ root: 'customRoot' });

      await current.init({}, {});

      expect(current.fileConfig).toHaveBeenCalledWith(
        expect.stringContaining('customRoot')
      );
    });
  });
  describe('get', () => {
    it('should return the value of the specific key', () => {
      current.__config = { foo: 'bar' };
      const actual = current.get('foo');

      expect(actual).toEqual('bar');
    });
    it('should return values from dot-notation keys', () => {
      current.__config = { foo: { bar: 'baz' } };
      const actual = current.get('foo.bar');

      expect(actual).toEqual('baz');
    });
    it('should return undefined if no value found', () => {
      current.__config = {};
      const actual = current.get('nope');

      expect(actual).toEqual(undefined);
    });
    it('should return a default value if no such key', () => {
      current.__config = {};
      const actual = current.get('nope', 'foo');

      expect(actual).toEqual('foo');
    });
  });
  describe('set', () => {
    beforeEach(async () => {
      current.__config = {};
      jest.spyOn(current.pulse, 'emit').mockReturnValue();
    });
    it('should set the value at the specific key', () => {
      current.set('foo.bar', { baz: 42 });

      const actual = current.get('foo.bar.baz');

      expect(actual).toEqual(42);
    });
    it('should emit a set event when a value is changed', async () => {
      current.set('foo', 'bar');
      current.set('foo', 'baz');

      expect(current.pulse.emit).toHaveBeenCalledWith('set', 'foo', 'bar');
      expect(current.pulse.emit).toHaveBeenCalledWith('set', 'foo', 'baz');
    });
    it('should not emit a set event when the value is the same', async () => {
      current.set('foo', 'bar');
      current.set('foo', 'bar');

      expect(current.pulse.emit).toHaveBeenCalledTimes(1);
    });
  });
  describe('root', () => {
    it('should return the root dir', async () => {
      await current.init({ root: tmpDirectory });
      const actual = current.root();
      expect(actual).toEqual(tmpDirectory);
    });
  });
  describe('rootPath', () => {
    beforeEach(() => {
      jest.spyOn(current, 'root').mockReturnValue('/__root');
    });
    it('should return an absolute path from the host', () => {
      const actual = current.rootPath('foo.txt');

      expect(actual).toEqual('/__root/foo.txt');
    });
    it('should return the path to the host if no arguments passed', () => {
      const actual = current.rootPath();

      expect(actual).toEqual('/__root');
    });
    it('should keep the path is given as absolute', () => {
      const actual = current.rootPath('/absolute/path');

      expect(actual).toEqual('/absolute/path');
    });
  });
  describe('from', () => {
    it('should be ./src in the default root', async () => {
      await current.init();
      const actual = current.from();
      expect(actual).toEqual(path.resolve(process.cwd(), 'src'));
    });
    it('should be ./src in a custom root', async () => {
      await current.init({ root: tmpDirectory });
      const actual = current.from();
      expect(actual).toEqual(path.resolve(tmpDirectory, 'src'));
    });
    it('should be custom path', async () => {
      await current.init({ from: '/custom' });
      const actual = current.from();
      expect(actual).toEqual('/custom');
    });
  });
  describe('fromPath', () => {
    beforeEach(() => {
      jest.spyOn(current, 'from').mockReturnValue('/source');
    });
    it('should return an absolute path from the source directory', () => {
      const actual = current.fromPath('foo.txt');

      expect(actual).toEqual('/source/foo.txt');
    });
    it('should return the path to the source if no arguments passed', () => {
      const actual = current.fromPath();

      expect(actual).toEqual('/source');
    });
  });
  describe('to', () => {
    it('should be ./dist in the default root', async () => {
      await current.init();
      const actual = current.to();
      expect(actual).toEqual(path.resolve(process.cwd(), 'dist'));
    });
    it('should be ./dist in a custom root', async () => {
      await current.init({ root: tmpDirectory });
      const actual = current.to();
      expect(actual).toEqual(path.resolve(tmpDirectory, 'dist'));
    });
    it('should be custom path', async () => {
      await current.init({ to: '/custom' });
      const actual = current.to();
      expect(actual).toEqual('/custom');
    });
  });
  describe('toPath', () => {
    beforeEach(() => {
      jest.spyOn(current, 'to').mockReturnValue('/destination');
    });
    it('should return an absolute path from the destination directory', () => {
      const actual = current.toPath('foo.txt');

      expect(actual).toEqual('/destination/foo.txt');
    });
    it('should return the path to the destination if no arguments passed', () => {
      const actual = current.toPath();

      expect(actual).toEqual('/destination');
    });
  });
  describe('fileConfig', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'root').mockReturnValue(tmpDirectory);
      await emptyDir(current.rootPath());
    });
    it('should return {} if no config file', async () => {
      const actual = await current.fileConfig('./bad-path');

      expect(actual).toEqual({});
    });
    it('should require the file and return it if found', async () => {
      jest.spyOn(current, '__require').mockReturnValue({ foo: 'bar' });
      const configPath = current.rootPath('norska.config.js');
      await write('// anything', configPath);

      const actual = await current.fileConfig(current.root());

      expect(actual).toHaveProperty('foo', 'bar');
      expect(current.__require).toHaveBeenCalledWith(configPath);
    });
  });
  describe('findFile', () => {
    beforeEach(async () => {
      const themePath = path.resolve(
        tmpDirectory,
        'node_modules/norska-theme-default/src'
      );
      await current.init({
        root: tmpDirectory,
        theme: themePath,
      });
      await emptyDir(tmpDirectory);
    });
    it.each([
      // test name | files to create | input | expected key
      [
        'Layout only in theme',
        {
          theme: '_includes/layouts/default.pug',
          project: null,
        },
        '_includes/layouts/default.pug',
        'theme',
      ],
      [
        'Layout in theme and project',
        {
          theme: '_includes/layouts/default.pug',
          project: '_includes/layouts/default.pug',
        },
        '_includes/layouts/default.pug',
        'project',
      ],
      [
        'Layout only in project',
        {
          theme: null,
          project: '_includes/layouts/default.pug',
        },
        '_includes/layouts/default.pug',
        'project',
      ],
      [
        'Layout not found',
        {
          theme: null,
          project: null,
        },
        '_includes/layouts/default.pug',
        'false',
      ],
    ])('%s', async (_name, files, input, expectedType) => {
      if (files.theme) {
        await write('', path.resolve(current.get('theme'), files.theme));
      }
      if (files.project) {
        await write('', current.fromPath(files.project));
      }
      const actual = await current.findFile(input);
      const expectedHash = {
        theme: current.themePath.bind(current),
        project: current.fromPath.bind(current),
        false: () => {
          return false;
        },
      };
      const expected = expectedHash[expectedType](input);
      expect(actual).toEqual(expected);
    });
  });
});
