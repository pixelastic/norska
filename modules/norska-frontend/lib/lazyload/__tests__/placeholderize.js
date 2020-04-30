const module = require('../placeholderize');
const cloudinary = require('../../cloudinary/index');

describe('norska-frontend > lazyload > placeholderize', () => {
  beforeEach(async () => {
    cloudinary.init({ bucketName: 'bucket-foo' });
  });
  it.each([
    // Object | String
    [{}, 'e_blur:300,f_auto,q_10,w_0.33'],
    [{ placeholder: { opacity: 50 } }, 'e_blur:300,f_auto,o_50,q_10,w_0.33'],
    [{ placeholder: { width: 500 } }, 'e_blur:300,f_auto,q_10,w_500'],
    [{ placeholder: { height: 500 } }, 'e_blur:300,f_auto,h_500,q_10'],
    [
      { placeholder: { width: 300, height: 500 } },
      'e_blur:300,f_auto,h_500,q_10,w_300',
    ],
    [{ opacity: 50 }, 'e_blur:300,f_auto,o_50,q_10,w_0.33'],
    [{ format: 'png' }, 'e_blur:300,f_png,q_10,w_0.33'],
    // Dimensions are relative to the main image
    [{ width: 300 }, 'e_blur:300,f_auto,q_10,w_100'],
    [{ height: 300 }, 'e_blur:300,f_auto,h_100,q_10'],
    [{ width: 300, height: 300 }, 'e_blur:300,f_auto,h_100,q_10,w_100'],
    [
      { width: 300, height: 300, placeholder: { width: 42, height: 42 } },
      'e_blur:300,f_auto,h_42,q_10,w_42',
    ],
    [
      { width: 300, height: 300, placeholder: { width: 42 } },
      'e_blur:300,f_auto,h_100,q_10,w_42',
    ],
    [{ width: 0.5, height: 0.5 }, 'e_blur:300,f_auto,h_0.17,q_10,w_0.17'],
    // Quality is always 10, unless specifically changed
    [{ quality: 80 }, 'e_blur:300,f_auto,q_10,w_0.33'],
    [{ placeholder: { quality: 80 } }, 'e_blur:300,f_auto,q_80,w_0.33'],
  ])('%s => %s', async (options, params) => {
    const input = 'http://www.example.com/foo.png';
    const expected = `https://res.cloudinary.com/bucket-foo/image/fetch/${params}/http%3A%2F%2Fwww.example.com%2Ffoo.png`;
    const actual = module(input, options);
    expect(actual).toEqual(expected);
  });
});
