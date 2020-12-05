const current = require('../head.js');
const config = require('norska-config');
const path = require('../../../../path.js');

describe('norska-html > pug > mixins > helpers > head', () => {
  it.each([
    // name | meta | expected | sourceFile
    [
      'Should pass title and twitter as is ',
      {
        title: 'my title',
        twitter: 'my twitter',
        image: 'my image',
        url: 'my url',
      },
      {
        title: 'my title',
        twitter: 'my twitter',
        image: 'my image',
        url: 'my url',
      },
      'blog/index.html',
    ],
    [
      'Should truncate description',
      {
        description:
          'my very very long description that will be truncated at some point because it is way too long for a real description. Really, it is very long, it should really be cut somewhere around here.',
      },
      {
        description:
          'my very very long description that will be truncated at some point because it is way too long for a real description. Really, it is very long, it should really be cut somewhere ...',
      },
      'blog/index.html',
    ],
    [
      'Should use a screenshot of the page if no image is set',
      {},
      {
        image: 'http://screenshot.com',
      },
      'blog/index.html',
    ],
    [
      'Should use the current url if none is passed',
      {},
      {
        url: 'http://here.com/blog',
      },
      'blog/index.html',
    ],
  ])('%s', (_name, meta, expected, sourceFile) => {
    jest.spyOn(path, 'screenshot').mockReturnValue('http://screenshot.com');
    config.set('runtime.productionUrl', 'http://here.com');
    const actual = current(meta, sourceFile);
    expect(actual).toEqual(expect.objectContaining(expected));
  });
});
