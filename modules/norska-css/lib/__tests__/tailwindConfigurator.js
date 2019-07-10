import norskaCss from '../index';
import module from '../tailwindConfigurator';
import config from 'norska-config';
import firost from 'firost';
import css from 'css';
import { _ } from 'golgoth';
// Note: beforeAll calls are ALWAYS called, even when tests are
// focused/skipped, which will slow down things a lot. To work around
// this, we created a __hackDisableBeforeAll variable to skip the
// beforeAll when set to true. This is easier than commenting the whole
// block...
// See https://github.com/facebook/jest/issues/8614 for the bug
const __hackDisableBeforeAll = false;

/**
 * Read a CSS file and return an object of rules with associated props, to ease
 * testing
 * @param {string} filepath Path to the CSS files
 * @returns {object} Object representing the CSS rules and props
 **/
async function cssToObject(filepath) {
  const content = await firost.read(filepath);
  const rules = _.filter(css.parse(content).stylesheet.rules, { type: 'rule' });
  const result = _.transform(
    rules,
    (allRules, rule) => {
      const selector = rule.selectors.join(', ');
      const declarations = _.filter(rule.declarations, { type: 'declaration' });
      const properties = _.transform(
        declarations,
        (allProperties, declaration) => {
          allProperties[_.camelCase(declaration.property)] = declaration.value;
        },
        {}
      );

      // Store the results in .classes or .tags depending on the selector
      if (_.startsWith(selector, '.')) {
        allRules.classes[_.trimStart(selector, '.')] = properties;
      } else {
        allRules.tags[selector] = properties;
      }
    },
    { classes: {}, tags: {} }
  );
  return result;
}
/**
 * Helper function to initconfig to only compile the tailwind file
 **/
async function configInit() {
  await config.init({
    from: './fixtures/src',
    to: './tmp/norska-css-tailwind',
    css: {
      input: 'tailwind.css',
    },
  });
}

