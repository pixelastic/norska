import helper from 'norska-helper';
// import config from 'norska-config';
import { _ } from 'golgoth';
import flexboxClasses from './flexbox';

export default {
  // Flatten all the color palette into a one-level-deep object
  // Allow accessing default .red or .red-5 colors more easily
  flattenColors(colors) {
    return _.transform(
      colors,
      (result, colorShades, colorName) => {
        if (!_.isObject(colorShades)) {
          result[colorName] = colorShades;
          return;
        }

        _.each(colorShades, (shadeValue, shadeName) => {
          if (shadeName === 'default') {
            result[colorName] = shadeValue;
            return;
          }

          result[`${colorName}-${shadeName}`] = shadeValue;
        });
      },
      {}
    );
  },
  // Get the default list of all colors, simplify the X00 to X scale and add
  // a default value
  getColors() {
    const defaultTheme = this.__defaultTheme();
    const colors = _.transform(
      defaultTheme.colors,
      (colorResult, colorShades, colorName) => {
        // Do nothing to colors set as strings and not shades
        if (!_.isObject(colorShades)) {
          colorResult[colorName] = colorShades;
          return;
        }

        // Convert X00 shades into simpler X shades
        const simplerShades = _.transform(
          colorShades,
          (shadeResult, shadeValue, shadeName) => {
            if (!_.endsWith(shadeName, '00')) {
              shadeResult[shadeName] = shadeValue;
              return;
            }

            shadeResult[_.replace(shadeName, '00', '')] = shadeValue;
          },
          {}
        );

        // Add a default shade value if none is set
        if (!_.has(simplerShades, 'default')) {
          simplerShades.default = simplerShades['6'];
        }

        colorResult[colorName] = simplerShades;
      },
      {}
    );

    return colors;
  },
  // Uses a numeric scale for the font-size instead of t-shirt size
  getFontSizes() {
    return {
      0: '0rem',
      '06': '0.25rem',
      '07': '0.5rem',
      '08': '0.75rem',
      '09': '0.875rem',
      1: '1rem',
      2: '1.125rem',
      3: '1.25rem',
      4: '1.5rem',
      5: '1.875rem',
      6: '2.25rem',
      7: '3rem',
      8: '4rem',
    };
  },
  getSpacingScale() {
    return {
      // No space at all
      0: '0',
      // Smaller than the base unit
      '01': '0.25rem',
      '02': '0.5rem',
      '03': '0.75rem',
      '04': '0.875rem',
      // Default scale
      1: '1rem',
      2: '1.25rem',
      3: '1.5rem',
      4: '2rem',
      5: '2.5rem',
      6: '3rem',
      7: '4rem',
      8: '5rem',
      9: '6rem',
      10: '8rem',
      11: '10rem',
      12: '12rem',
      13: '14rem',
      14: '16rem',
      // Percentage scale
      '10p': '10%',
      '15p': '15%',
      '20p': '20%',
      '25p': '25%',
      '30p': '30%',
      '33p': 'calc(100% / 3)',
      '40p': '40%',
      '50p': '50%',
      '60p': '60%',
      '66p': 'calc(100% / 1.5)',
      '70p': '70%',
      '75p': '75%',
      '80p': '80%',
      '90p': '90%',
      '100p': '100%',
      // vh scale
      '10vh': '10vh',
      '20vh': '20vh',
      '25vh': '25vh',
      '30vh': '30vh',
      '33vh': 'calc(100vh / 3)',
      '40vh': '40vh',
      '50vh': '50vh',
      '60vh': '60vh',
      '66vh': 'calc(100vh / 1.5)',
      '70vh': '70vh',
      '75vh': '75vh',
      '80vh': '80vh',
      '90vh': '90vh',
      '100vh': '100vh',
      // vw scale
      '10vw': '10vw',
      '20vw': '20vw',
      '25vw': '25vw',
      '30vw': '30vw',
      '33vw': 'calc(100vw / 3)',
      '40vw': '40vw',
      '50vw': '50vw',
      '60vw': '60vw',
      '66vw': 'calc(100vw / 1.5)',
      '70vw': '70vw',
      '75vw': '75vw',
      '80vw': '80vw',
      '90vw': '90vw',
      '100vw': '100vw',
    };
  },
  getZIndex() {
    return {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
    };
  },
  getBorderRadius() {
    return {
      0: '0',
      1: '.125rem',
      2: '.25rem',
      default: '.25rem',
      3: '.5rem',
      4: '1rem',
      full: '9999px',
    };
  },
  // Allow using colors directly with .white instead of .text-color
  pluginSimplerTextColors({ addUtilities, theme }) {
    const colors = this.flattenColors(theme('colors'));
    const newClasses = _.transform(
      colors,
      (result, colorValue, colorName) => {
        result[`.${colorName}`] = { color: colorValue };
      },
      {}
    );
    addUtilities(newClasses);
  },
  // Allow using .bold instead of .font-bold
  pluginSimplerBold({ addUtilities, theme }) {
    const fontWeight = theme('fontWeight');
    addUtilities({
      '.bold': {
        fontWeight: fontWeight.bold,
      },
    });
  },
  // Allow using .strike instead of .line-through
  pluginSimplerStrike({ addUtilities }) {
    addUtilities({
      '.strike': {
        textDecoration: 'line-through',
      },
    });
  },
  // Use a scale of line-height with .ln-X
  // 0 will remove it
  // 1 is 1 rem
  // base is 1.5
  pluginSimplerLineHeight({ addUtilities }) {
    const values = {
      0: 0,
      1: 1,
      2: 1.25,
      tight: 1.25,
      3: 1.375,
      4: 1.5,
      normal: 1.5,
      5: 1.625,
      6: 2,
      loose: 2,
    };
    const newClasses = _.transform(
      values,
      (result, value, key) => {
        result[`.lh-${key}`] = {
          lineHeight: value,
        };
      },
      {}
    );
    addUtilities(newClasses);
  },
  // Add .debug class to outline all elements
  pluginDebug({ addUtilities, theme }) {
    const debugColors = ['purple', 'pink', 'green', 'yellow', 'orange', 'red'];
    const colors = this.flattenColors(theme('colors'));
    const newClasses = {};
    _.times(debugColors.length, depth => {
      const selector = ['.debug', _.repeat('> * ', depth)].join(' ');
      const colorValue = colors[`${debugColors[depth]}-4`];
      newClasses[selector] = {
        outline: `1px solid ${colorValue}`,
      };
    });
    addUtilities(newClasses);
  },
  // Add all the flrnw and flc classes
  pluginFlexbox({ addUtilities }) {
    addUtilities(flexboxClasses);
  },
  pluginBullets({ addUtilities, theme }) {
    const colors = this.flattenColors(theme('colors'));
    const newClasses = {
      '.bullet:before': { content: '"• "' },
      '.bullet-arrow:before': { content: '"> "' },
      '.bullet-cross:before': { content: '"✗ "' },
      '.bullet-tick:before': { content: '"✓ "' },
    };
    // Add numbered bullets
    _.times(10, index => {
      newClasses[`.bullet-${index}:before`] = {
        content: `"${index}. "`,
      };
    });
    // Colored bullets
    _.each(colors, (value, colorName) => {
      newClasses[`.bullet-${colorName}:before`] = {
        color: value,
      };
    });
    addUtilities(newClasses);
  },
  init() {
    const spacingScale = this.getSpacingScale();
    return {
      separator: '_',
      theme: {
        borderRadius: this.getBorderRadius(),
        colors: this.getColors(),
        fontSize: this.getFontSizes(),
        spacing: spacingScale,
        minHeight: spacingScale,
        maxHeight: spacingScale,
        minWidth: spacingScale,
        maxWidth: spacingScale,
        zIndex: this.getZIndex(),
      },
      plugins: [
        _.bind(this.pluginBullets, this),
        _.bind(this.pluginDebug, this),
        _.bind(this.pluginFlexbox, this),
        _.bind(this.pluginSimplerBold, this),
        _.bind(this.pluginSimplerLineHeight, this),
        _.bind(this.pluginSimplerStrike, this),
        _.bind(this.pluginSimplerTextColors, this),
      ],
    };
  },
  __defaultTheme() {
    return helper.require('tailwindcss/defaultTheme');
  },
};
