const current = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const read = require('firost/read');
const mkdirp = require('firost/mkdirp');
const unwatchAll = require('firost/unwatchAll');
const waitForWatchers = require('firost/waitForWatchers');

// This tests are slow as they actually really compile CSS through postCSS. We
// put them in their own file to easily ignore them when watching tests
describe('norska-css', () => {
  const tmpDirectory = './tmp/norska-css/slow';
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
  describe('watch', () => {
    beforeEach(async () => {
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
        css: current.defaultConfig(),
      });
      await emptyDir(tmpDirectory);
      await mkdirp(config.from());
    });
    afterEach(async () => {
      await unwatchAll();
    });
    it('should compile the input file when it is created', async () => {
      await current.watch();

      await write(
        'body { background-color: red; }',
        config.fromPath('style.css')
      );

      await waitForWatchers();
      const actual = await read(config.toPath('style.css'));
      expect(actual).toMatchSnapshot();
    });
    it('should recompile the input file whenever it is changed', async () => {
      await write('body {}', config.fromPath('style.css'));
      await current.watch();
      await write(
        'body { background-color: red; }',
        config.fromPath('./style.css')
      );

      await waitForWatchers();

      const actual = await read(config.toPath('./style.css'));
      expect(actual).toMatchSnapshot();
    });
    it('should recompile the input file whenever an included file is changed', async () => {
      await write(
        '@import "_styles/imported.css"',
        config.fromPath('style.css')
      );
      await write(
        'b { color: blue; }',
        config.fromPath('_styles/imported.css')
      );
      await current.watch();

      await write('b { color: red; }', config.fromPath('_styles/imported.css'));

      await waitForWatchers();
      const actual = await read(config.toPath('./style.css'));
      expect(actual).toMatchSnapshot();
    });
    it('should recompile the input file whenever the tailwind.config.js file is changed', async () => {
      jest.spyOn(config, 'root').mockReturnValue(tmpDirectory);
      jest.spyOn(current, 'compile').mockReturnValue();
      await write('body {}', config.fromPath('style.css'));
      await write('// foo', config.rootPath('tailwind.config.js'));
      await current.watch();

      await write('// bar', config.rootPath('tailwind.config.js'));

      await waitForWatchers();
      expect(current.compile).toHaveBeenCalled();
    });
    describe('compilation errors', () => {
      beforeEach(() => {
        jest.spyOn(current, '__consoleError').mockReturnValue();
      });
      it('should display compilation errors', async () => {
        await current.watch();

        await write('body { ', config.fromPath('style.css'));

        await waitForWatchers();

        expect(current.__consoleError).toHaveBeenCalledWith(
          expect.stringContaining('Unclosed block')
        );
      });
    });
  });
});
