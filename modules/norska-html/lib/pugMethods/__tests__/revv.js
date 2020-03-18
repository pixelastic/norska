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
      data: {},
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

      const actual = module('foo.png', mockContext);

      expect(actual).toEqual('foo.png');
    });
  });
  describe('in production', () => {
    beforeEach(() => {
      jest.spyOn(helper, 'isProduction').mockReturnValue(true);
    });
    it.each([
      ['index.pug', './foo.png', '{revv: foo.png}'],
      ['index.pug', '/foo.png', '{revv: foo.png}'],
      ['index.pug', 'foo.png', '{revv: foo.png}'],
      ['index.pug', './images/foo.png', '{revv: images/foo.png}'],
      ['private/index.pug', '../foo.png', '{revv: foo.png}'],
      ['private/index.pug', '../images/foo.png', '{revv: images/foo.png}'],
      ['private/index.pug', 'foo.png', '{revv: foo.png}'],
      ['private/index.pug', './foo.png', '{revv: private/foo.png}'],
      ['private/index.pug', '/foo.png', '{revv: foo.png}'],
    ])('%s: %s => %s', (destination, input, expected) => {
      mockContext.destination = destination;
      const actual = module(input, mockContext);
      expect(actual).toEqual(expected);
    });
  });
});
