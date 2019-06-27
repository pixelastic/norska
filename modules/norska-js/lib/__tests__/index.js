import module from '../index';
import config from 'norska-config';
import firost from 'firost';
import helper from 'norska-helper';
import { _ } from 'golgoth';

describe('norska-js', () => {
  beforeEach(async () => {
    module.__compilers = {};
    await config.init({
      from: './fixtures/src',
      to: './tmp/norska-js',
      js: module.defaultConfig(),
    });
  });
  describe('loadConfig', () => {
    beforeEach(async () => {
      await config.init({
        from: '/source',
        to: '/destination',
        js: { input: 'input.js', output: 'output.js' },
      });
    });
    it('uses the specified object as basis', () => {
      const actual = module.loadConfig({ foo: 'bar' });

      expect(actual).toHaveProperty('foo', 'bar');
    });
    it('set the entrypoint to the js.input option in source directory', async () => {
      const actual = module.loadConfig({});

      expect(actual).toHaveProperty('entry', '/source/input.js');
    });
    it('set the output file to the js.output option', async () => {
      const actual = module.loadConfig({});

      expect(actual).toHaveProperty('output.filename', 'output.js');
    });
    it('set the output directory to the destination', async () => {
      const actual = module.loadConfig({});

      expect(actual).toHaveProperty('output.path', '/destination');
    });
  });
  describe('getCompiler', () => {
    it('should return a webpack instance with the specified config', () => {
      jest.spyOn(module, '__webpack').mockReturnValue('webpack instance');
      const actual = module.getCompiler({ name: 'foo' }, 'foo');

      expect(actual).toEqual('webpack instance');
      expect(module.__webpack).toHaveBeenCalledWith({ name: 'foo' });
    });
    it('should use cache if called with the same key again', () => {
      jest.spyOn(module, '__webpack').mockReturnValue('webpack instance');

      module.getCompiler({ name: 'foo' }, 'foo');
      const actual = module.getCompiler({ anything: 'does not matter' }, 'foo');

      expect(actual).toEqual('webpack instance');
      expect(module.__webpack).toHaveBeenCalledTimes(1);
      expect(module.__webpack).toHaveBeenCalledWith({ name: 'foo' });
    });
  });
  describe('displayResults', () => {
    it('should display a success message with timing', () => {
      const input = { endTime: 10, startTime: 5 };
      _.set(input, 'compilation.options.output.filename', 'foo.js');
      jest.spyOn(helper, 'consoleSuccess').mockReturnValue();

      module.displayResults(input);

      expect(helper.consoleSuccess).toHaveBeenCalledWith(
        'foo.js compiled in 5ms'
      );
    });
  });
  describe('runCompiler', () => {
    let mockCompiler, mockError, mockStats;
    beforeEach(() => {
      mockCompiler = {
        run: jest.fn().mockImplementation(method => {
          method(mockError, mockStats);
        }),
      };
    });
    it('should return with the stats if ok', async () => {
      mockError = null;
      mockStats = {
        hasErrors: jest.fn().mockReturnValue(false),
        foo: 'bar',
      };

      const actual = await module.runCompiler(mockCompiler);

      expect(actual).toHaveProperty('foo', 'bar');
    });
    it('should throw an error is has errors', async () => {
      mockError = null;
      mockStats = {
        hasErrors: jest.fn().mockReturnValue(true),
        toJson: jest.fn().mockReturnValue({ errors: ['line 1', 'line 2'] }),
        foo: 'bar',
      };

      let actual;
      try {
        actual = await module.runCompiler(mockCompiler);
      } catch (err) {
        actual = err;
      }

      expect(actual).toHaveProperty('code', 'ERROR_WEBPACK_COMPILATION_FAILED');
      expect(actual).toHaveProperty('message', 'line 1\nline 2');
    });
  });
  describe('run', () => {
    describe('no errors', () => {
      beforeAll(async () => {
        // Note: We need to manually restore all mocks here because they are
        // only automatically restored when a test starts. And as we're in
        // a beforeAll they are not yet restored.
        jest.restoreAllMocks();
        jest.spyOn(module, 'displayResults').mockReturnValue();
        await config.init({
          from: './fixtures/src',
          to: './tmp/norska-js',
          js: module.defaultConfig(),
        });
        await firost.emptyDir(config.to());
        await module.run();
      });
      it('should compile script.js in destination', async () => {
        const actual = await firost.isFile(config.toPath('script.js'));

        expect(actual).toEqual(true);
      });
      it('should create a source map file', async () => {
        const actual = await firost.isFile(config.toPath('script.js.map'));

        expect(actual).toEqual(true);
      });
    });
    describe('with errors', () => {
      it('should warn about missing entryfile', async () => {
        jest.spyOn(helper, 'consoleWarn').mockReturnValue();
        await config.init({
          from: './nope',
          to: './tmp/norska-js',
          js: module.defaultConfig(),
        });

        const actual = await module.run();

        expect(helper.consoleWarn).toHaveBeenCalledWith(expect.anything());
        expect(actual).toBe(false);
      });

      describe('bad input file', () => {
        it('should stop and display an error', async () => {
          jest.spyOn(helper, 'exit').mockReturnValue();
          jest.spyOn(helper, 'consoleError').mockReturnValue();
          jest.spyOn(module, 'runCompiler').mockImplementation(async () => {
            throw helper.error('errorCode', 'errorMessage');
          });

          await config.init({
            from: './fixtures/src',
            to: './tmp/norska-js',
            js: {
              ...module.defaultConfig(),
              input: 'bad.js',
            },
          });
          await module.run();

          expect(helper.exit).toHaveBeenCalledWith(1);
          expect(helper.consoleError).toHaveBeenCalledWith(
            '[norska-js]: errorCode'
          );
          expect(helper.consoleError).toHaveBeenCalledWith('errorMessage');
        });
      });
    });
    it('should display timing results', async () => {
      jest.spyOn(module, 'getCompiler').mockReturnValue();
      jest.spyOn(firost, 'exist').mockReturnValue(true);
      jest.spyOn(module, 'runCompiler').mockReturnValue('run results');
      jest.spyOn(module, 'displayResults').mockReturnValue();

      await module.run();

      expect(module.displayResults).toHaveBeenCalledWith('run results');
    });
  });
});
