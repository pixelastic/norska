const current = require('../attributes');
const cloudinary = require('norska-cloudinary');

describe('norska-frontend > lazyload > attributes', () => {
  beforeEach(async () => {
    cloudinary.init({
      bucketName: 'bucket',
    });
  });
  it.each([
    // description, input url, options, full, placeholder
    [
      'Proxy image and default placeholder',
      'https://there.com/image.png',
      {},
      'https://res.cloudinary.com/bucket/image/fetch/f_auto/https://there.com/image.png',
      'https://res.cloudinary.com/bucket/image/fetch/e_blur:300,f_auto,q_auto:low/https://there.com/image.png',
    ],
    [
      'Disabling placeholder',
      'https://there.com/image.png',
      { disable: true },
      'https://res.cloudinary.com/bucket/image/fetch/f_auto/https://there.com/image.png',
      'https://res.cloudinary.com/bucket/image/fetch/f_auto/https://there.com/image.png',
    ],
    [
      'Passing specific options to cloudinary, and cascading to the placeholder',
      'https://there.com/image.png',
      { width: 200 },
      'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_200/https://there.com/image.png',
      'https://res.cloudinary.com/bucket/image/fetch/e_blur:300,f_auto,q_auto:low,w_200/https://there.com/image.png',
    ],
    [
      'Passing specific options to the placeholder',
      'https://there.com/image.png',
      { placeholder: { width: 200 } },
      'https://res.cloudinary.com/bucket/image/fetch/f_auto/https://there.com/image.png',
      'https://res.cloudinary.com/bucket/image/fetch/e_blur:300,f_auto,q_auto:low,w_200/https://there.com/image.png',
    ],
  ])('%s', async (_description, input, options, full, placeholder) => {
    const actual = current(input, options);
    expect(actual).toHaveProperty('full', full);
    expect(actual).toHaveProperty('placeholder', placeholder);
  });
});
