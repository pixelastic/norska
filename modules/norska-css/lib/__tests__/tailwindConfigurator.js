import norskaCss from '../index';
// import module from '../tailwindConfigurator';
import config from 'norska-config';
import firost from 'firost';
import css from 'css';
import { _ } from 'golgoth';

/**
 * Read a CSS file and return an object of rules with associated props, to ease
 * testing
 * @param {string} filepath Path to the CSS files
 * @returns {object} Object representing the CSS rules and props
 **/
async function cssToObject(filepath) {
  const content = await firost.read(filepath);
  const ast = css.parse(content).stylesheet.rules;
  const result = _.transform(
    _.filter(ast, { type: 'rule' }),
    (allRules, rule) => {
      const selector = rule.selectors.join(', ');
      const properties = _.transform(
        _.filter(rule.declarations, { type: 'declaration' }),
        (allProperties, declaration) => {
          allProperties[_.camelCase(declaration.property)] = declaration.value;
        },
        {}
      );

      allRules[selector] = properties;
    },
    {}
  );
  return result;
}

describe('tailwindConfigurator', () => {
  /**
   * Helper function to initconfig to only compile the tailwind file
   **/
  async function configInit() {
    await config.init({
      from: './fixtures/src',
      to: './tmp/norska-css',
      css: {
        input: 'tailwind.css',
      },
    });
  }
  describe('full run', () => {
    let output;
    beforeAll(async () => {
      await configInit();
      await firost.emptyDir('./tmp/norska-css');
      await norskaCss.run();
      output = await cssToObject(config.toPath('tailwind.css'));
    });
    beforeEach(async () => {
      await configInit();
    });
    it('should contain a tailwind default class', async () => {
      expect(output['.inline']).toEqual({ display: 'inline' });
    });
    // it('should contain', async () => {
    // });
  });
});
