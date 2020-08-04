const current = require('../imageProxy.js');
const helper = require('norska-helper');

describe('norska-html > pugMethods > imageProxy', () => {
  const context = {
    data: {
      data: { site: { defaultUrl: 'http://here.com' } },
    },
    destination: 'index.html',
  };
  it.each([
    [
      'dev',
      'http://www.example.com/foo.png',
      { width: 40 },
      'https://images.weserv.nl?url=http%3A%2F%2Fwww.example.com%2Ffoo.png&af&il&w=40',
    ],
    ['dev', 'foo.png', { width: 40 }, 'foo.png'],
    ['dev', './foo.png', { width: 40 }, './foo.png'],
    [
      'prod',
      'http://www.example.com/foo.png',
      { width: 40 },
      'https://images.weserv.nl?url=http%3A%2F%2Fwww.example.com%2Ffoo.png&af&il&w=40',
    ],
    [
      'prod',
      'foo.png',
      { width: 40 },
      'https://images.weserv.nl?url=http%3A%2F%2Fhere.com%2Ffoo.png&af&il&w=40',
    ],
    [
      'dev',
      'http://www.example.com/foo.png?version=2',
      { width: 40 },
      'https://images.weserv.nl?url=http%3A%2F%2Fwww.example.com%2Ffoo.png%3Fversion%3D2&af&il&w=40',
    ],
  ])('[%s]: %s (%o) => %s', (env, input, options, expected) => {
    const isProduction = env === 'prod';
    jest.spyOn(helper, 'isProduction').mockReturnValue(isProduction);
    const actual = current(input, options, context);
    expect(actual).toEqual(expected);
  });
});
