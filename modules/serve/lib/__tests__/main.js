const current = require('../main');
const assets = require('norska-assets');
const js = require('norska-js');
const css = require('norska-css');
const html = require('norska-html');

describe('norska-serve', () => {
  describe('watchFiles', () => {
    it('should listen to changes', async () => {
      jest.spyOn(html, 'watch').mockReturnValue();
      jest.spyOn(css, 'watch').mockReturnValue();
      jest.spyOn(js, 'watch').mockReturnValue();
      jest.spyOn(assets, 'watch').mockReturnValue();

      await current.watchFiles();

      expect(html.watch).toHaveBeenCalled();
      expect(css.watch).toHaveBeenCalled();
      expect(js.watch).toHaveBeenCalled();
      expect(assets.watch).toHaveBeenCalled();
    });
  });
});
