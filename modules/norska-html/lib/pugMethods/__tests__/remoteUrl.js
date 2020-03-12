const module = require('../remoteUrl.js');

describe('norska-html > pugMethods > remoteUrl', () => {
  /**
   * Return full context object with only the defaultUrl set
   * @param {string} defaultUrl Default website url
   * @returns {object} Full mock context object
   */
  function getContext(defaultUrl) {
    return { data: { data: { site: { defaultUrl } } } };
  }
  const testCases = [
    ['http://www.example.com', 'foo.png'],
    ['http://www.example.com', '/foo.png'],
    ['http://www.example.com', './foo.png'],
    ['http://www.example.com/', 'foo.png'],
    ['http://www.example.com/', '/foo.png'],
    ['http://www.example.com/', './foo.png'],
  ];
  test.each(testCases)('%s + %s', (baseUrl, localPath) => {
    expect(module(localPath, getContext(baseUrl))).toEqual(
      'http://www.example.com/foo.png'
    );
  });
});
