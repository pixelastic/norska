const current = require('../main');
const config = require('norska-config');
const helper = require('norska-helper');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const path = require('path');
const waitForWatchers = require('firost/waitForWatchers');
const uuid = require('firost/uuid');
const unwatchAll = require('firost/unwatchAll');

describe('norska-css', () => {
  const tmpDirectory = './tmp/norska-css/index';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
  });
  describe('getPlugins', () => {
    beforeEach(() => {
      jest.spyOn(current, '__pluginImport').mockReturnValue('pluginImport');
      jest.spyOn(current, '__pluginNested').mockReturnValue('pluginNested');
      jest.spyOn(current, '__pluginTailwind').mockReturnValue('pluginTailwind');
      jest.spyOn(current, '__pluginPurge').mockReturnValue('pluginPurge');
      jest.spyOn(current, '__pluginClean').mockReturnValue('pluginClean');
      jest
        .spyOn(current, '__pluginAutoprefixer')
        .mockReturnValue('pluginAutoprefixer');
      jest.spyOn(current, 'getTailwindConfigPath').mockReturnValue();
    });
    it('should contain 3 plugins', async () => {
      const actual = await current.getPlugins();

      expect(actual).toEqual([
        'pluginImport',
        'pluginNested',
        'pluginTailwind',
      ]);
    });
    it('should call tailwind with the config file', async () => {
      jest.spyOn(current, 'getTailwindConfigPath').mockReturnValue('foo.js');

      await current.getPlugins();

      expect(current.__pluginTailwind).toHaveBeenCalledWith('foo.js');
    });
    describe('in production', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('should contain 6 plugins', async () => {
        const actual = await current.getPlugins();

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
      jest.spyOn(config, 'root').mockReturnValue(path.resolve(tmpDirectory));
      await emptyDir(tmpDirectory);
    });
    it('should return path to host file if available', async () => {
      const expected = config.rootPath('tailwind.config.js');
      await write('foo', expected);

      const actual = await current.getTailwindConfigPath();

      expect(actual).toEqual(expected);
    });
    it('should return path to norska file if none in path', async () => {
      const actual = await current.getTailwindConfigPath();

      expect(actual).toEqual(path.resolve(__dirname, '../tailwind/index.js'));
    });
  });
  describe('getCompiler', () => {
    it('should return the postcss().process method, correctly bound', async () => {
      jest.spyOn(current, 'getPlugins').mockReturnValue('my plugins');
      jest.spyOn(current, '__postcss').mockImplementation(function (plugins) {
        return {
          plugins,
          process: jest.fn().mockImplementation(function () {
            return this.plugins;
          }),
        };
      });

      const actual = await current.getCompiler();

      expect(actual()).toEqual('my plugins');
    });
  });
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
  describe('convert', () => {
    beforeEach(async () => {
      await emptyDir(tmpDirectory);
      await write(
        '.blue { color: blue; }',
        config.fromPath('_styles/imported.css')
      );
      await write('.alpha { color: green; }', config.themePath('alpha.css'));
      await write('.beta { color: green; }', config.themePath('beta.css'));
      await write(
        '<div class="select"><a href="#">Link</a></div>',
        config.toPath('index.html')
      );
    });
    const input = dedent`
      /* Simple comment */
      /*! Special comment */
      @import "./_styles/imported.css";
      @import "theme:alpha.css";
      @import 'theme:beta.css';

      .select { a { user-select: none; } }
      .ais-hit, .js-hit { 
        color: green; 
        span {
          color: green;
        }
      }
      /* purgecss start ignore */
      .keep-me { color: green; }
      /* purgecss end ignore */
    `;
    it.each([
      [
        'dev',
        dedent`
        /* Simple comment */

        /*! Special comment */

        .blue { color: blue;
        }

        .alpha { color: green;
        }

        .beta { color: green;
        }

        .select a { user-select: none;
        }

        .ais-hit, .js-hit {
          color: green;
        }

        .ais-hit span, .js-hit span {
          color: green;
        }

        /* purgecss start ignore */

        .keep-me { color: green;
        }

        /* purgecss end ignore */
        `,
      ],
      [
        'prod',
        [
          '.select a{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}',
          '.ais-hit,.js-hit{color:green}',
          '.ais-hit span,.js-hit span{color:green}',
          '.keep-me{color:green}',
        ].join(''),
      ],
    ])('in %s', async (envName, expected) => {
      const envHash = {
        dev: false,
        prod: true,
      };
      jest.spyOn(helper, 'isProduction').mockReturnValue(envHash[envName]);
      const actual = await current.convert(input);
      expect(actual).toEqual(expected);
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
      jest
        .spyOn(current, 'getTailwindConfigPath')
        .mockReturnValue(config.rootPath('tailwind.config.js'));
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
