const current = require('../placeholderize');

describe('norska-frontend > lazyload > placeholderize', () => {
  it.each([
    // Object | String
    [{}, 'af&blur=5&il&q=10'],
    [{ placeholder: { grayscale: true } }, 'af&blur=5&filt=greyscale&il&q=10'],
    [{ grayscale: true }, 'af&blur=5&filt=greyscale&il&q=10'],
    [{ quality: 80 }, 'af&blur=5&il&q=80'],
    [{ placeholder: { quality: 80 } }, 'af&blur=5&il&q=80'],
  ])('%s => %s', async (options, params) => {
    const input = 'https://there.com/image.png';
    const expected = `https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&${params}`;
    const actual = current(input, options);
    expect(actual).toEqual(expected);
  });
});
