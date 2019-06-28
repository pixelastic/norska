import module from '../index';
import config from 'norska-config';
import helper from 'norska-helper';
import firost from 'firost';

describe('norska-css', () => {
  beforeEach(async () => {
    await config.init({
      from: './fixtures/src',
      to: './tmp/norska-css',
    });
  });
  describe('getPlugins', () => {
    beforeEach(() => {
      jest.spyOn(module, '__pluginImport').mockReturnValue('pluginImport');
      jest.spyOn(module, '__pluginNested').mockReturnValue('pluginNested');
      jest.spyOn(module, '__pluginPurge').mockReturnValue('pluginPurge');
      jest.spyOn(module, '__pluginClean').mockReturnValue('pluginClean');
      jest
        .spyOn(module, '__pluginAutoprefixer')
        .mockReturnValue('pluginAutoprefixer');
    });
    it('should contain 2 plugins', () => {
      const actual = module.getPlugins();

      expect(actual).toEqual(['pluginImport', 'pluginNested']);
    });
    describe('in production', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should contain 5 plugins', () => {
        const actual = module.getPlugins();

        expect(actual).toEqual([
          'pluginImport',
          'pluginNested',
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

    // const plugins = this.getPlugins();

    // const postcssInstance = this.__postcss(plugins);
    // return _.bind(postcssInstance.process, postcssInstance);
  });
  describe('compile', () => {
    beforeEach(() => {
      jest.spyOn(firost, 'read').mockReturnValue();
      jest.spyOn(firost, 'write').mockReturnValue();
    });
    it('should fail if file is not in the source folder', async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
      const input = '/nope/foo.css';

      const actual = await module.compile(input);

      expect(actual).toEqual(false);
      expect(helper.consoleWarn).toHaveBeenCalled();
    });
    it('should call the compiler with the raw content', async () => {
      jest.spyOn(firost, 'read').mockReturnValue('css content');
      const mockCompiler = jest.fn();
      jest.spyOn(module, 'getCompiler').mockReturnValue(mockCompiler);

      await module.compile('style.css');

      expect(mockCompiler).toHaveBeenCalledWith(
        'css content',
        expect.anything()
      );
    });
    it('should call the compiler with from as the source', async () => {
      jest.spyOn(firost, 'read').mockReturnValue('css content');
      const mockCompiler = jest.fn();
      jest.spyOn(module, 'getCompiler').mockReturnValue(mockCompiler);

      await module.compile('style.css');

      expect(mockCompiler).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ from: config.fromPath('style.css') })
      );
    });
    it('should write the .css key result to file', async () => {
      const mockCompiler = jest.fn().mockImplementation(async () => {
        return { css: 'compiled content' };
      });
      jest.spyOn(module, 'getCompiler').mockReturnValue(mockCompiler);

      await module.compile('style.css');

      expect(firost.write).toHaveBeenCalledWith(
        'compiled content',
        expect.anything()
      );
    });
    it('should write the compiled css to destination file', async () => {
      const mockCompiler = jest.fn();
      jest.spyOn(module, 'getCompiler').mockReturnValue(mockCompiler);

      await module.compile('style.css');

      expect(firost.write).toHaveBeenCalledWith(
        undefined,
        config.toPath('style.css')
      );
    });
  });
  describe('run', () => {
    describe('in development', () => {
      it('should compile the input file', async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(false);
        config.init({
          from: './fixtures/src',
          to: './tmp/norska-css',
          css: module.defaultConfig(),
        });
        await firost.emptyDir('./tmp/norska-css');
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));

        expect(actual).toMatchSnapshot();
      });
    });
    describe('in production', () => {
      it('should compile the input file', async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        config.init({
          from: './fixtures/src',
          to: './tmp/norska-css',
          css: module.defaultConfig(),
        });
        await firost.emptyDir('./tmp/norska-css');
        await firost.write(
          '<p class="context"><b>foo</b></p>',
          config.toPath('index.html')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));

        expect(actual).toMatchSnapshot();
      });
    });
  });
});
