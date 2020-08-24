const current = require('../head.js');
const config = require('norska-config');
const path = require('../../../../path.js');

describe('norska-html > pug > mixins > helpers > head', () => {
  it.each([
    // name | meta | default values | expected | sourceFile
    [
      'Should use default values if no meta',
      {},
      {
        defaultTitle: 'my title',
        defaultDescription: 'my description',
        defaultTwitter: 'my twitter',
        defaultUrl: 'http://here.com',
      },
      {
        title: 'my title',
        description: 'my description',
        twitter: 'my twitter',
        image: 'http://screenshot.com',
        pageUrl: 'http://here.com/blog/',
      },
      'blog/index.html',
    ],
    [
      'Should use meta if defined',
      {
        title: 'my title',
        description:
          'my very very long description that will be truncated at some point because it is way too long for a real description. Really, it is very long, it should really be cut somewhere around here.',
        url: 'https://there.com/',
        twitter: 'my twitter',
        image: 'cover.png',
      },
      {},
      {
        title: 'my title',
        description:
          'my very very long description that will be truncated at some point because it is way too long for a real description. Really, it is very long, it should really be cut somewhere ...',
        twitter: 'my twitter',
        image: 'cover.png',
        pageUrl: 'https://there.com/',
      },
      'index.html',
    ],
  ])('%s', (_name, meta, defaultValues, expected, sourceFile) => {
    jest.spyOn(path, 'screenshot').mockReturnValue('http://screenshot.com');
    config.set('runtime.productionUrl', 'http://here.com');
    const actual = current(meta, defaultValues, sourceFile);
    expect(actual).toEqual(expected);
  });
});
