import module from '../index';
import helper from 'norska-helper';

describe('norska-css', () => {
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
    });
    it('should contain 3 plugins', () => {
      const actual = module.getPlugins();

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
      it('should contain 6 plugins', () => {
        const actual = module.getPlugins();

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
  describe('getCompiler', () => {
    it('should return the postcss().process method, correctly bound', () => {
      jest.spyOn(module, 'getPlugins').mockReturnValue('my plugins');
      jest.spyOn(module, '__postcss').mockImplementation(function(plugins) {
        return {
          plugins,
          process: jest.fn().mockImplementation(function() {
            return this.plugins;
          }),
        };
      });

      const actual = module.getCompiler();

      expect(actual()).toEqual('my plugins');
    });
  });
});
