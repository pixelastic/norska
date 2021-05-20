const pug = require('../../index.js');
const config = require('norska-config');
const helper = require('norska-helper');

describe('norska-html > pug > mixins > head', () => {
  const tmpDirectory = './tmp/norska-html/pug/mixins/head';
  describe('nominal case', () => {
    let actual;
    beforeAll(async () => {
      await config.init({
        from: `${tmpDirectory}/src`,
        to: `${tmpDirectory}/dist`,
      });
      await pug.init();
      config.set('runtime.gitCommit', 'abcdef');
      config.set('runtime.productionUrl', 'http://here.com');
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      const source = dedent`
        block content
          +norska_head()
            meta(name="custom", content="my value")
      `;
      const options = {
        from: 'blog.pug',
        to: 'blog/index.html',
        data: {
          data: {
            meta: {
              title: 'my title',
              description: 'my description',
              twitter: 'pixelastic',
            },
          },
          url: {
            pathToRoot: '../',
          },
          tweaks: {
            ensureUrlTrailingSlashSource: 'trailingSlashTweak()',
          },
        },
      };
      actual = await pug.convert(source, options);
    });
    it.each([
      ['<meta charset="utf-8"/>'],
      ['<title>my title</title>'],
      ['<meta name="description" content="my description"/>'],
      ['<meta name="twitter:card" content="summary_large_image"/>'],
      ['<meta name="twitter:site" content="@pixelastic"/>'],
      ['<meta property="og:title" content="my title"/>'],
      ['<meta property="og:description" content="my description"/>'],
      ['<meta property="og:url" content="http://here.com/blog"/>'],
      [
        '<meta property="og:image" content="https://images.weserv.nl?url=https%3A%2F%2Fapi.pixelastic.com%2Fscreenshots%2Frevv%3Aabcdef%2Fhttp%2Fhere.com%2Fblog&af&il&w=800"/>',
      ],
      ['<script>trailingSlashTweak()</script>'],
      ['<link rel="icon" href="../favicon.svg"/>'],
      ['<link type="text/css" rel="stylesheet" href="{revv: style.css}"/>'],
      ['<meta name="custom" content="my value"/>'],
    ])('%s', async (expected) => {
      expect(actual).toInclude(expected);
    });
  });
});