describe('tailwindConfigurator', () => {
  describe('flattenColors', () => {
    it('should return root level string keys as-is', () => {
      const input = { black: '#000' };
      const actual = module.flattenColors(input);

      expect(actual).toHaveProperty('black', '#000');
    });
    it('should return nested keys as dash-separated keys', () => {
      const input = { red: { 1: 'foo', 2: 'bar' } };
      const actual = module.flattenColors(input);

      expect(actual).toHaveProperty('red-1', 'foo');
      expect(actual).toHaveProperty('red-2', 'bar');
    });
    it('should use the .default value for the top level color', () => {
      const input = { red: { 1: 'foo', default: 'bar' } };
      const actual = module.flattenColors(input);

      expect(actual).toHaveProperty('red-1', 'foo');
      expect(actual).toHaveProperty('red', 'bar');
    });
  });
  describe('getColors', () => {
    it('should add a default key equal to the 600', () => {
      jest
        .spyOn(module, '__defaultTheme')
        .mockReturnValue({ colors: { red: { 600: 'foo' } } });

      const actual = module.getColors();

      expect(actual).toHaveProperty('red.default', 'foo');
    });
    it('should not change the default key if already set', () => {
      jest
        .spyOn(module, '__defaultTheme')
        .mockReturnValue({ colors: { red: { default: 'bar', 600: 'foo' } } });

      const actual = module.getColors();

      expect(actual).toHaveProperty('red.default', 'bar');
    });
    it('should not change keys set as strings', () => {
      jest
        .spyOn(module, '__defaultTheme')
        .mockReturnValue({ colors: { red: 'bar' } });

      const actual = module.getColors();

      expect(actual).toHaveProperty('red', 'bar');
    });
    it('should set all X00 scale to X', () => {
      jest
        .spyOn(module, '__defaultTheme')
        .mockReturnValue({ colors: { red: { 600: 'foo' } } });

      const actual = module.getColors();

      expect(actual).not.toHaveProperty('red.600');
      expect(actual).toHaveProperty('red.6', 'foo');
    });
  });
  describe('getFontSizes', () => {
    it('should have an increasing scale from 1 to 10', () => {
      // Convert string rem values to float for comparison
      const actual = _.mapValues(module.getFontSizes(), value => {
        return parseFloat(_.replace(value, 'rem', ''));
      });

      expect(actual['0']).toBeLessThan(actual['1']);
      expect(actual['1']).toBeLessThan(actual['2']);
      expect(actual['2']).toBeLessThan(actual['3']);
      expect(actual['3']).toBeLessThan(actual['4']);
      expect(actual['4']).toBeLessThan(actual['5']);
      expect(actual['5']).toBeLessThan(actual['6']);
      expect(actual['6']).toBeLessThan(actual['7']);
      expect(actual['7']).toBeLessThan(actual['8']);
      expect(actual['8']).toBeLessThan(actual['9']);
      expect(actual['9']).toBeLessThan(actual['10']);
    });
    it('should have a base equal to step 3', () => {
      const actual = module.getFontSizes();

      expect(actual.base).toEqual(actual['3']);
    });
    it('should have a step 0 to hide it', () => {
      const actual = module.getFontSizes();

      expect(actual['0']).toEqual('0rem');
    });
  });
  describe('pluginSimplerTextColors', () => {
    it('should create classes for each shade', () => {
      const mockAddUtilities = jest.fn();
      const mockTheme = jest.fn().mockReturnValue({
        red: {
          1: 'foo',
          2: 'bar',
        },
      });
      const expected = {
        '.red-1': { color: 'foo' },
        '.red-2': { color: 'bar' },
      };

      module.pluginSimplerTextColors({
        addUtilities: mockAddUtilities,
        theme: mockTheme,
      });

      expect(mockAddUtilities).toHaveBeenCalledWith(expected);
    });
    it('should create classes for each top level color', () => {
      const mockAddUtilities = jest.fn();
      const mockTheme = jest.fn().mockReturnValue({
        black: '#000',
      });
      const expected = {
        '.black': { color: '#000' },
      };

      module.pluginSimplerTextColors({
        addUtilities: mockAddUtilities,
        theme: mockTheme,
      });

      expect(mockAddUtilities).toHaveBeenCalledWith(expected);
    });
    it('should create classes for default color values', () => {
      const mockAddUtilities = jest.fn();
      const mockTheme = jest.fn().mockReturnValue({
        red: {
          1: 'foo',
          default: 'bar',
        },
      });
      const expected = {
        '.red-1': { color: 'foo' },
        '.red': { color: 'bar' },
      };

      module.pluginSimplerTextColors({
        addUtilities: mockAddUtilities,
        theme: mockTheme,
      });

      expect(mockAddUtilities).toHaveBeenCalledWith(expected);
    });
  });
  describe('pluginSimplerBold', () => {
    it('should add a .bold class equal to .font-bold', () => {
      const mockAddUtilities = jest.fn();
      const mockTheme = jest.fn().mockReturnValue({
        bold: 700,
      });
      const expected = {
        '.bold': { fontWeight: 700 },
      };

      module.pluginSimplerBold({
        addUtilities: mockAddUtilities,
        theme: mockTheme,
      });

      expect(mockAddUtilities).toHaveBeenCalledWith(expected);
    });
  });
  describe('pluginSimplerStrike', () => {
    it('should add a .strike class equal to .line-through', () => {
      const mockAddUtilities = jest.fn();
      const expected = {
        '.strike': { textDecoration: 'line-through' },
      };

      module.pluginSimplerStrike({
        addUtilities: mockAddUtilities,
      });

      expect(mockAddUtilities).toHaveBeenCalledWith(expected);
    });
  });
  describe('full run', () => {
    let output;
    beforeAll(async () => {
      // Note: Mocks are only restored when a test starts, so they are still
      // active here. That's why we restore them manually, otherwise we'll end
      // up with test data
      jest.restoreAllMocks();
      if (__hackDisableBeforeAll) return;
      await configInit();
      await firost.emptyDir('./tmp/norska-css-tailwind');
      await norskaCss.run();
      output = await cssToObject(config.toPath('tailwind.css'));
    });
    beforeEach(async () => {
      await configInit();
    });
    it('should contain a tailwind default class', async () => {
      expect(output).toHaveProperty('classes.inline.display', 'inline');
    });
    it('should set all scales to X instead of X00', async () => {
      expect(output).not.toHaveProperty('classes.bg-red-600');
      expect(output).toHaveProperty('classes.bg-red-6');
    });
    it('should set default colors for each colors', async () => {
      expect(output).toHaveProperty('classes.bg-red', {
        backgroundColor: output.classes['bg-red-6'].backgroundColor,
      });
    });
    it('should allow using .white instead of .text-white', async () => {
      expect(output).toHaveProperty(
        'classes.white',
        output.classes['text-white']
      );
    });
    it('should allow using .bold instead of .font-bold', async () => {
      expect(output).toHaveProperty(
        'classes.bold',
        output.classes['font-bold']
      );
    });
    it('should allow using .strike instead of .line-through', async () => {
      expect(output).toHaveProperty(
        'classes.strike',
        output.classes['line-through']
      );
    });
    it('should use a numeric scale for font-size', async () => {
      expect(output).toHaveProperty('classes.text-1');
      expect(output).toHaveProperty('classes.text-2');
      expect(output).toHaveProperty('classes.text-3');
      expect(output).toHaveProperty('classes.text-4');
      expect(output).toHaveProperty('classes.text-5');
      expect(output).toHaveProperty('classes.text-6');
      expect(output).toHaveProperty('classes.text-7');
      expect(output).toHaveProperty('classes.text-8');
    });
    it('should have a font-0 for hiding text', async () => {
      expect(output).toHaveProperty('classes.text-0.fontSize', '0rem');
    });
  });
});
