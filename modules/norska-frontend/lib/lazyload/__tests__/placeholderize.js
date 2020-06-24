const current = require('../placeholderize');
const cloudinary = require('norska-cloudinary');

describe('norska-frontend > lazyload > placeholderize', () => {
  beforeEach(async () => {
    cloudinary.init({ bucketName: 'bucket-foo' });
  });
  it.each([
    // Object | String
    [{}, 'e_blur:300,f_auto,q_auto:low'],
    [{ placeholder: { opacity: 50 } }, 'e_blur:300,f_auto,o_50,q_auto:low'],
    [{ opacity: 50 }, 'e_blur:300,f_auto,o_50,q_auto:low'],
    [{ format: 'png' }, 'e_blur:300,f_png,q_auto:low'],
    [{ quality: 80 }, 'e_blur:300,f_auto,q_auto:low'],
    [{ placeholder: { quality: 80 } }, 'e_blur:300,f_auto,q_80'],
  ])('%s => %s', async (options, params) => {
    const input = 'http://www.example.com/foo.png';
    const expected = `https://res.cloudinary.com/bucket-foo/image/fetch/${params}/http://www.example.com/foo.png`;
    const actual = current(input, options);
    expect(actual).toEqual(expected);
  });
});
