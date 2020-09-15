const current = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/emptyDir');
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
    await emptyDir(tmpDirectory);
  });
  describe('startLivereload', () => {
    let mockCreateServer = jest.fn();
    let mockWatch = jest.fn();
    beforeEach(() => {
      jest.spyOn(current, '__livereload').mockReturnValue({
        createServer: mockCreateServer,
      });
      mockCreateServer.mockReturnValue({ watch: mockWatch });
    });
    describe('browser reload', () => {
      it('should watch for changes in images', async () => {
        await current.startLivereload();
        const expected = objectWith({
          exts: arrayWith(['jpg', 'gif', 'png', 'svg', 'ico']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in js files', async () => {
        await current.startLivereload();
        const expected = objectWith({
          exts: arrayWith(['js']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in json files', async () => {
        await current.startLivereload();
        const expected = objectWith({
          exts: arrayWith(['json']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in page files', async () => {
        await current.startLivereload();
        const expected = objectWith({
          exts: arrayWith(['html', 'pug']),
        });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in views folder', async () => {
        jest.spyOn(current, 'viewsPath').mockReturnValue('foo');
        await current.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in pages folder', async () => {
        jest.spyOn(current, 'pagesPath').mockReturnValue('foo');
        await current.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in static folder', async () => {
        jest.spyOn(current, 'staticPath').mockReturnValue('foo');
        await current.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should watch for changes in _data folder', async () => {
        jest.spyOn(current, 'dataPath').mockReturnValue('foo');
        await current.startLivereload();
        const expected = arrayWith(['foo']);

        expect(mockWatch).toHaveBeenCalledWith(expected);
      });
      it('should add a delay before reload', async () => {
        // With no delay, the browser restarts the page as soon as the CMS
        // updates a file on disk, not allowing us to properly redirect users
        // where we want
        await current.startLivereload();
        const expected = objectWith({ delay: anything });

        expect(mockCreateServer).toHaveBeenCalledWith(expected);
      });
    });
  });
  describe('page', () => {
    beforeEach(() => {
      jest.spyOn(current, 'pagesPath').mockReturnValue('/tmp/pages');
      jest.spyOn(current, '__require').mockReturnValue(jest.fn);
    });
    it('should return a function', async () => {
      const actual = current.page('foo');

      expect(typeof actual).toBe('function');
    });
    it('that force requires the specified page when called', async () => {
      current.page('foo')();

      expect(current.__require).toHaveBeenCalledWith('/tmp/pages/foo.js', {
        forceReload: true,
      });
    });
    it('that applies passed arguments to required function', async () => {
      const mockMethod = jest.fn();
      jest.spyOn(current, '__require').mockReturnValue(mockMethod);

      current.page('foo')('bar', 'baz');

      expect(mockMethod).toHaveBeenCalledWith('bar', 'baz');
    });
  });
});
