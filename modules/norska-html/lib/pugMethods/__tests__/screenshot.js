const current = require('../screenshot.js');

describe('norska-html > pugMethods > screenshot', () => {
  const context = {
    data: {
      data: { site: { defaultUrl: 'http://here.com' } },
      url: { here: '/foo/index.html' },
      runtime: { gitCommit: 'abcdef' },
    },
  };
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
    it.each([
      // input | output
      [
        null,
        'https://images.weserv.nl?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26norskaGitCommit%3Dabcdef%26screenshot%3Dtrue%26url%3Dhttp%253A%252F%252Fhere.com%252Ffoo&af&il&w=800',
      ],
      [
        'https://there.com/',
        'https://images.weserv.nl?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26norskaGitCommit%3Dabcdef%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fthere.com&af&il&w=800',
      ],
      [
        'https://there.com/?sort=asc',
        'https://images.weserv.nl?url=https%3A%2F%2Fapi.microlink.io%2F%3Fembed%3Dscreenshot.url%26meta%3Dfalse%26norskaGitCommit%3Dabcdef%26screenshot%3Dtrue%26url%3Dhttps%253A%252F%252Fthere.com%252F%253Fsort%253Dasc&af&il&w=800',
      ],
    ])('%s', (input, expected) => {
      const actual = current(input, context);
      expect(actual).toEqual(expected);
    });
  });
});
