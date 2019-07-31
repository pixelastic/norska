import module from '../index';
import helper from 'norska-helper';
import firost from 'firost';
import path from 'path';

describe('norska-cms', () => {
  const tmpPath = path.resolve('./tmp/norska-cms');
  describe('startLivereload', () => {
    let mockCreateServer = jest.fn();
    let mockWatch = jest.fn();
    beforeEach(() => {
      jest.spyOn(module, '__livereload').mockReturnValue({
        createServer: mockCreateServer,
      });
      mockCreateServer.mockReturnValue({ watch: mockWatch });
    });
    describe('browser reload', () => {
      beforeEach(() => {
        jest.spyOn(firost, 'watch').mockReturnValue();
      });
      it('should watch for changes in images', async () => {
        await module.startLivereload();
        const expected = expect.arrayContaining([
          'jpg',
          'gif',
          'png',
          'svg',
          'ico',
        ]);

        expect(mockCreateServer).toHaveBeenCalledWith({ exts: expected });
      });
      it('should watch for changes in js files', async () => {
        await module.startLivereload();
        const expected = expect.arrayContaining(['js']);

        expect(mockCreateServer).toHaveBeenCalledWith({ exts: expected });
      });
      it('should watch for changes in page files', async () => {
        await module.startLivereload();
        const expected = expect.arrayContaining(['html', 'pug']);

        expect(mockCreateServer).toHaveBeenCalledWith({ exts: expected });
      });
      it('should watch for changes in views folder', async () => {
        jest.spyOn(module, 'viewsPath').mockReturnValue('foo');
        await module.startLivereload();
        const expected = expect.arrayContaining(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in pages folder', async () => {
        jest.spyOn(module, 'pagesPath').mockReturnValue('foo');
        await module.startLivereload();
        const expected = expect.arrayContaining(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in static folder', async () => {
        jest.spyOn(module, 'staticPath').mockReturnValue('foo');
        await module.startLivereload();
        const expected = expect.arrayContaining(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
    });
    describe('page reload', () => {
      beforeEach(async () => {
        await firost.emptyDir(tmpPath);
      });
      afterEach(async () => {
        await firost.unwatchAll();
      });
      it('should clear the require cache whenever a page file is updated', async () => {
        // Note that jest overwrite the builtin require() calls with its own
        // version, making accessing the require.cache impossible. In order to
        // test this method, we instead check the __removeFromRequireCache is
        // correctly called and trust this method to do the right thing™
        jest.spyOn(module, 'pagesPath').mockReturnValue(tmpPath);
        jest.spyOn(module, '__removeFromRequireCache');

        await module.startLivereload();

        // We create a dummy page, this should clear
        const dummyPath = `${tmpPath}/dummy.js`;
        await firost.write('dummut', dummyPath);
        await firost.waitForWatchers();

        expect(module.__removeFromRequireCache).toHaveBeenCalledWith(dummyPath);
      });
    });
  });
  describe('page', () => {
    beforeEach(() => {
      jest.spyOn(module, 'pagesPath').mockReturnValue('/tmp/pages');
      jest.spyOn(helper, 'require').mockReturnValue({ default: jest.fn() });
    });
    it('should return a function', async () => {
      const actual = module.page('foo');

      expect(typeof actual).toBe('function');
    });
    it('that requires the specified page when called', async () => {
      module.page('foo')();

      expect(helper.require).toHaveBeenCalledWith('/tmp/pages/foo.js');
    });
    it('that applies passed arguments to required function', async () => {
      const mockMethod = jest.fn();
      jest.spyOn(helper, 'require').mockReturnValue({ default: mockMethod });

      module.page('foo')('bar', 'baz');

      expect(mockMethod).toHaveBeenCalledWith('bar', 'baz');
    });
  });
});
