const current = require('../mixinImgHelper.js');
const pugLazyload = require('../lazyload.js');
jest.mock('../lazyload.js');

describe('norska-html > pugMethods > mixinImgHelper', () => {
  beforeEach(async () => {
    pugLazyload.mockReturnValue({
      placeholder: '__PLACEHOLDER__',
      full: '__FULL__',
    });
  });
  it.each([
    // name | input | output
    [
      'Only non-src attributes',
      {
        alt: 'Alternative text',
      },
      {
        alt: 'Alternative text',
      },
    ],
    [
      'Options should be deleted',
      {
        alt: 'Alternative text',
        options: {},
      },
      {
        alt: 'Alternative text',
      },
    ],
    [
      'src should be transformed',
      {
        alt: 'Alternative text',
        src: 'http://www.example.com/image.png',
      },
      {
        alt: 'Alternative text',
        src: '__PLACEHOLDER__',
        'data-src': '__FULL__',
        loading: 'lazy',
      },
    ],
  ])('%s', (_name, input, expected) => {
    const actual = current(input, {});
    expect(actual).toEqual(expected);
  });
  it('should decode the src', async () => {
    const input = 'http://example.com/image.png?version=2';
    current({ src: input });
    expect(pugLazyload).toHaveBeenCalledWith(
      input,
      expect.anything(),
      undefined
    );
  });
});
