import module from '../index';
import config from 'norska-config';
import helper from 'norska-helper';
import firost from 'firost';

// This tests are slow as they actually really compile CSS through postCSS. We
// put them in their own file to easily ignore them when watching tests
describe('norska-css', () => {
  const tmpDirectory = './tmp/norska-css/slow';
  describe('compile', () => {
    beforeEach(async () => {
      jest.spyOn(firost, 'consoleSuccess').mockReturnValue();
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        css: module.defaultConfig(),
      });
      await firost.emptyDir(tmpDirectory);
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
    describe('compilation errors', () => {
      it('should fail if file is not in the source folder', async () => {
        const input = '/nope/foo.css';

        let actual;
        try {
          await module.compile(input);
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
        await firost.write('.foo {', config.fromPath('style.css'));

        let actual;
        try {
          await module.compile('style.css');
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
  describe('run', () => {
    beforeEach(async () => {
      jest.spyOn(firost, 'consoleSuccess').mockReturnValue();
      jest
        .spyOn(firost, 'spinner')
        .mockReturnValue({ tick() {}, success() {}, failure() {} });
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        css: module.defaultConfig(),
      });
      await firost.emptyDir(tmpDirectory);
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
      });
      it('should build a neat CSS file', async () => {
        await firost.write(
          '<p class="context"><span>foo</span></p>',
          config.toPath('index.html')
        );
        await firost.write(
          `/* This should be removed */
          /*! This should still be remove */
          .context { color: green; user-select: none; }
          span { color: green; }
          .nope { color: red; }
          .foo { color: red; }
          .ais-bar { 
            color: green; 
            span {
              color: green;
            }
          }
          .js-bar { 
            color: green; 
            span {
              color: green;
            }
          }
          /* purgecss start ignore */
          .quxx { color: green; }
          /* purgecss end ignore */
          `,
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
      jest.spyOn(firost, 'consoleSuccess').mockReturnValue();
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        css: module.defaultConfig(),
      });
      await firost.emptyDir(tmpDirectory);
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
    it('should recompile the input file whenever the tailwind.config.js file is changed', async () => {
      jest.spyOn(config, 'rootDir').mockReturnValue(tmpDirectory);
      jest.spyOn(module, 'compile').mockReturnValue();
      await firost.write('body {}', config.fromPath('style.css'));
      await firost.write('// foo', config.rootPath('tailwind.config.js'));
      await module.watch();

      await firost.write('// bar', config.rootPath('tailwind.config.js'));

      await firost.waitForWatchers();
      expect(module.compile).toHaveBeenCalled();
    });
    describe('compilation errors', () => {
      beforeEach(() => {
        jest.spyOn(firost, 'consoleError').mockReturnValue();
      });
      it('should display compilation errors', async () => {
        await module.watch();

        await firost.write('body { ', config.fromPath('style.css'));

        await firost.waitForWatchers();

        expect(firost.consoleError).toHaveBeenCalledWith(
          expect.stringContaining('Unclosed block')
        );
      });
    });
  });
});
