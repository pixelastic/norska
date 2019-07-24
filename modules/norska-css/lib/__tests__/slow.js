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
      jest.spyOn(helper, 'consoleSuccess').mockReturnValue();
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        css: module.defaultConfig(),
      });
      await firost.emptyDir(tmpDirectory);
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
      jest.spyOn(helper, 'consoleSuccess').mockReturnValue();
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
      jest.spyOn(helper, 'consoleSuccess').mockReturnValue();
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
  });
});
