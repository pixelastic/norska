const module = require('../pugMethods.js');
const helper = require('norska-helper');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');

describe('norska-html/pugMethods', () => {
  let mockData, mockDestination;
  const tmpDirectory = './tmp/norska-html/index';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await emptyDir(tmpDirectory);

    mockData = {};
    mockDestination = null;
  });
  describe('revv', () => {
    describe('in dev', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(false);
      });
      it('should return the input', () => {
        mockDestination = 'index.pug';

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.revv('whatever.foo');

        expect(actual).toEqual('whatever.foo');
      });
    });
    describe('in production', () => {
      beforeEach(() => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
      });
      it('index.pug / ./style.css', () => {
        mockDestination = 'index.pug';

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.revv('./style.css');

        expect(actual).toEqual('{revv: style.css}');
      });
      it('index.pug / /style.css', () => {
        mockDestination = 'index.pug';

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.revv('/style.css');

        expect(actual).toEqual('{revv: style.css}');
      });
      it('index.pug / style.css', () => {
        mockDestination = 'index.pug';

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.revv('style.css');

        expect(actual).toEqual('{revv: style.css}');
      });
      it('index.pug / ./css/style.css', () => {
        mockDestination = 'index.pug';

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.revv('./css/style.css');

        expect(actual).toEqual('{revv: css/style.css}');
      });
      it('private/index.pug / ../style.css', () => {
        mockDestination = 'private/index.pug';

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.revv('../style.css');

        expect(actual).toEqual('{revv: style.css}');
      });
      it('private/index.pug / ../css/style.css', () => {
        mockDestination = 'private/index.pug';

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.revv('../css/style.css');

        expect(actual).toEqual('{revv: css/style.css}');
      });
    });
  });
  fdescribe('cloudinary', () => {
    describe('in dev', () => {
      fit('remote url passed to proxy', async () => {
        const input = 'http://www.example.com/foo.png';
        const options = { foo: 'bar' };
        jest.spyOn(module, '__cloudinaryProxy').mockReturnValue('bar');

        const pugMethods = module(mockData, mockDestination);
        const actual = pugMethods.cloudinary(input, options);

        expect(actual).toEqual('bar');
        expect(module.__cloudinaryProxy).toHaveBeenCalledWith(input, options);
      });
      it('local path returned as-is', async () => {});
    });
    describe('in production', () => {
      it('remote url passed to proxy', async () => {});
      it('local path fixed to remote url', async () => {});
    });
  });
});
