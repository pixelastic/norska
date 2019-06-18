import module from '../index';
import path from 'path';

describe('norska-config', () => {
  describe('rootDir', () => {
    it('should return the current working directory', () => {
      const expected = process.cwd();
      const actual = module.rootDir();

      expect(actual).toEqual(expected);
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
    it('should return null if no value found', () => {
      module.__config = {};
      const actual = module.get('nope');

      expect(actual).toEqual(null);
    });
  });
  describe('from', () => {
    it('should return the current from key', () => {
      module.__config = { from: 'foo' };
      const actual = module.from();

      expect(actual).toEqual('foo');
    });
  });
  describe('to', () => {
    it('should return the current to key', () => {
      module.__config = { to: 'foo' };
      const actual = module.to();

      expect(actual).toEqual('foo');
    });
  });
  describe('with fixtures', () => {
    let rootDir = path.resolve('./fixtures');
    beforeEach(() => {
      jest.spyOn(module, 'rootDir').mockReturnValue(rootDir);
    });
    describe('rootPath', () => {
      it('should return an absolute path from the host', () => {
        const actual = module.rootPath('foo.txt');

        expect(actual).toEqual(`${rootDir}/foo.txt`);
      });
      it('should return the path to the host if no arguments passed', () => {
        const actual = module.rootPath();

        expect(actual).toEqual(rootDir);
      });
      it('should keep the path is given as absolute', () => {
        const actual = module.rootPath('/absolute/path');

        expect(actual).toEqual('/absolute/path');
      });
    });
    describe('fileConfig', () => {
      it('should return {} if no config file', async () => {
        jest.spyOn(module, 'rootPath').mockReturnValue('./nope.js');
        const actual = await module.fileConfig();

        expect(actual).toEqual({});
      });
      it('should require load the file and return it if found', async () => {
        jest.spyOn(module, '__require').mockReturnValue({ foo: 'bar' });
        const actual = await module.fileConfig();

        expect(actual).toHaveProperty('foo', 'bar');
      });
    });
  });
});
