const current = require('../data');

const norskaData = require('norska-data');
const helper = require('norska-helper');
const config = require('norska-config');

describe('norska-html > data', () => {
  beforeEach(async () => {
    const tmpDirectory = './tmp/norska-html/data';
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
      port: 1234,
    });
    jest.spyOn(norskaData, 'getAll').mockReturnValue({});
    jest.spyOn(helper, 'isProduction').mockReturnValue();
  });
  describe('data', () => {
    it('should return the data from _data', async () => {
      norskaData.getAll.mockReturnValue({ name: 'norska' });
      const actual = await current.data();
      expect(actual).toHaveProperty('name', 'norska');
    });
  });
  describe('url', () => {
    describe('base', () => {
      it('in development', async () => {
        helper.isProduction.mockReturnValue(false);

        const actual = await current.url();
        expect(actual).toHaveProperty('base', 'http://127.0.0.1:1234');
      });
      it('in production', async () => {
        helper.isProduction.mockReturnValue(true);
        jest.spyOn(current, 'data').mockReturnValue({
          site: {
            url: 'https://my-url.com',
          },
        });

        const actual = await current.url();
        expect(actual).toHaveProperty('base', 'https://my-url.com');
      });
    });
    describe('here', () => {
      it.each([['about/index.html', '/about/']])(
        '%s => %s',
        async (input, expected) => {
          const actual = await current.url(input);
          expect(actual).toHaveProperty('here', expected);
        }
      );
    });
    describe('pathToRoot', () => {
      it.each([
        // destination | pathToRoot
        ['index.html', './'],
        ['blog/index.html', '../'],
        ['blog/me/index.html', '../../'],
      ])('%s => %s', async (input, expected) => {
        const actual = await current.url(input);
        expect(actual).toHaveProperty('pathToRoot', expected);
      });
    });
  });
  describe('runtime', () => {
    it('get data from runtime in config', async () => {
      config.set('runtime.testData', 'my-hash');
      const actual = await current.runtime();
      expect(actual).toHaveProperty('testData', 'my-hash');
    });
  });
  describe('tweaks', () => {
    it('should have the ensureUrlTrailingSlash', async () => {
      const actual = await current.tweaks();
      expect(actual).toHaveProperty('ensureUrlTrailingSlashSource');
    });
  });
});
