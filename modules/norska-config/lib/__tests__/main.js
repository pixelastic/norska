const module = require('../main');
const path = require('path');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');

describe('norska-config', () => {
  describe('rootDir', () => {
    it('should return the current working directory', () => {
      const expected = process.cwd();
      const actual = module.rootDir();

      expect(actual).toEqual(expected);
    });
  });
  describe('rootPath', () => {
    beforeEach(() => {
      jest.spyOn(module, 'rootDir').mockReturnValue('/__root');
    });
    it('should return an absolute path from the host', () => {
      const actual = module.rootPath('foo.txt');

      expect(actual).toEqual('/__root/foo.txt');
    });
    it('should return the path to the host if no arguments passed', () => {
      const actual = module.rootPath();

      expect(actual).toEqual('/__root');
    });
    it('should keep the path is given as absolute', () => {
      const actual = module.rootPath('/absolute/path');

      expect(actual).toEqual('/absolute/path');
    });
  });
  describe('defaultConfig', () => {
    it('should set the default port', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('port');
    });
    it('should set the default source folder', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('from', './src');
    });
    it('should set the default destination folder', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('to', './dist');
    });
    it('should have an empty list of jsFiles', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('runtime.jsFiles', []);
    });
  });
  describe('cliConfig', () => {
    it('should not return the positional arguments', () => {
      const input = { _: ['foo', 'bar'], from: 'foo' };
      const actual = module.cliConfig(input);

      expect(actual).not.toHaveProperty('_');
    });
    it('should split dot notation into objects', () => {
      const input = { 'foo.bar': 'baz' };
      const actual = module.cliConfig(input);

      expect(actual).toHaveProperty('foo', { bar: 'baz' });
    });
  });
  describe('init', () => {
    it('should set __config with default values', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({ key: 'foo' });
      const modulesConfig = {};
      jest.spyOn(module, 'fileConfig').mockReturnValue({});
      jest.spyOn(module, 'cliConfig').mockReturnValue({});

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.key', 'foo');
    });
    it('module config should extend base config', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({ key: 'foo' });
      const modulesConfig = { css: { key: 'bar' } };
      jest.spyOn(module, 'fileConfig').mockReturnValue({});
      jest.spyOn(module, 'cliConfig').mockReturnValue({});

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.key', 'foo');
      expect(module).toHaveProperty('__config.css.key', 'bar');
    });
    it('module config should be able to override default config', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({ key: 'foo' });
      const modulesConfig = { key: 'bar' };
      jest.spyOn(module, 'fileConfig').mockReturnValue({});
      jest.spyOn(module, 'cliConfig').mockReturnValue({});

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.key', 'bar');
    });
    it('file config should overwrite default config', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({ key: 'foo' });
      const modulesConfig = {};
      jest.spyOn(module, 'fileConfig').mockReturnValue({ key: 'bar' });
      jest.spyOn(module, 'cliConfig').mockReturnValue({});

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.key', 'bar');
    });
    it('file config should be able to overwrite only leaves of module config', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({ key: 'foo' });
      const modulesConfig = { css: { key: 'bar', name: 'qux' } };
      jest.spyOn(module, 'fileConfig').mockReturnValue({ css: { key: 'baz' } });
      jest.spyOn(module, 'cliConfig').mockReturnValue({});

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.css.key', 'baz');
      expect(module).toHaveProperty('__config.css.name', 'qux');
    });
    it('CLI args should be able to overwrite any key', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({ key: 'foo' });
      const modulesConfig = { key: 'bar' };
      jest.spyOn(module, 'fileConfig').mockReturnValue({ key: 'baz' });
      jest.spyOn(module, 'cliConfig').mockReturnValue({ key: 'qux' });

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.key', 'qux');
    });
    it('CLI args should be able to overwrite any deep key', async () => {
      jest
        .spyOn(module, 'defaultConfig')
        .mockReturnValue({ css: { key: 'foo', name: 'foo' } });
      const modulesConfig = { css: { key: 'bar' } };
      jest.spyOn(module, 'fileConfig').mockReturnValue({ css: { key: 'baz' } });
      jest.spyOn(module, 'cliConfig').mockReturnValue({ css: { key: 'qux' } });

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.css.key', 'qux');
      expect(module).toHaveProperty('__config.css.name', 'foo');
    });
    it('CLI args should be able to create nested objects', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({ key: 'foo' });
      const modulesConfig = { key: 'bar' };
      jest.spyOn(module, 'fileConfig').mockReturnValue({ key: 'baz' });
      jest
        .spyOn(module, 'cliConfig')
        .mockReturnValue({ css: { submodule: { key: 'qux' } } });

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.css.submodule.key', 'qux');
    });
    it('from and to path should be absolute in the host by default', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({});
      const modulesConfig = {};
      jest.spyOn(module, 'fileConfig').mockReturnValue({});
      jest
        .spyOn(module, 'cliConfig')
        .mockReturnValue({ from: './foo', to: './bar' });
      jest.spyOn(module, 'rootDir').mockReturnValue('/host');

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.from', '/host/foo');
      expect(module).toHaveProperty('__config.to', '/host/bar');
    });
    it('from and to path should stay absolute if given as absolute', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({});
      const modulesConfig = {};
      jest.spyOn(module, 'fileConfig').mockReturnValue({});
      jest
        .spyOn(module, 'cliConfig')
        .mockReturnValue({ from: '/absolute/foo', to: '/absolute/bar' });
      jest.spyOn(module, 'rootDir').mockReturnValue('/host');

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.from', '/absolute/foo');
      expect(module).toHaveProperty('__config.to', '/absolute/bar');
    });
    it('Deep CLI args should only change deep keys, not whole object', async () => {
      jest.spyOn(module, 'defaultConfig').mockReturnValue({});
      const modulesConfig = { deep: { foo: 'yes', bar: 'yes' } };
      jest.spyOn(module, 'fileConfig').mockReturnValue({});
      jest.spyOn(module, 'cliConfig').mockReturnValue({ deep: { foo: 'no' } });

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.deep.foo', 'no');
      expect(module).toHaveProperty('__config.deep.bar', 'yes');
    });
  });
  describe('get', () => {
    it('should return the value of the specific key', () => {
      module.__config = { foo: 'bar' };
      const actual = module.get('foo');

      expect(actual).toEqual('bar');
    });
    it('should return values from dot-notation keys', () => {
      module.__config = { foo: { bar: 'baz' } };
      const actual = module.get('foo.bar');

      expect(actual).toEqual('baz');
    });
    it('should return undefined if no value found', () => {
      module.__config = {};
      const actual = module.get('nope');

      expect(actual).toEqual(undefined);
    });
    it('should return a default value if no such key', () => {
      module.__config = {};
      const actual = module.get('nope', 'foo');

      expect(actual).toEqual('foo');
    });
  });
  describe('set', () => {
    beforeEach(async () => {
      module.__config = {};
      jest.spyOn(module.pulse, 'emit').mockReturnValue();
    });
    it('should set the value at the specific key', () => {
      module.set('foo.bar', { baz: 42 });

      const actual = module.get('foo.bar.baz');

      expect(actual).toEqual(42);
    });
    it('should emit a set event when a value is changed', async () => {
      module.set('foo', 'bar');
      module.set('foo', 'baz');

      expect(module.pulse.emit).toHaveBeenCalledWith('set', 'foo', 'bar');
      expect(module.pulse.emit).toHaveBeenCalledWith('set', 'foo', 'baz');
    });
    it('should not emit a set event when the value is the same', async () => {
      module.set('foo', 'bar');
      module.set('foo', 'bar');

      expect(module.pulse.emit).toHaveBeenCalledTimes(1);
    });
  });
  describe('from', () => {
    it('should return the current from key as an absolute path', () => {
      module.__config = { from: 'foo' };
      const actual = module.from();

      expect(actual).toEqual(path.resolve('foo'));
    });
    it('should return the from key as an absolute path if already an absolute path', () => {
      module.__config = { from: '/foo' };
      const actual = module.from();

      expect(actual).toEqual('/foo');
    });
  });
  describe('fromPath', () => {
    beforeEach(() => {
      jest.spyOn(module, 'from').mockReturnValue('/source');
    });
    it('should return an absolute path from the source directory', () => {
      const actual = module.fromPath('foo.txt');

      expect(actual).toEqual('/source/foo.txt');
    });
    it('should return the path to the source if no arguments passed', () => {
      const actual = module.fromPath();

      expect(actual).toEqual('/source');
    });
  });
  describe('to', () => {
    it('should return the current to key as an absolute path', () => {
      module.__config = { to: 'foo' };
      const actual = module.to();

      expect(actual).toEqual(path.resolve('foo'));
    });
    it('should return the from key as an absolute path if already an absolute path', () => {
      module.__config = { to: '/foo' };
      const actual = module.to();

      expect(actual).toEqual('/foo');
    });
  });
  describe('toPath', () => {
    beforeEach(() => {
      jest.spyOn(module, 'to').mockReturnValue('/destination');
    });
    it('should return an absolute path from the destination directory', () => {
      const actual = module.toPath('foo.txt');

      expect(actual).toEqual('/destination/foo.txt');
    });
    it('should return the path to the destination if no arguments passed', () => {
      const actual = module.toPath();

      expect(actual).toEqual('/destination');
    });
  });
  describe('fileConfig', () => {
    beforeEach(async () => {
      jest.spyOn(module, 'rootDir').mockReturnValue('./tmp/norska-config');
      await emptyDir(module.rootPath());
    });
    it('should return {} if no config file', async () => {
      const actual = await module.fileConfig();

      expect(actual).toEqual({});
    });
    it('should require the file and return it if found', async () => {
      jest.spyOn(module, '__require').mockReturnValue({ foo: 'bar' });
      const configPath = module.rootPath('norska.config.js');
      await write('// anything', configPath);

      const actual = await module.fileConfig();

      expect(actual).toHaveProperty('foo', 'bar');
      expect(module.__require).toHaveBeenCalledWith(configPath);
    });
  });
  describe('relativePath', () => {
    it.each([
      ['index.html', 'image.png', 'image.png'],
      ['index.html', '/image.png', 'image.png'],
      ['index.html', './image.png', './image.png'],
      ['index.html', 'subfolder/image.png', 'subfolder/image.png'],
      ['index.html', '/subfolder/image.png', 'subfolder/image.png'],
      ['index.html', './subfolder/image.png', './subfolder/image.png'],
      ['subfolder/index.html', 'image.png', '../image.png'],
      ['subfolder/index.html', '/image.png', '../image.png'],
      ['subfolder/index.html', './image.png', './image.png'],
      ['subfolder/index.html', 'subfolder/image.png', 'image.png'],
      ['subfolder/index.html', '/subfolder/image.png', 'image.png'],
      [
        'subfolder/index.html',
        './subfolder/image.png',
        './subfolder/image.png',
      ],
    ])('[%s:%s] => %s', (source, destination, expected) => {
      const actual = module.relativePath(source, destination);
      expect(actual).toEqual(expected);
    });
  });
});
