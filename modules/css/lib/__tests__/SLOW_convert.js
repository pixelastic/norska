const current = require('../main');
const config = require('norska-config');
const helper = require('norska-helper');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
// Tests should fail if build takes longer than this time
const MAX_ALLOWED_BUILD_TIME = 8000;

describe('norska-css > convert [slow]', () => {
  const tmpDirectory = './tmp/norska-css/convert';
  const themeDirectory = './tmp/norska-css/convert/theme';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
      theme: themeDirectory,
    });
  });
  describe('convert', () => {
    describe('for production', () => {
      beforeEach(async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);

        await emptyDir(tmpDirectory);
        await write(
          '.import-simple { color: green; }',
          config.fromPath('include.css')
        );
        await write(
          '.import-single-quotes { color: green; }',
          config.fromPath('include-single-quotes.css')
        );
        await write(
          '.import-subdir { color: green; }',
          config.fromPath('_styles/include.css')
        );
        await write(
          '.import-theme { color: green; }',
          config.themePath('theme.css')
        );
        await write(
          '.import-theme-single-quotes { color: green; }',
          config.themePath('theme-single-quotes.css')
        );
        await write(
          '.recursive { color: green; }',
          config.fromPath('recursive-down.css')
        );
        await write(
          '@import "./recursive-down.css";',
          config.fromPath('recursive-up.css')
        );

        await write(
          dedent`
             <p class="bg-green utility-one"><em>Yep</em></p>
         `,
          config.toPath('index.html')
        );
      });
      it(
        'should build a clean file',
        async () => {
          const input = dedent`
          /* Simple comment */
          /*! Special comment */

          @import "include.css";
          @import 'include-single-quotes.css';
          @import "_styles/include.css";
          @import "theme:theme.css";
          @import "theme:theme-single-quotes.css";
          @import "recursive-up.css";

          @tailwind utilities;

          .not-in-a-layer { color: green; }

          @layer utilities {
            .utility-one { color: green; }
            .utility-two { color: red; }
          }

          p { 
            em { color: green; }
          }

          .user-select { user-select: none; }
        `;
          const expected = [
            '.import-simple{color:green}',
            '.import-single-quotes{color:green}',
            '.import-subdir{color:green}',
            '.import-theme{color:green}',
            '.import-theme-single-quotes{color:green}',
            '.recursive{color:green}',
            '.bg-green{--bg-opacity:1;background-color:#38a169;background-color:rgba(56,161,105,var(--bg-opacity))}',
            '.table{display:table}', // Side effect of preserveHtmlElements
            '.utility-one{color:green}',
            '.not-in-a-layer{color:green}',
            'p em{color:green}',
            '.user-select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}',
          ].join('');
          const actual = await current.convert(input);
          expect(actual).toEqual(expected);
        },
        MAX_ALLOWED_BUILD_TIME
      );
    });
  });
});
