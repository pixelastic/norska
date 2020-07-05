const current = require('../screenshot.js');
const cloudinary = require('norska-cloudinary');

describe('norska-html > pugMethods > screenshot', () => {
  const context = {
    data: {
      data: { site: { defaultUrl: 'http://here.com' } },
      url: { here: '/foo/index.html' },
      runtime: { gitCommit: 'abcdef' },
    },
  };
  describe('cloudinaryEnabled', () => {
    it('should return false if not enabled', async () => {
      cloudinary.init({ enable: false });
      const actual = current.cloudinaryEnabled();
      expect(actual).toEqual(false);
    });
    it('should return true when enabled', async () => {
      cloudinary.init({ enable: true });
      const actual = current.cloudinaryEnabled();
      expect(actual).toEqual(true);
    });
  });
  describe('currentUrl', () => {
    it('should return the current full url', async () => {
      const actual = current.currentUrl(context);
      expect(actual).toEqual('http://here.com/foo/index.html');
    });
  });
  describe('microlink', () => {
    it.each([
      [
        'https://there.com/',
        'https://api.microlink.io/?embed=screenshot.url&meta=false&screenshot=true&url=https%3A%2F%2Fthere.com',
      ],
      [
        'https://there.com/?sort=asc',
        'https://api.microlink.io/?embed=screenshot.url&meta=false&screenshot=true&url=https%3A%2F%2Fthere.com%2F%3Fsort%3Dasc',
      ],
      [
        'https://there.com/?sort=asc&name=norska',
        'https://api.microlink.io/?embed=screenshot.url&meta=false&screenshot=true&url=https%3A%2F%2Fthere.com%2F%3Fname%3Dnorska%26sort%3Dasc',
      ],
    ])('%s', async (input, expected) => {
      const actual = current.microlink(input);
      expect(actual).toEqual(expected);
    });
  });
  describe('revvedUrl', () => {
    it.each([
      ['https://there.com/', 'https://there.com/?norskaGitCommit=abcdef'],
      [
        'https://there.com/?sort=asc',
        'https://there.com/?norskaGitCommit=abcdef&sort=asc',
      ],
      [
        'https://there.com/?sort=asc&name=norska',
        'https://there.com/?name=norska&norskaGitCommit=abcdef&sort=asc',
      ],
    ])('%s', async (input, expected) => {
      const actual = current.revvedUrl(input, context);
      expect(actual).toEqual(expected);
    });
  });
  describe('screenshot()', () => {
    describe('without cloudinary', () => {
      it('should use microlink if no cloudinary configured', async () => {
        const actual = current(null, context);
        const expected =
          'https://api.microlink.io/?embed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=http%3A%2F%2Fhere.com%2Ffoo%2Findex.html';
        expect(actual).toEqual(expected);
      });
    });
    describe('with cloudinary', () => {
      beforeEach(async () => {
        cloudinary.init({ enable: true, bucketName: 'bucket' });
      });
      it.each([
        // input | output
        [
          null,
          'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_800/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=http%3A%2F%2Fhere.com%2Ffoo%2Findex.html',
        ],
        [
          'https://there.com/',
          'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_800/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=https%3A%2F%2Fthere.com',
        ],
        [
          'https://there.com/?sort=asc',
          'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_800/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&norskaGitCommit=abcdef&screenshot=true&url=https%3A%2F%2Fthere.com%2F%3Fsort%3Dasc',
        ],
      ])('%s', (input, expected) => {
        const actual = current(input, context);
        expect(actual).toEqual(expected);
      });
    });
  });
});
