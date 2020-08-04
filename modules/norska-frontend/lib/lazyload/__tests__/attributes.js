const current = require('../attributes');

describe('norska-frontend > lazyload > attributes', () => {
  it.each([
    // description, input url, options, full, placeholder
    [
      'Proxy image and default placeholder',
      'https://there.com/image.png',
      {},
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&il',
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&blur=5&il',
    ],
    [
      'Disabling placeholder',
      'https://there.com/image.png',
      { disable: true },
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&il',
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&il',
    ],
    [
      'Passing specific options to the image proxy, and cascading to the placeholder',
      'https://there.com/image.png',
      { width: 200 },
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&il&w=200',
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&blur=5&il&w=200',
    ],
    [
      'Passing specific options to the placeholder',
      'https://there.com/image.png',
      { placeholder: { width: 200 } },
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&il',
      'https://images.weserv.nl?url=https%3A%2F%2Fthere.com%2Fimage.png&af&blur=5&il&w=200',
    ],
  ])('%s', async (_description, input, options, full, placeholder) => {
    const actual = current(input, options);
    expect(actual).toHaveProperty('full', full);
    expect(actual).toHaveProperty('placeholder', placeholder);
  });
});
