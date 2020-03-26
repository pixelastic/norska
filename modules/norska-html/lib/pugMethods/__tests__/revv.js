const module = require('../revv.js');
const helper = require('norska-helper');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');

describe('norska-html > pugMethods > revv', () => {
  let mockContext;
  const tmpDirectory = './tmp/norska-html/pugMethods/revv';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await emptyDir(tmpDirectory);

    mockContext = {
      data: {
        data: {
          site: {
            defaultUrl: 'http://here.com',
          },
        },
      },
      destination: null,
      methods: {},
    };
  });
  describe('in dev', () => {
    beforeEach(() => {
      jest.spyOn(helper, 'isProduction').mockReturnValue(false);
    });
    it('should return the input', () => {
      mockContext.destination = 'index.pug';

      const actual = module('foo.png', {}, mockContext);

      expect(actual).toEqual('foo.png');
    });
  });
  describe('in production', () => {
    beforeEach(() => {
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);
    });
    it.each([
      // Destination | input | options | expected
      ['index.html', './foo.png', null, '{revv: foo.png}'],
      ['index.html', '/foo.png', null, '{revv: foo.png}'],
      ['index.html', 'foo.png', null, '{revv: foo.png}'],
      ['index.html', './images/foo.png', null, '{revv: images/foo.png}'],
      ['private/index.html', '../foo.png', null, '{revv: foo.png}'],
      [
        'private/index.html',
        '../images/foo.png',
        null,
        '{revv: images/foo.png}',
      ],
      ['private/index.html', 'foo.png', null, '{revv: foo.png}'],
      ['private/index.html', './foo.png', null, '{revv: private/foo.png}'],
      ['private/index.html', '/foo.png', null, '{revv: foo.png}'],
    ])('%s: %s => %s', (destination, input, options, expected) => {
      mockContext.destination = config.toPath(destination);
      const actual = module(input, options, mockContext);
      expect(actual).toEqual(expected);
    });
  });
});
