const current = require('../img.js');
const path = require('../../../../path.js');

describe('norska-html > pug > mixins > helpers > img', () => {
  beforeEach(async () => {
    jest.spyOn(path, 'lazyload').mockReturnValue({
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
        class: 'lazyload lazyload-remote',
        src: '__PLACEHOLDER__',
        'data-src': '__FULL__',
        loading: 'lazy',
      },
    ],
  ])('%s', (_name, input, expected) => {
    const actual = current(input, 'index.html');
    expect(actual).toEqual(expected);
  });
  it('should decode the src', async () => {
    const input = 'http://example.com/image.png?version=2';
    current({ src: input }, 'index.html');
    expect(path.lazyload).toHaveBeenCalledWith(input, 'index.html', {});
  });
});
