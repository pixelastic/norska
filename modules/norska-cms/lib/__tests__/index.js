import module from '../index';
import helper from 'norska-helper';
import firost from 'firost';

describe('norska-cms', () => {
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
  });
  describe('page', () => {
    beforeEach(() => {
      jest.spyOn(module, 'pagesPath').mockReturnValue('/tmp/pages');
      jest.spyOn(helper, 'require').mockReturnValue(jest.fn);
    });
    it('should return a function', async () => {
      const actual = module.page('foo');

      expect(typeof actual).toBe('function');
    });
    it('that force requires the specified page when called', async () => {
      module.page('foo')();

      expect(helper.require).toHaveBeenCalledWith('/tmp/pages/foo.js', {
        forceReload: true,
      });
    });
    it('that applies passed arguments to required function', async () => {
      const mockMethod = jest.fn();
      jest.spyOn(helper, 'require').mockReturnValue(mockMethod);

      module.page('foo')('bar', 'baz');

      expect(mockMethod).toHaveBeenCalledWith('bar', 'baz');
    });
  });
});
