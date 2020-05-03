const module = require('../screenshot.js');
const cloudinary = require('norska-frontend/lib/cloudinary');

describe('norska-html > pugMethods > screenshot', () => {
  const context = {
    data: {
      data: { site: { defaultUrl: 'http://here.com' } },
      url: { here: '/foo.html' },
    },
  };
  beforeEach(async () => {
    cloudinary.init({ bucketName: 'bucket' });
  });
  it.each([
    [
      'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_800/https://api.microlink.io/%3Fembed=screenshot.url&meta=false&screenshot=true&url=http://here.com/foo.html',
    ],
  ])('%s', expected => {
    const actual = module(context);
    expect(actual).toEqual(expected);
  });
});
