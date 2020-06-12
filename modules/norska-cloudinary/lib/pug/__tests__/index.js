const module = require('../index.js');
const frontend = require('../../frontend');
const helper = require('norska-helper');

describe('norska-cloudinary > pug', () => {
  const context = {
    data: {
      data: { site: { defaultUrl: 'http://here.com' } },
    },
    destination: 'index.html',
  };
  beforeEach(async () => {
    frontend.init({ bucketName: 'bucket' });
  });
  it.each([
    [
      'dev',
      'http://there.com/foo.png',
      { width: 40 },
      'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_40/http://there.com/foo.png',
    ],
    ['dev', 'foo.png', { width: 40 }, 'foo.png'],
    ['dev', './foo.png', { width: 40 }, './foo.png'],
    [
      'prod',
      'http://there.com/foo.png',
      { width: 40 },
      'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_40/http://there.com/foo.png',
    ],
    [
      'prod',
      'foo.png',
      { width: 40 },
      'https://res.cloudinary.com/bucket/image/fetch/f_auto,w_40/http://here.com/foo.png',
    ],
  ])('[%s]: %s (%o) => %s', (env, input, options, expected) => {
    const isProduction = env === 'prod';
    jest.spyOn(helper, 'isProduction').mockReturnValue(isProduction);
    const actual = module(input, options, context);
    expect(actual).toEqual(expected);
  });
});
