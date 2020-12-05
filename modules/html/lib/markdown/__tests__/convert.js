const current = require('../convert');
const config = require('norska-config');
const helper = require('norska-helper');
const _ = require('golgoth/lodash');

describe('norska-html > markdown > convert', () => {
  const tmpDirectory = './tmp/norska-html/markdown/convert';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    config.set('runtime.productionUrl', 'http://here.com');
  });
  const envs = {
    dev: false,
    prod: true,
  };
  describe('run', () => {
    it.each([
      [
        'Nominal case',
        'index.html',
        dedent`
          # Title

          Text`,
        '<h1 id="title"><a href="#title">Title</a></h1><p>Text</p>',
      ],
      [
        'Allow HTML in source',
        'index.html',
        '<h1 class="title">Title</h1>',
        '<h1 class="title">Title</h1>',
      ],
      [
        'Convert text urls',
        'index.html',
        'http://there.com/',
        '<p><a href="http://there.com">http://there.com/</a></p>',
      ],
    ])('%s', async (_name, sourceFile, markdown, expected) => {
      const actual = await current.run(markdown, sourceFile);
      expect(actual).toEqual(expected);
    });
    describe('images', () => {
      const testCases = [
        [
          '![](http://there.com/cover.png)',
          'index.html',
          {
            dev:
              '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
            prod:
              '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
          },
        ],
        [
          '![](cover.png)',
          'index.html',
          {
            dev:
              '<p><img alt="" class="lazyload" data-src="cover.png" loading="lazy" src="cover.png"></p>',
            prod:
              '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2F%7Brevv%3A%20%2Fcover.png%7D&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2F%7Brevv%3A%20%2Fcover.png%7D&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
          },
        ],
        [
          '![](/cover.png)',
          'blog/index.html',
          {
            dev:
              '<p><img alt="" class="lazyload" data-src="../cover.png" loading="lazy" src="../cover.png"></p>',
            prod:
              '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2F%7Brevv%3A%20%2Fcover.png%7D&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2F%7Brevv%3A%20%2Fcover.png%7D&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
          },
        ],
        [
          '![](cover.png)',
          'blog/index.html',
          {
            dev:
              '<p><img alt="" class="lazyload" data-src="cover.png" loading="lazy" src="cover.png"></p>',
            prod:
              '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2F%7Brevv%3A%20%2Fblog%2Fcover.png%7D&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2F%7Brevv%3A%20%2Fblog%2Fcover.png%7D&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
          },
        ],
      ];
      _.each(envs, (isProduction, envName) => {
        it.each(testCases)(
          `[${envName}]: %s in %s`,
          (markdownSource, sourceFile, expected) => {
            jest.spyOn(helper, 'isProduction').mockReturnValue(isProduction);
            const actual = current.run(markdownSource, sourceFile);
            expect(actual).toEqual(expected[envName]);
          }
        );
      });
      describe('with imgUrlPrefix', () => {
        const imgUrlPrefixTestCases = [
          [
            '![](http://there.com/cover.png)',
            'index.html',
            null,
            {
              dev:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
              prod:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=http%3A%2F%2Fthere.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
            },
          ],
          [
            '![](cover.png)',
            'index.html',
            'https://assets.com',
            {
              dev:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
              prod:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
            },
          ],
          [
            '![](cover.png)',
            'blog/index.html',
            'https://assets.com',
            {
              dev:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
              prod:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
            },
          ],
          [
            '![](/cover.png)',
            'blog/index.html',
            'https://assets.com',
            {
              dev:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
              prod:
                '<p><img alt="" class="lazyload" data-src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;il" loading="lazy" src="https://images.weserv.nl?url=https%3A%2F%2Fassets.com%2Fcover.png&amp;af&amp;blur=5&amp;il&amp;q=50"></p>',
            },
          ],
        ];
        _.each(envs, (isProduction, envName) => {
          it.each(imgUrlPrefixTestCases)(
            `[${envName}]: %s in %s with %s`,
            (markdownSource, sourceFile, imgUrlPrefix, expected) => {
              jest.spyOn(helper, 'isProduction').mockReturnValue(isProduction);
              const options = { imgUrlPrefix };
              const actual = current.run(markdownSource, sourceFile, options);
              expect(actual).toEqual(expected[envName]);
            }
          );
        });
      });
    });
    describe('syntax highlight', () => {
      it.each([
        ['javascript', 'var x = 42;'],
        ['html', '<strong>O</strong>'],
        ['css', '.here { background: red; }'],
        ['json', '{}'],
        ['pug', '.bold.white text'],
        ['yaml', 'name: aberlaas'],
      ])('%s', async (language, code) => {
        const actual = current.run(dedent`
          \`\`\`${language}
          ${code}
          \`\`\`
        `);
        expect(actual).toContain(
          `<pre><code class="hljs language-${language}">`
        );
      });
    });
    describe('links', () => {
      it.each([
        ['[blog](blog/)', 'index.html', '<p><a href="blog/">blog</a></p>'],
        ['[2020](2020/)', 'blog/index.html', '<p><a href="2020/">2020</a></p>'],
        ['[blog](/blog/)', 'index.html', '<p><a href="blog/">blog</a></p>'],
        [
          '[projects](/projects/)',
          'blog/index.html',
          '<p><a href="../projects/">projects</a></p>',
        ],
        [
          '[got](https://classic.yarnpkg.com/en/package/got)',
          'index.html',
          '<p><a href="https://classic.yarnpkg.com/en/package/got">got</a></p>',
        ],
      ])('%s in %s', (markdownSource, sourceFile, expected) => {
        const actual = current.run(markdownSource, sourceFile);
        expect(actual).toEqual(expected);
      });
    });
    describe('headers', () => {
      it.each([
        ['# Title', '<h1 id="title"><a href="#title">Title</a></h1>'],
        [
          '## Subtitle',
          '<h2 id="subtitle"><a href="#subtitle">Subtitle</a></h2>',
        ],
        [
          '# Getting Started',
          '<h1 id="gettingStarted"><a href="#gettingStarted">Getting Started</a></h1>',
        ],
        [
          '# We ♥ you',
          '<h1 id="weLoveYou"><a href="#weLoveYou">We ♥ you</a></h1>',
        ],
        [
          '# `require` **is** _important_',
          '<h1 id="requireIsImportant"><a href="#requireIsImportant"><code>require</code> <strong>is</strong> <em>important</em></a></h1>',
        ],
      ])('%s', (markdownSource, expected) => {
        const actual = current.run(markdownSource);
        expect(actual).toEqual(expected);
      });
    });
  });
});
