const current = require('../main');
const config = require('norska-config');
const helper = require('norska-helper');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const path = require('path');

describe('norska-css', () => {
  const tmpDirectory = './tmp/norska-css/index';
  describe('getPlugins', () => {
    beforeEach(() => {
      jest.spyOn(current, '__pluginImport').mockReturnValue('pluginImport');
      jest.spyOn(current, '__pluginNested').mockReturnValue('pluginNested');
      jest.spyOn(current, '__pluginTailwind').mockReturnValue('pluginTailwind');
      jest.spyOn(current, '__pluginPurge').mockReturnValue('pluginPurge');
      jest.spyOn(current, '__pluginClean').mockReturnValue('pluginClean');
      jest
        .spyOn(current, '__pluginAutoprefixer')
        .mockReturnValue('pluginAutoprefixer');
      jest.spyOn(current, 'getTailwindConfigPath').mockReturnValue();
    });
    it('should contain 3 plugins', async () => {
      const actual = await current.getPlugins();

      expect(actual).toEqual([
        'pluginImport',
        'pluginNested',
        'pluginTailwind',
      ]);
    });
    it('should call tailwind with the config file', async () => {
      jest.spyOn(current, 'getTailwindConfigPath').mockReturnValue('foo.js');

      await current.getPlugins();

      expect(current.__pluginTailwind).toHaveBeenCalledWith('foo.js');
    });
    describe('in production', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should contain 6 plugins', async () => {
        const actual = await current.getPlugins();

        expect(actual).toEqual([
          'pluginImport',
          'pluginNested',
          'pluginTailwind',
          'pluginPurge',
          'pluginAutoprefixer',
          'pluginClean',
        ]);
      });
    });
  });
  describe('getTailwindConfigPath', () => {
    beforeEach(async () => {
      jest.spyOn(config, 'root').mockReturnValue(path.resolve(tmpDirectory));
      await emptyDir(tmpDirectory);
    });
    it('should return path to host file if available', async () => {
      const expected = config.rootPath('tailwind.config.js');
      await write('foo', expected);

      const actual = await current.getTailwindConfigPath();

      expect(actual).toEqual(expected);
    });
    it('should return path to norska file if none in path', async () => {
      const actual = await current.getTailwindConfigPath();

      expect(actual).toEqual(path.resolve(__dirname, '../tailwind.config.js'));
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
});
