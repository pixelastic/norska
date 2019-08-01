import module from '../index';
import helper from 'norska-helper';
import config from 'norska-config';
import firost from 'firost';
const objectWith = expect.objectContaining;
const arrayWith = expect.arrayContaining;
const anything = expect.anything();

describe('norska-cms', () => {
  const tmpDirectory = './tmp/norska-cms';
  beforeEach(async () => {
    await config.init({
      from: `${tmpDirectory}/src`,
      to: `${tmpDirectory}/dist`,
    });
    await firost.emptyDir(tmpDirectory);
  });
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
        const expected = objectWith({
          exts: arrayWith(['jpg', 'gif', 'png', 'svg', 'ico']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in js files', async () => {
        await module.startLivereload();
        const expected = objectWith({
          exts: arrayWith(['js']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in json files', async () => {
        await module.startLivereload();
        const expected = objectWith({
          exts: arrayWith(['json']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in page files', async () => {
        await module.startLivereload();
        const expected = objectWith({
          exts: arrayWith(['html', 'pug']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in views folder', async () => {
        jest.spyOn(module, 'viewsPath').mockReturnValue('foo');
        await module.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in pages folder', async () => {
        jest.spyOn(module, 'pagesPath').mockReturnValue('foo');
        await module.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in static folder', async () => {
        jest.spyOn(module, 'staticPath').mockReturnValue('foo');
        await module.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in _data folder', async () => {
        jest.spyOn(module, 'dataPath').mockReturnValue('foo');
        await module.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should add a delay before reload', async () => {
        // With no delay, the browser restarts the page as soon as the CMS
        // updates a file on disk, not allowing us to properly redirect users
        // where we want
        await module.startLivereload();
        const expected = objectWith({ delay: anything });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
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
