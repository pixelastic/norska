import module from '../pugMethods.js';
import helper from 'norska-helper';
import config from 'norska-config';
import firost from 'firost';

describe('norska-html/pugMethods', () => {
  let mockData, mockDestination;
  const tmpDirectory = './tmp/norska-html/index';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await firost.emptyDir(tmpDirectory);

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
});
