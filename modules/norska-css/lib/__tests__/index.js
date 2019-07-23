import module from '../index';
import config from 'norska-config';
import helper from 'norska-helper';
import firost from 'firost';

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
  describe('compile', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-css/src',
        to: './tmp/norska-css/dist',
        css: module.defaultConfig(),
      });
      await firost.emptyDir('./tmp/norska-css');
    });
    it('should fail if file is not in the source folder', async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
      const input = '/nope/foo.css';

      const actual = await module.compile(input);

      expect(actual).toEqual(false);
      expect(helper.consoleWarn).toHaveBeenCalled();
    });
    it('should call the compiler with the raw content', async () => {
      await firost.write('/* css content */', config.fromPath('style.css'));
      const mockCompiler = jest.fn();
      jest.spyOn(module, 'getCompiler').mockReturnValue(mockCompiler);

      await module.compile('style.css');

      expect(mockCompiler).toHaveBeenCalledWith(
        '/* css content */',
        expect.anything()
      );
    });
    it('should call the compiler with from as the source', async () => {
      await firost.write('/* css content */', config.fromPath('style.css'));
      const mockCompiler = jest.fn();
      jest.spyOn(module, 'getCompiler').mockReturnValue(mockCompiler);

      await module.compile('style.css');

      expect(mockCompiler).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ from: config.fromPath('style.css') })
      );
    });
    it('should write the .css key result to file', async () => {
      jest.spyOn(firost, 'write');
      await firost.write('/* css content */', config.fromPath('style.css'));
      const mockCompiler = jest.fn().mockImplementation(async () => {
        return { css: '/* compiled content */' };
      });
      jest.spyOn(module, 'getCompiler').mockReturnValue(mockCompiler);

      await module.compile('style.css');

      expect(firost.write).toHaveBeenCalledWith(
        '/* compiled content */',
        config.toPath('style.css')
      );
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-css/src',
        to: './tmp/norska-css/dist',
        css: module.defaultConfig(),
      });
      await firost.emptyDir('./tmp/norska-css');
      // TODO:
      // Add one test per feature we need to test: comment, purgin, etc
      // It might require more calls to post css, but it will make tests easier
      // to understand
      // Another method would be to put everything in one big file and only
      // check this snapshot, but it will make adding new tests slower as we
      // might break everything and not just one thing
      // So, a bunch of simple test that assume dev mode
      // and maybe one big prod test that purges everything?
    });

    it('should compile basic CSS', async () => {
      await firost.write(
        '.class { color: red; }',
        config.fromPath('style.css')
      );
      await module.run();

      const actual = await firost.read(config.toPath('style.css'));
      expect(actual).toMatchSnapshot();
    });
    it('should import statements inline', async () => {
      await firost.write(
        '@import "_styles/imported.css"',
        config.fromPath('style.css')
      );
      await firost.write(
        'b { color: blue; }',
        config.fromPath('_styles/imported.css')
      );
      await module.run();

      const actual = await firost.read(config.toPath('style.css'));
      expect(actual).toMatchSnapshot();
    });
    it('should flatten nested syntax', async () => {
      await firost.write(
        '.class { a { color: red; } }',
        config.fromPath('style.css')
      );
      await module.run();

      const actual = await firost.read(config.toPath('style.css'));
      expect(actual).toMatchSnapshot();
    });

    describe('in production', () => {
      beforeEach(async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        await firost.write(
          '<p class="context"><span>foo</span></p>',
          config.toPath('index.html')
        );
      });
      it('should remove simple comments', async () => {
        await firost.write(
          '/* This should be removed */',
          config.fromPath('style.css')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));
        expect(actual).toMatchSnapshot();
      });
      it('should remove special comments', async () => {
        await firost.write(
          '/*! This should be removed */',
          config.fromPath('style.css')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));
        expect(actual).toMatchSnapshot();
      });
      it('should keep classes available in the markup', async () => {
        await firost.write(
          '.context { color: red; }',
          config.fromPath('style.css')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));
        expect(actual).toMatchSnapshot();
      });
      it('should remove classes not available in the markup', async () => {
        await firost.write(
          '.nope { color: red; }',
          config.fromPath('style.css')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));
        expect(actual).toMatchSnapshot();
      });
      it('should add vendor prefixes', async () => {
        await firost.write(
          '.context { user-select: none; }',
          config.fromPath('style.css')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));
        expect(actual).toMatchSnapshot();
      });
      it('should always keep ais-* classes', async () => {
        await firost.write(
          `.ais-foo { color: red; }
           .ais-foo span { color: red; }`,
          config.fromPath('style.css')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));
        expect(actual).toMatchSnapshot();
      });
      it('should always keep js-* classes', async () => {
        await firost.write(
          `.js-foo { color: red; }
           .js-foo span { color: red; }`,
          config.fromPath('style.css')
        );
        await module.run();

        const actual = await firost.read(config.toPath('style.css'));
        expect(actual).toMatchSnapshot();
      });
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-css/src',
        to: './tmp/norska-css/dist',
        css: module.defaultConfig(),
      });
      await firost.emptyDir('./tmp/norska-css');
      await firost.mkdirp(config.from());
    });
    afterEach(async () => {
      await firost.unwatchAll();
    });
    it('should compile the input file when it is created', async () => {
      await module.watch();

      await firost.write(
        'body { background-color: red; }',
        config.fromPath('style.css')
      );

      await firost.waitForWatchers();
      const actual = await firost.read(config.toPath('style.css'));
      expect(actual).toMatchSnapshot();
    });
    it('should recompile the input file whenever it is changed', async () => {
      await firost.write('body {}', config.fromPath('style.css'));
      await module.watch();
      await firost.write(
        'body { background-color: red; }',
        config.fromPath('./style.css')
      );

      await firost.waitForWatchers();

      const actual = await firost.read(config.toPath('./style.css'));
      expect(actual).toMatchSnapshot();
    });
    it('should recompile the input file whenever an included file is changed', async () => {
      await firost.write(
        '@import "_styles/imported.css"',
        config.fromPath('style.css')
      );
      await firost.write(
        'b { color: blue; }',
        config.fromPath('_styles/imported.css')
      );
      await module.watch();

      await firost.write(
        'b { color: red; }',
        config.fromPath('_styles/imported.css')
      );

      await firost.waitForWatchers();
      const actual = await firost.read(config.toPath('./style.css'));
      expect(actual).toMatchSnapshot();
    });
  });
});
