const current = require('../main');
const config = require('norska-config');
const helper = require('norska-helper');
const pEvent = require('p-event');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const read = require('firost/read');
const isFile = require('firost/isFile');

// Note:
// Webpack seems to have trouble when too many compiler are instanciated.
// Jest complains that some handles are not correctly closed.
// To fix the issue, the module keeps an internal cache of the compiler, using
// this cached value on subsequent calls.
// But because this value contains the webpack config, we need to clear it
// before running some tests that assume a dev/prod environment
// As beforeAll/afterAll is buggy (fires even for skipped/non-focused tests), we
// use a hack around beforeEach/afterEach with a variable
describe('norska-js', () => {
  const tmpDirectory = './tmp/norska-js';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
      js: current.defaultConfig(),
    });
    await emptyDir(tmpDirectory);
  });
  describe('loadConfig', () => {
    it('should return false if the entry point does not exist', async () => {
      const actual = await current.loadConfig();

      expect(actual).toEqual(false);
    });
    it('should return the object with correct entry if exists', async () => {
      const input = config.fromPath('script.js');
      await write('foo', input);

      const actual = await current.loadConfig();

      expect(actual).toHaveProperty('entry', input);
    });
    it('should set the output path', async () => {
      await write('foo', config.fromPath('script.js'));

      const actual = await current.loadConfig();

      expect(actual).toHaveProperty('output.path', config.to());
    });
    it('should set the output filename', async () => {
      await write('foo', config.fromPath('script.js'));

      const actual = await current.loadConfig();

      expect(actual).toHaveProperty('output.filename', 'script.js');
    });
    it('should use development config by default', async () => {
      await write('foo', config.fromPath('script.js'));

      const actual = await current.loadConfig();

      expect(actual).toHaveProperty('mode', 'development');
    });
    it('should use production values in production', async () => {
      await write('foo', config.fromPath('script.js'));
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);

      const actual = await current.loadConfig();

      expect(actual).toHaveProperty('mode', 'production');
    });
  });
  describe('getCompiler', () => {
    beforeEach(() => {
      current.__compiler = null;
    });
    afterEach(() => {
      current.__compiler = null;
    });
    it('should return false if no config is loaded', async () => {
      jest.spyOn(current, 'loadConfig').mockReturnValue(false);
      const actual = await current.getCompiler();

      expect(actual).toEqual(false);
    });
    it('should return a cached value on second call', async () => {
      jest.spyOn(current, 'loadConfig').mockReturnValue({ foo: 'bar' });
      const mockWebpack = { bar: 'baz', run() {} };
      jest.spyOn(current, '__webpack').mockReturnValue(mockWebpack);

      await current.getCompiler();
      expect(current.__compiler).toEqual(mockWebpack);
      const actual = await current.getCompiler();
      expect(actual).toEqual(mockWebpack);

      expect(current.__webpack).toHaveBeenCalledTimes(1);
    });
    it('should return a webpack instance with the specified config', async () => {
      jest.spyOn(current, 'loadConfig').mockReturnValue({ foo: 'bar' });
      jest
        .spyOn(current, '__webpack')
        .mockReturnValue({ bar: 'baz', run() {} });

      const actual = await current.getCompiler();

      expect(actual).toEqual(expect.objectContaining({ bar: 'baz' }));
      expect(current.__webpack).toHaveBeenCalledWith({ foo: 'bar' });
    });
    it('should promisify and bind the run method', async () => {
      jest.spyOn(current, 'loadConfig').mockReturnValue({});
      const mockWebpack = {
        foo: 'bar',
        run() {
          return this.foo;
        },
      };
      jest.spyOn(current, '__webpack').mockReturnValue(mockWebpack);
      jest.spyOn(current, '__pify').mockImplementation((input) => {
        return input;
      });

      const actual = await current.getCompiler();

      expect(actual.run()).toEqual('bar');
      expect(current.__pify).toHaveBeenCalledWith(mockWebpack.run);
    });
  });
  describe('errorMessage', () => {
    it('should format a nice error message', () => {
      const stats = {
        toJson() {
          return {
            errors: [
              {
                moduleIdentifier: '/path/to/file.js',
                message:
                  "Module parse failed: Unexpected character '@' (1:1)\n" +
                  'You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders\n' +
                  '> b@d code!',
              },
            ],
          };
        },
      };

      const actual = current.errorMessage(stats);

      expect(actual).toEqual(
        "Unexpected character '@' (1:1)\n> b@d code!\nIn /path/to/file.js"
      );
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest
        .spyOn(current, '__spinner')
        .mockReturnValue({ tick() {}, success() {}, failure() {}, info() {} });
    });
    describe('in dev', () => {
      let firstRun = true;
      beforeEach(() => {
        if (firstRun) {
          current.__compiler = null;
          firstRun = false;
        }
      });
      it('should do nothing if no input file', async () => {
        const actual = await current.run();

        expect(actual).toEqual(false);
      });
      it('should compile script.js in destination', async () => {
        await write('console.log("ok");', config.fromPath('script.js'));

        await current.run();

        const actual = await isFile(config.toPath('script.js'));
        expect(actual).toEqual(true);
      });
      it('should not create a source map file', async () => {
        await write('console.log("ok");', config.fromPath('script.js'));
        await current.run();

        const actual = await isFile(config.toPath('script.js.map'));
        expect(actual).toEqual(false);
      });
      it('should display timing results', async () => {
        const spinnerSuccess = jest.fn();
        jest.spyOn(current, '__spinner').mockReturnValue({
          tick() {},
          success: spinnerSuccess,
          failure() {},
          info() {},
        });

        await write('console.log("ok");', config.fromPath('script.js'));
        await current.run();

        expect(spinnerSuccess).toHaveBeenCalledWith(
          expect.stringMatching('JavaScript compiled in ([0-9]*)ms')
        );
      });
      it('should fill the runtime config with the asset list', async () => {
        await write('console.log("ok");', config.fromPath('script.js'));
        await current.run();

        const actual = config.get('runtime.jsFiles');
        expect(actual).toEqual(['script.js']);
      });
      describe('with errors', () => {
        it('should display error and file', async () => {
          const scriptPath = config.fromPath('script.js');
          await write('b@d code!', scriptPath);

          let actual = null;
          try {
            await current.run();
          } catch (err) {
            actual = err;
          }

          expect(actual).toHaveProperty('code', 'ERROR_JS_COMPILATION_FAILED');
          const actualString = actual.toString();
          expect(actualString).toContain("Unexpected character '@' (1:1)");
          expect(actualString).toContain(scriptPath);
          expect(actualString).toContain('b@d code');
        });
      });
    });
    describe('in production', () => {
      let firstRun = true;
      beforeEach(() => {
        if (firstRun) {
          current.__compiler = null;
          firstRun = false;
        }
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should fill the runtime with the asset list', async () => {
        await write('console.log("ok");', config.fromPath('script.js'));
        await current.run();

        const actual = config.get('runtime.jsFiles');
        expect(actual[0]).toEqual(expect.stringMatching(/script\.(.*)\.js/));
      });
      it('should create revved assets', async () => {
        await write('console.log("ok");', config.fromPath('script.js'));
        await current.run();

        const filepath = config.get('runtime.jsFiles')[0];
        const actual = await isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should create a source map file', async () => {
        await write('console.log("ok");', config.fromPath('script.js'));
        await current.run();

        const filepath = config.get('runtime.jsFiles')[0];
        const actual = await isFile(config.toPath(`${filepath}.map`));
        expect(actual).toEqual(true);
      });
    });
  });
  describe('watch', () => {
    let firstRun = true;
    beforeEach(async () => {
      if (firstRun) {
        current.__compiler = null;
        firstRun = false;
      }
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
    });
    afterEach(async () => {
      await current.unwatch();
    });
    it('should recompile the input file whenever it is changed', async () => {
      await write('console.log("ok");', config.fromPath('script.js'));
      await current.watch();
      await pEvent(current.pulse, 'build');

      await write('console.log("bar");', config.fromPath('script.js'));
      await pEvent(current.pulse, 'build');
      const actual = await read(config.toPath('script.js'));
      expect(actual).toContain('console.log("bar")');
    });
    it('should fire an error event when compilation fails', async () => {
      jest.spyOn(current, '__consoleError').mockReturnValue();
      await write('console.log("ok");', config.fromPath('script.js'));
      await current.watch();
      await pEvent(current.pulse, 'build');

      await write('b@@@@d code', config.fromPath('script.js'));
      await pEvent(current.pulse, 'buildError');

      expect(current.__consoleError).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected character')
      );
    });
    it('should update the list of jsFiles in runtime', async () => {
      config.set('runtime.jsFiles', ['foo.js']);

      await write('console.log("foo");', config.fromPath('script.js'));
      await current.watch();
      await pEvent(current.pulse, 'build');

      const actual = config.get('runtime.jsFiles');
      expect(actual).toEqual(['script.js']);
    });
  });
});
