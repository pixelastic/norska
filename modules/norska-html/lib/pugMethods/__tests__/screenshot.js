const module = require('../screenshot.js');
const cloudinary = require('norska-cloudinary');

describe('norska-html > pugMethods > screenshot', () => {
  const context = {
    data: {
      data: { site: { defaultUrl: 'http://here.com' } },
      url: { here: '/foo.html' },
    },
  };
  describe('without cloudinary', () => {
    it('should use microlink if no cloudinary configured', async () => {
      const actual = module(null, context);
      const expected =
        'https://api.microlink.io/?embed=screenshot.url&meta=false&screenshot=true&url=http://here.com/foo.html';
      expect(actual).toEqual(expected);
    });
  });
  describe('with cloudinary', () => {
    beforeEach(async () => {
      cloudinary.init({ bucketName: 'bucket' });
    });
    it.each([
      // input | output
      [
        null,
        'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_800/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&screenshot=true&url=http://here.com/foo.html',
      ],
      [
        'https://there.com/',
        'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_800/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&screenshot=true&url=https://there.com/',
      ],
    ])('%s', (input, expected) => {
      const actual = module(input, context);
      expect(actual).toEqual(expected);
    });
  });
});
