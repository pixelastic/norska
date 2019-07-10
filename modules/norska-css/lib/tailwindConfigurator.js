import helper from 'norska-helper';
// import config from 'norska-config';
import { _ } from 'golgoth';

export default {
  // Flatten all the color palette into a one-level-deep object
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
      1: '0.75rem',
      2: '0.875rem',
      3: '1rem',
      base: '1rem',
      4: '1.125rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.875rem',
      8: '2.25rem',
      9: '3rem',
      10: '4rem',
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
    const fontWeight = this.flattenColors(theme('fontWeight'));
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
  // userConfig() {
  //   return helper.require(config.rootPath('tailwind.config.js'));
  // },
  init() {
    return {
      theme: {
        colors: this.getColors(),
        fontSize: this.getFontSizes(),
      },
      plugins: [
        _.bind(this.pluginSimplerTextColors, this),
        _.bind(this.pluginSimplerBold, this),
        _.bind(this.pluginSimplerStrike, this),
      ],
    };
    // console.info(this.userConfig());
    // return this.userConfig()(defaultTheme);
  },
  __defaultTheme() {
    return helper.require('tailwindcss/defaultTheme');
  },
};
