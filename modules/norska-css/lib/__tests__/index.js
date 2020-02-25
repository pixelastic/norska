const module = require('../index');
const config = require('norska-config');
const helper = require('norska-helper');
const firost = require('firost');
const path = require('path');

describe('norska-css', () => {
  const tmpDirectory = './tmp/norska-css/index';
  describe('getPlugins', () => {
    beforeEach(() => {
      jest.spyOn(module, '__pluginImport').mockReturnValue('pluginImport');
      jest.spyOn(module, '__pluginNested').mockReturnValue('pluginNested');
      jest.spyOn(module, '__pluginTailwind').mockReturnValue('pluginTailwind');
      jest.spyOn(module, '__pluginPurge').mockReturnValue('pluginPurge');
      jest.spyOn(module, '__pluginClean').mockReturnValue('pluginClean');
      jest
        .spyOn(module, '__pluginAutoprefixer')
        .mockReturnValue('pluginAutoprefixer');
      jest.spyOn(module, 'getTailwindConfigPath').mockReturnValue();
    });
    it('should contain 3 plugins', async () => {
      const actual = await module.getPlugins();

      expect(actual).toEqual([
        'pluginImport',
        'pluginNested',
        'pluginTailwind',
      ]);
    });
    it('should call tailwind with the config file', async () => {
      jest.spyOn(module, 'getTailwindConfigPath').mockReturnValue('foo.js');

      await module.getPlugins();

      expect(module.__pluginTailwind).toHaveBeenCalledWith('foo.js');
    });
    describe('in production', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should contain 6 plugins', async () => {
        const actual = await module.getPlugins();

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
      jest.spyOn(config, 'rootDir').mockReturnValue(path.resolve(tmpDirectory));
      await firost.emptyDir(tmpDirectory);
    });
    it('should return path to host file if available', async () => {
      const expected = config.rootPath('tailwind.config.js');
      await firost.write('foo', expected);

      const actual = await module.getTailwindConfigPath();

      expect(actual).toEqual(expected);
    });
    it('should return path to norska file if none in path', async () => {
      const actual = await module.getTailwindConfigPath();

      expect(actual).toEqual(path.resolve(__dirname, '../tailwind.config.js'));
    });
  });
  describe('getCompiler', () => {
    it('should return the postcss().process method, correctly bound', async () => {
      jest.spyOn(module, 'getPlugins').mockReturnValue('my plugins');
      jest.spyOn(module, '__postcss').mockImplementation(function(plugins) {
        return {
          plugins,
          process: jest.fn().mockImplementation(function() {
            return this.plugins;
          }),
        };
      });

      const actual = await module.getCompiler();

      expect(actual()).toEqual('my plugins');
    });
  });
});