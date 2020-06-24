const current = require('../remoteUrl.js');
const config = require('norska-config');

describe('norska-html > pugMethods > remoteUrl', () => {
  const tmpDirectory = './tmp/norska-html/pugMethods/remoteUrl';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
  });
  /**
   * Return full context object with only the defaultUrl set
   * @param {string} defaultUrl Default website url
   * @param {string} destination Current file being written
   * @returns {object} Full mock context object
   */
  function getContext(defaultUrl, destination) {
    return { data: { data: { site: { defaultUrl } } }, destination };
  }
  const testCases = [
    ['index.html', 'http://here.com/', 'foo.png', 'http://here.com/foo.png'],
    ['index.html', 'http://here.com/', '/foo.png', 'http://here.com/foo.png'],
    ['index.html', 'http://here.com/', './foo.png', 'http://here.com/foo.png'],
    ['index.html', 'http://here.com', 'foo.png', 'http://here.com/foo.png'],
    ['index.html', 'http://here.com', '/foo.png', 'http://here.com/foo.png'],
    ['index.html', 'http://here.com', './foo.png', 'http://here.com/foo.png'],
    [
      'subfolder/index.html',
      'http://here.com',
      'foo.png',
      'http://here.com/foo.png',
    ],
    [
      'subfolder/index.html',
      'http://here.com',
      '/foo.png',
      'http://here.com/foo.png',
    ],
    [
      'subfolder/index.html',
      'http://here.com',
      './foo.png',
      'http://here.com/subfolder/foo.png',
    ],
    [
      'subfolder/index.html',
      'http://here.com',
      'subfolder/foo.png',
      'http://here.com/subfolder/foo.png',
    ],
    [
      'subfolder/index.html',
      'http://here.com',
      './subfolder-again/foo.png',
      'http://here.com/subfolder/subfolder-again/foo.png',
    ],
    [
      'subfolder/index.html',
      'http://here.com',
      '../foo.png',
      'http://here.com/foo.png',
    ],
  ];
  test.each(testCases)(
    '[%s] %s + %s',
    (destination, baseUrl, target, expected) => {
      const context = getContext(baseUrl, destination);
      const actual = current(target, context);
      expect(actual).toEqual(expected);
    }
  );
});
