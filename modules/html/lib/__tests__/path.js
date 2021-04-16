const current = require('../path');
const config = require('norska-config');
const assets = require('norska-assets');
const helper = require('norska-helper');
const _ = require('golgoth/lodash');
const imageProxy = require('norska-image-proxy');
jest.mock('norska-image-proxy');

describe('norska-html > path', () => {
  beforeEach(async () => {
    const tmpDirectory = './tmp/norska-html/path';
    await config.init({
      root: tmpDirectory,
    });
    config.set('runtime.productionUrl', 'http://here.com');
    config.set('runtime.gitCommit', 'abcdef');

    imageProxy.mockImplementation((url, options) => {
      const optionsAsString = _.chain(options)
        .map((value, key) => {
          return `${key}${value}`;
        })
        .camelCase()
        .value();
      return `http://proxy.com/?url=${url}&options=${optionsAsString}`;
    });
  });
  const envs = {
    dev: false,
    prod: true,
  };
  describe('isUrl', () => {
    it.each([
      ['http://here.com', true],
      ['https://here.com', true],
      ['./cover.png', false],
      ['cover.png', false],
      ['/cover.png', false],
    ])('%s', async (input, expected) => {
      const actual = current.isUrl(input);
      expect(actual).toEqual(expected);
    });
  });
  describe('isFromRoot', () => {
    it.each([
      ['http://here.com', false],
      ['https://here.com', false],
      ['./cover.png', false],
      ['cover.png', false],
      ['/cover.png', true],
    ])('%s', async (input, expected) => {
      const actual = current.isFromRoot(input);
      expect(actual).toEqual(expected);
    });
  });
  describe('pathFromFile', () => {
    it.each([
      // target, sourceFile, expected
      ['image.png', 'index.html', 'image.png'],
      ['./image.png', 'index.html', 'image.png'],
      ['assets/image.png', 'index.html', 'assets/image.png'],
      ['./assets/image.png', 'index.html', 'assets/image.png'],

      ['image.png', 'blog/index.html', 'image.png'],
      ['./image.png', 'blog/index.html', 'image.png'],
      ['assets/image.png', 'blog/index.html', 'assets/image.png'],
      ['./assets/image.png', 'blog/index.html', 'assets/image.png'],

      ['/image.png', 'index.html', 'image.png'],
      ['/blog/image.png', 'index.html', 'blog/image.png'],

      ['/image.png', 'blog/index.html', '../image.png'],
      ['/assets/image.png', 'blog/index.html', '../assets/image.png'],
      ['/blog/image.png', 'blog/index.html', 'image.png'],
    ])('%s from %s', (target, sourceFile, expected) => {
      const actual = current.pathFromFile(target, sourceFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('pathFromRoot', () => {
    it.each([
      // target, sourceFile, expected
      ['image.png', 'index.html', 'image.png'],
      ['./image.png', 'index.html', 'image.png'],
      ['assets/image.png', 'index.html', 'assets/image.png'],
      ['./assets/image.png', 'index.html', 'assets/image.png'],

      ['image.png', 'blog/index.html', 'blog/image.png'],
      ['./image.png', 'blog/index.html', 'blog/image.png'],
      ['assets/image.png', 'blog/index.html', 'blog/assets/image.png'],
      ['./assets/image.png', 'blog/index.html', 'blog/assets/image.png'],

      ['/image.png', 'index.html', 'image.png'],
      ['/blog/image.png', 'index.html', 'blog/image.png'],

      ['/image.png', 'blog/index.html', 'image.png'],
      ['/assets/image.png', 'blog/index.html', 'assets/image.png'],
      ['/blog/image.png', 'blog/index.html', 'blog/image.png'],
    ])('%s from %s', (target, sourceFile, expected) => {
      const actual = current.pathFromRoot(target, sourceFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('remoteUrl', () => {
    describe('in dev', () => {
      it.each([
        // target, sourceFile, expected
        [
          'http://there.com/image.png',
          'index.html',
          'http://there.com/image.png',
        ],
        ['image.png', 'index.html', 'http://here.com/image.png'],
        ['assets/image.png', 'index.html', 'http://here.com/assets/image.png'],

        ['image.png', 'blog/index.html', 'http://here.com/blog/image.png'],
        [
          'assets/image.png',
          'blog/index.html',
          'http://here.com/blog/assets/image.png',
        ],

        ['/image.png', 'index.html', 'http://here.com/image.png'],
        ['/blog/image.png', 'index.html', 'http://here.com/blog/image.png'],

        ['/image.png', 'blog/index.html', 'http://here.com/image.png'],
        [
          '/assets/image.png',
          'blog/index.html',
          'http://here.com/assets/image.png',
        ],
        [
          '/blog/image.png',
          'blog/index.html',
          'http://here.com/blog/image.png',
        ],
      ])('%s from %s', (target, sourceFile, expected) => {
        const actual = current.remoteUrl(target, sourceFile);
        expect(actual).toEqual(expected);
      });
    });
    describe('in prod', () => {
      it.each([
        // target, sourceFile, expected
        [
          'http://there.com/image.png',
          'index.html',
          'http://there.com/image.png',
        ],
        ['image.png', 'index.html', 'http://here.com/{revv: /image.png}'],
        [
          'assets/image.png',
          'index.html',
          'http://here.com/{revv: /assets/image.png}',
        ],

        [
          'image.png',
          'blog/index.html',
          'http://here.com/{revv: /blog/image.png}',
        ],
        [
          'assets/image.png',
          'blog/index.html',
          'http://here.com/{revv: /blog/assets/image.png}',
        ],

        ['/image.png', 'index.html', 'http://here.com/{revv: /image.png}'],
        [
          '/blog/image.png',
          'index.html',
          'http://here.com/{revv: /blog/image.png}',
        ],

        ['/image.png', 'blog/index.html', 'http://here.com/{revv: /image.png}'],
        [
          '/assets/image.png',
          'blog/index.html',
          'http://here.com/{revv: /assets/image.png}',
        ],
        [
          '/blog/image.png',
          'blog/index.html',
          'http://here.com/{revv: /blog/image.png}',
        ],
      ])('%s from %s', (target, sourceFile, expected) => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        const actual = current.remoteUrl(target, sourceFile);
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('pageUrl', () => {
    it.each([
      // sourceFile, expected
      ['index.html', 'http://here.com'],
      ['blog/index.html', 'http://here.com/blog'],
    ])('%s from %s', (sourceFile, expected) => {
      const actual = current.pageUrl(sourceFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('revv', () => {
    describe('in dev', () => {
      it('should not do anything', async () => {
        const actual = current.revv('cover.png', 'index.html');
        expect(actual).toEqual('cover.png');
      });
    });
    describe('in production', () => {
      it.each([
        // destination, filepath, expected
        ['cover.png', 'index.html', '{revv: cover.png}'],
        ['./cover.png', 'index.html', '{revv: cover.png}'],
        ['/cover.png', 'index.html', '{revv: /cover.png}'],

        ['assets/cover.png', 'index.html', '{revv: assets/cover.png}'],
        ['./assets/cover.png', 'index.html', '{revv: assets/cover.png}'],
        ['/assets/cover.png', 'index.html', '{revv: /assets/cover.png}'],

        ['cover.png', 'blog/index.html', '{revv: blog/cover.png}'],
        ['./cover.png', 'blog/index.html', '{revv: blog/cover.png}'],
        ['/cover.png', 'blog/index.html', '{revv: /cover.png}'],
        [
          'assets/cover.png',
          'blog/index.html',
          '{revv: blog/assets/cover.png}',
        ],
        [
          './assets/cover.png',
          'blog/index.html',
          '{revv: blog/assets/cover.png}',
        ],
        ['/assets/cover.png', 'blog/index.html', '{revv: /assets/cover.png}'],

        ['../style.css', 'blog/index.html', '{revv: style.css}'],
      ])('%s from %s', (target, sourceFile, expected) => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        const actual = current.revv(target, sourceFile);
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('img', () => {
    describe('in dev', () => {
      it('should not do anything for local files', async () => {
        const actual = current.img('cover.png', 'index.html');
        expect(actual).toEqual('cover.png');
      });
      it('should pass remote files through the proxy', async () => {
        const actual = current.img('https://there.com/cover.png', 'index.html');
        expect(actual).toEqual(
          'http://proxy.com/?url=https://there.com/cover.png&options='
        );
      });
    });
    describe('in prod', () => {
      it.each([
        // destination, filepath, expected
        [
          'cover.png',
          'index.html',
          'http://proxy.com/?url=http://here.com/{revv: /cover.png}&options=',
        ],
        [
          '/cover.png',
          'index.html',
          'http://proxy.com/?url=http://here.com/{revv: /cover.png}&options=',
        ],
        [
          'assets/cover.png',
          'index.html',
          'http://proxy.com/?url=http://here.com/{revv: /assets/cover.png}&options=',
        ],
        [
          'cover.png',
          'blog/index.html',
          'http://proxy.com/?url=http://here.com/{revv: /blog/cover.png}&options=',
        ],
        [
          '/cover.png',
          'blog/index.html',
          'http://proxy.com/?url=http://here.com/{revv: /cover.png}&options=',
        ],
        [
          'assets/cover.png',
          'blog/index.html',
          'http://proxy.com/?url=http://here.com/{revv: /blog/assets/cover.png}&options=',
        ],
        [
          '/assets/cover.png',
          'blog/index.html',
          'http://proxy.com/?url=http://here.com/{revv: /assets/cover.png}&options=',
        ],
        [
          '../cover.png',
          'blog/index.html',
          'http://proxy.com/?url=http://here.com/{revv: /cover.png}&options=',
        ],
        [
          'http://here.com//blog/../cover.png',
          'index.html',
          'http://proxy.com/?url=http://here.com/cover.png&options=',
        ],
      ])('%s from %s', (target, sourceFile, expected) => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        const actual = current.img(target, sourceFile, {});
        expect(actual).toEqual(expected);
      });
    });
  });
  describe('lazyload', () => {
    beforeEach(async () => {
      jest.spyOn(assets, 'readImageManifest').mockImplementation((filepath) => {
        return {
          base64Lqip: `base64:${filepath}`,
        };
      });
    });
    const testCases = [
      // target, sourceFile, options, expecteds
      [
        'http://there.com/cover.png',
        'index.html',
        {},
        {
          dev: {
            full: 'http://proxy.com/?url=http://there.com/cover.png&options=',
            placeholder:
              'http://proxy.com/?url=http://there.com/cover.png&options=blur5Quality50',
          },
          prod: {
            full: 'http://proxy.com/?url=http://there.com/cover.png&options=',
            placeholder:
              'http://proxy.com/?url=http://there.com/cover.png&options=blur5Quality50',
          },
        },
      ],
      [
        'cover.png',
        'index.html',
        {},
        {
          dev: {
            full: 'cover.png',
            placeholder: 'base64:cover.png',
          },
          prod: {
            full:
              'http://proxy.com/?url=http://here.com/{revv: /cover.png}&options=',
            placeholder: 'base64:cover.png',
          },
        },
      ],
      [
        '/cover.png',
        'blog/index.html',
        {},
        {
          dev: {
            full: '../cover.png',
            placeholder: 'base64:cover.png',
          },
          prod: {
            full:
              'http://proxy.com/?url=http://here.com/{revv: /cover.png}&options=',
            placeholder: 'base64:cover.png',
          },
        },
      ],
      [
        'cover.png',
        'blog/index.html',
        {},
        {
          dev: {
            full: 'cover.png',
            placeholder: 'base64:blog/cover.png',
          },
          prod: {
            full:
              'http://proxy.com/?url=http://here.com/{revv: /blog/cover.png}&options=',
            placeholder: 'base64:blog/cover.png',
          },
        },
      ],
      [
        'cover.png',
        'blog/index.html',
        {
          disable: true,
        },
        {
          dev: {
            full: 'cover.png',
            placeholder: 'cover.png',
          },
          prod: {
            full:
              'http://proxy.com/?url=http://here.com/{revv: /blog/cover.png}&options=',
            placeholder:
              'http://proxy.com/?url=http://here.com/{revv: /blog/cover.png}&options=',
          },
        },
      ],
      [
        'cover.png',
        'blog/index.html',
        {
          blur: 42,
          // Placeholder options are ignored for local files
          placeholder: {
            blur: 142,
          },
        },
        {
          dev: {
            full: 'cover.png',
            placeholder: 'base64:blog/cover.png',
          },
          prod: {
            full:
              'http://proxy.com/?url=http://here.com/{revv: /blog/cover.png}&options=blur42',
            placeholder: 'base64:blog/cover.png',
          },
        },
      ],
      [
        'https://www.example.com/picture.png',
        'index.html',
        {
          blur: 42,
          placeholder: {
            blur: 142,
          },
        },
        {
          dev: {
            full:
              'http://proxy.com/?url=https://example.com/picture.png&options=blur42',
            placeholder:
              'http://proxy.com/?url=https://example.com/picture.png&options=blur142Quality50',
          },
          prod: {
            full:
              'http://proxy.com/?url=https://example.com/picture.png&options=blur42',
            placeholder:
              'http://proxy.com/?url=https://example.com/picture.png&options=blur142Quality50',
          },
        },
      ],
    ];
    _.each(envs, (isProduction, envName) => {
      it.each(testCases)(
        `[${envName}]: %s from %s`,
        (target, sourceFile, options, expected) => {
          jest.spyOn(helper, 'isProduction').mockReturnValue(isProduction);
          const actual = current.lazyload(target, sourceFile, options);
          expect(actual).toHaveProperty('full', expected[envName].full);
          expect(actual).toHaveProperty(
            'placeholder',
            expected[envName].placeholder
          );
        }
      );
    });
  });
  describe('screenshot', () => {
    it.each([
      // target, sourceFile, expected
      [
        'Remote page',
        'http://there.com/',
        'index.html',
        'http://proxy.com/?url=https://api.microlink.io/?embed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=http%3A%2F%2Fthere.com&waitForTimeout=5000&options=width800',
      ],
      [
        'Remote page with query string',
        'http://there.com/?sort=asc&name=norska',
        'index.html',
        'http://proxy.com/?url=https://api.microlink.io/?embed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=http%3A%2F%2Fthere.com%2F%3Fname%3Dnorska%26sort%3Dasc&waitForTimeout=5000&options=width800',
      ],
      [
        'Local page in subfolder',
        'blog/index.html',
        'index.html',
        'http://proxy.com/?url=https://api.microlink.io/?embed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=http%3A%2F%2Fhere.com%2Fblog&waitForTimeout=5000&options=width800',
      ],
      [
        'Current page',
        null,
        'index.html',
        'http://proxy.com/?url=https://api.microlink.io/?embed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=http%3A%2F%2Fhere.com&waitForTimeout=5000&options=width800',
      ],
      [
        'Current page, in subfolder',
        null,
        'blog/index.html',
        'http://proxy.com/?url=https://api.microlink.io/?embed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=http%3A%2F%2Fhere.com%2Fblog&waitForTimeout=5000&options=width800',
      ],
    ])('%s', async (_name, target, sourceFile, expected) => {
      const actual = current.screenshot(target, sourceFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('link', () => {
    it.each([
      ['blog/', 'index.html', 'blog/'],
      ['/blog/', 'index.html', 'blog/'],
      ['/blog/', 'blog/index.html', '.'],
      ['/projects/', 'blog/index.html', '../projects/'],
      ['2020/', 'blog/index.html', '2020/'],
      ['http://there.com', 'index.html', 'http://there.com'],
      ['http://there.com/', 'index.html', 'http://there.com'],
    ])('[%s] %s is %s', async (target, sourceFile, expected) => {
      const actual = current.link(target, sourceFile);
      expect(actual).toEqual(expected);
    });
  });
});
