const current = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const path = require('path');
const waitForWatchers = require('firost/waitForWatchers');
const uuid = require('firost/uuid');
const unwatchAll = require('firost/unwatchAll');

describe('norska-css', () => {
  const tmpDirectory = './tmp/norska-css/watch';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      await config.init({
        root: tmpDirectory,
        theme: path.resolve(tmpDirectory, 'theme'),
        css: current.defaultConfig(),
      });
      jest.spyOn(current, 'compile').mockReturnValue();
      await emptyDir(tmpDirectory);
      jest.spyOn(current, '__consoleSuccess').mockReturnValue();
      jest.spyOn(current, '__consoleError').mockReturnValue();
    });
    afterEach(async () => {
      await unwatchAll();
    });
    const writeFile = async (filepath) => {
      await write(uuid(), config.rootPath(filepath));
      await waitForWatchers();
    };
    const writeTemplateFile = async (filepath) => {
      await write(uuid(), config.themePath(filepath));
      await waitForWatchers();
    };
    const whileWatching = async (callback) => {
      await current.watch();
      await callback();
      await waitForWatchers();
    };
    it('recompiles the whole CSS when parts are changed', async () => {
      await whileWatching(async () => {
        await writeFile('src/style.css');
        await writeFile('src/_styles/fonts.css');
        await writeFile('tailwind.config.js');

        await writeTemplateFile('style.css');
        await writeTemplateFile('_includes/theme/fonts.css');
      });

      expect(current.compile).toHaveBeenCalledTimes(5);
    });
    describe('compilation errors', () => {
      it('should display compilation errors', async () => {
        current.compile.mockImplementation(() => {
          throw new Error('Compilation error');
        });

        await whileWatching(async () => {
          await writeFile('src/style.css');
        });

        expect(current.__consoleError).toHaveBeenCalledWith(
          expect.stringContaining('Compilation error')
        );
      });
    });
  });
});
