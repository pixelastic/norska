const current = require('../main');
const config = require('norska-config');
const helper = require('norska-helper');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const path = require('path');

describe('norska-css', () => {
  const tmpDirectory = './tmp/norska-css/main';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
  });
  describe('getPlugins', () => {
    beforeEach(() => {
      jest.spyOn(current, '__pluginImport').mockReturnValue('pluginImport');
      jest.spyOn(current, '__pluginNested').mockReturnValue('pluginNested');
      jest.spyOn(current, '__pluginTailwind').mockReturnValue('pluginTailwind');
      jest.spyOn(current, '__pluginClean').mockReturnValue('pluginClean');
      jest
        .spyOn(current, '__pluginAutoprefixer')
        .mockReturnValue('pluginAutoprefixer');
    });
    it('should contain 3 plugins', async () => {
      const actual = await current.getPlugins();

      expect(actual).toEqual([
        'pluginImport',
        'pluginNested',
        'pluginTailwind',
      ]);
    });
    describe('in production', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should contain 5 plugins', async () => {
        const actual = await current.getPlugins();

        expect(actual).toEqual([
          'pluginImport',
          'pluginNested',
          'pluginTailwind',
          'pluginAutoprefixer',
          'pluginClean',
        ]);
      });
    });
  });
  describe('getTailwindConfig', () => {
    beforeEach(async () => {
      jest.spyOn(config, 'root').mockReturnValue(path.resolve(tmpDirectory));
      await emptyDir(tmpDirectory);
    });
    it('should return config in host if available', async () => {
      const expected = config.rootPath('tailwind.config.js');
      await write('module.exports = { name: "host" }', expected);

      const actual = await current.getTailwindConfig();

      expect(actual).toHaveProperty('name', 'host');
    });
    it('should return default norska config if none in path', async () => {
      const actual = await current.getTailwindConfig();

      expect(actual).toHaveProperty('__isNorskaDefaultConfig', true);
    });
  });
  describe('getCompiler', () => {
    it('should return the postcss().process method, correctly bound', async () => {
      jest.spyOn(current, 'getPlugins').mockReturnValue('my plugins');
      jest.spyOn(current, '__postcss').mockImplementation(function (plugins) {
        return {
          plugins,
          process: jest.fn().mockImplementation(function () {
            return this.plugins;
          }),
        };
      });

      const actual = await current.getCompiler();

      expect(actual()).toEqual('my plugins');
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        css: current.defaultConfig(),
      });
      await emptyDir(tmpDirectory);
    });
    it('should call the compiler with the raw content', async () => {
      await write('/* css content */', config.fromPath('style.css'));
      const mockCompiler = jest.fn();
      jest.spyOn(current, 'getCompiler').mockReturnValue(mockCompiler);

      await current.compile('style.css');

      expect(mockCompiler).toHaveBeenCalledWith(
        '/* css content */',
        expect.anything()
      );
    });
    it('should call the compiler with from as the source', async () => {
      await write('/* css content */', config.fromPath('style.css'));
      const mockCompiler = jest.fn();
      jest.spyOn(current, 'getCompiler').mockReturnValue(mockCompiler);

      await current.compile('style.css');

      expect(mockCompiler).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ from: config.fromPath('style.css') })
      );
    });
    it('should write the .css key result to file', async () => {
      jest.spyOn(current, '__write');
      await write('/* css content */', config.fromPath('style.css'));
      const mockCompiler = jest.fn().mockImplementation(async () => {
        return { css: '/* compiled content */' };
      });
      jest.spyOn(current, 'getCompiler').mockReturnValue(mockCompiler);

      await current.compile('style.css');

      expect(current.__write).toHaveBeenCalledWith(
        '/* compiled content */',
        config.toPath('style.css')
      );
    });
    describe('compilation errors', () => {
      it('should fail if file is not in the source folder', async () => {
        const input = '/nope/foo.css';

        let actual;
        try {
          await current.compile(input);
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ERROR_CSS_COMPILATION_FAILED');
        expect(actual).toHaveProperty(
          'message',
          expect.stringContaining('not in the source directory')
        );
      });
      it('should throw if cannot compile', async () => {
        await write('.foo {', config.fromPath('style.css'));

        let actual;
        try {
          await current.compile('style.css');
        } catch (error) {
          actual = error;
        }

        expect(actual).toHaveProperty('code', 'ERROR_CSS_COMPILATION_FAILED');
        expect(actual).toHaveProperty(
          'message',
          expect.stringContaining('Unclosed block')
        );
      });
    });
  });
});
