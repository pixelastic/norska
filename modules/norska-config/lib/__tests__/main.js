const module = require('../main');
const path = require('path');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const helper = require('norska-helper');

describe('norska-config', () => {
  const tmpDirectory = path.resolve('./tmp/norska-config');
  describe('defaultConfig', () => {
    it('should set the default port', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('port');
    });
    it('should set the default root as the current folder', async () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('root', process.cwd());
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
      const defaultConfig = module.defaultConfig();
      await module.init();

      expect(module).toHaveProperty('__config.root', defaultConfig.root);
      expect(module).toHaveProperty('__config.port', defaultConfig.port);
    });
    it('module config should extend base config', async () => {
      await module.init({}, { foo: 'ok', hooks: { foo: 'ok' } });

      expect(module).toHaveProperty('__config.foo', 'ok');
      expect(module).toHaveProperty('__config.hooks.foo', 'ok');
    });
    it('module config should be able to override default config', async () => {
      await module.init({}, { port: 'ok' });

      expect(module).toHaveProperty('__config.port', 'ok');
    });
    it('file config should overwrite default config', async () => {
      jest.spyOn(module, 'fileConfig').mockReturnValue({ port: 'ok' });

      await module.init();

      expect(module).toHaveProperty('__config.port', 'ok');
    });
    it('file config should be able to overwrite only leaves of module config', async () => {
      const modulesConfig = { sub: { foo: 'nope', bar: 'ok' } };
      jest.spyOn(module, 'fileConfig').mockReturnValue({ sub: { foo: 'ok' } });

      await module.init({}, modulesConfig);

      expect(module).toHaveProperty('__config.sub.foo', 'ok');
    });
    it('CLI args should be able to overwrite any key', async () => {
      jest.spyOn(module, 'fileConfig').mockReturnValue({ port: 'nope' });

      await module.init({ port: 'ok' }, { port: 'nope' });

      expect(module).toHaveProperty('__config.port', 'ok');
    });
    it('CLI args should be able to overwrite any deep key', async () => {
      jest
        .spyOn(module, 'fileConfig')
        .mockReturnValue({ one: { two: { foo: 'nope' } } });

      await module.init(
        { one: { two: { foo: 'ok', bar: 'ok' } } },
        { one: { two: { bar: 'nope' } } }
      );

      expect(module).toHaveProperty('__config.one.two.foo', 'ok');
      expect(module).toHaveProperty('__config.one.two.bar', 'ok');
    });
    it('CLI args should be able to create nested objects', async () => {
      jest
        .spyOn(module, 'cliConfig')
        .mockReturnValue({ css: { submodule: { key: 'qux' } } });

      await module.init();

      expect(module).toHaveProperty('__config.css.submodule.key', 'qux');
    });
    it('from and to should be relative to the root', async () => {
      await module.init({ root: tmpDirectory, from: './foo', to: './bar' });

      expect(module).toHaveProperty('__config.from', `${tmpDirectory}/foo`);
      expect(module).toHaveProperty('__config.to', `${tmpDirectory}/bar`);
    });
    it('from and to path should stay absolute if given as absolute', async () => {
      await module.init({
        from: `${tmpDirectory}/custom-from`,
        to: `${tmpDirectory}/custom-to`,
      });

      expect(module).toHaveProperty(
        '__config.from',
        `${tmpDirectory}/custom-from`
      );
      expect(module).toHaveProperty('__config.to', `${tmpDirectory}/custom-to`);
    });
    it('Deep CLI args should only change deep keys, not whole object', async () => {
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
  describe('rootDir', () => {
    it('should return the root dir', async () => {
      await module.init({ root: tmpDirectory });
      const actual = module.rootDir();
      expect(actual).toEqual(tmpDirectory);
    });
    it('should return the current working directory by default', async () => {
      await module.init();

      const actual = module.rootDir();
      expect(actual).toEqual(process.cwd());
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
  describe('from', () => {
    it('should be ./src in the default root', async () => {
      await module.init();
      const actual = module.from();
      expect(actual).toEqual(path.resolve(process.cwd(), 'src'));
    });
    it('should be ./src in a custom root', async () => {
      await module.init({ root: tmpDirectory });
      const actual = module.from();
      expect(actual).toEqual(path.resolve(tmpDirectory, 'src'));
    });
    it('should be custom path', async () => {
      await module.init({ from: '/custom' });
      const actual = module.from();
      expect(actual).toEqual('/custom');
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
    it('should be ./dist in the default root', async () => {
      await module.init();
      const actual = module.to();
      expect(actual).toEqual(path.resolve(process.cwd(), 'dist'));
    });
    it('should be ./dist in a custom root', async () => {
      await module.init({ root: tmpDirectory });
      const actual = module.to();
      expect(actual).toEqual(path.resolve(tmpDirectory, 'dist'));
    });
    it('should be custom path', async () => {
      await module.init({ to: '/custom' });
      const actual = module.to();
      expect(actual).toEqual('/custom');
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
      jest.spyOn(module, 'rootDir').mockReturnValue(tmpDirectory);
      await emptyDir(module.rootPath());
    });
    it('should return {} if no config file', async () => {
      const actual = await module.fileConfig('./bad-path');

      expect(actual).toEqual({});
    });
    it('should require the file and return it if found', async () => {
      jest.spyOn(module, '__require').mockReturnValue({ foo: 'bar' });
      const configPath = module.rootPath('norska.config.js');
      await write('// anything', configPath);

      const actual = await module.fileConfig(module.rootDir());

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
  describe('sanityCheck', () => {
    describe('cloudinary', () => {
      it.each([
        // prod/dev | isEnabled | bucketName | expected outcome
        ['dev', 'enabled', 'bucket', 'nothing'],
        ['dev', 'enabled', null, 'warning'],
        ['dev', 'disabled', 'bucket', 'nothing'],
        ['dev', 'disabled', null, 'nothing'],
        ['prod', 'enabled', 'bucket', 'nothing'],
        ['prod', 'enabled', null, 'error'],
        ['prod', 'disabled', 'bucket', 'nothing'],
        ['prod', 'disabled', null, 'nothing'],
      ])(
        'env:%s, cloudinary:%s, bucketName:%s => %s',
        (environment, enableState, bucketName, expectedOutcome) => {
          jest.spyOn(module, '__consoleWarn').mockReturnValue();
          const isProductionMapping = { dev: false, prod: true };
          jest
            .spyOn(helper, 'isProduction')
            .mockReturnValue(isProductionMapping[environment]);
          const enableMapping = { enabled: true, disabled: false };
          module.set('cloudinary', {
            enable: enableMapping[enableState],
            bucketName,
          });

          let actualError = null;
          try {
            module.sanityCheck();
          } catch (err) {
            actualError = err;
          }

          if (expectedOutcome === 'nothing') {
            expect(actualError).toEqual(null);
            expect(module.__consoleWarn).not.toHaveBeenCalled();
          }
          if (expectedOutcome === 'warning') {
            expect(actualError).toEqual(null);
            expect(module.__consoleWarn).toHaveBeenCalled();
          }
          if (expectedOutcome === 'error') {
            expect(actualError).not.toEqual(null);
            expect(module.__consoleWarn).not.toHaveBeenCalled();
          }
        }
      );
    });
  });
});
