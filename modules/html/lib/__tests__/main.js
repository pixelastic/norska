const current = require('../main');
const config = require('norska-config');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const exist = require('firost/exist');
const glob = require('firost/glob');

describe('norska-html', () => {
  const tmpDirectory = './tmp/norska-html/index';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
    await emptyDir(tmpDirectory);
  });
  describe('filePatterns', () => {
    it.each([
      // file | should be found
      ['index.pug', true],
      ['subdir/index.pug', true],
      ['subdir/something.pug', true],
      ['_includes/index.pug', false],
      ['index.md', true],
      ['subdir/index.md', true],
      ['subdir/something.md', true],
      ['_data/text.md', false],
    ])('%s: %s', async (input, expected) => {
      await write('anything', config.fromPath(input));
      const actual = await glob(await current.filePatterns());

      expect(actual.includes(config.fromPath(input))).toEqual(expected);
    });
  });
  describe('getDestinationPath', () => {
    it.each([
      // source | destination
      ['index.pug', 'index.html'],
      ['about.pug', 'about/index.html'],
      ['blog/index.pug', 'blog/index.html'],
      ['blog/me/index.pug', 'blog/me/index.html'],

      ['index.md', 'index.html'],
      ['about.md', 'about/index.html'],
      ['blog/index.md', 'blog/index.html'],
      ['blog/me/index.md', 'blog/me/index.html'],
    ])('%s => %s', async (input, expected) => {
      const actual = current.getDestinationPath(input);
      expect(actual).toEqual(expected);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      jest
        .spyOn(current, '__spinner')
        .mockReturnValue({ tick() {}, success() {}, failure() {}, info() {} });
      jest.spyOn(current, 'writeSitemap').mockReturnValue();
    });
    it('should write a sitemap', async () => {
      await current.run();
      expect(current.writeSitemap).toHaveBeenCalled();
    });
    describe('excluded files', () => {
      it('folder starting with _ should not be processed', async () => {
        await write('p foo', config.fromPath('_foo/index.pug'));

        await current.run();

        const actual = await exist(config.toPath('_foo/index.html'));
        expect(actual).toEqual(false);
      });
    });
  });
  describe('getSitemap', () => {
    it('should return a sitemap with all valid links', async () => {
      config.set('runtime.productionUrl', 'http://here.com');
      config.set('runtime.htmlFiles', {
        '404.pug': '404/index.html',
        'index.pug': 'index.html',
        'about.md': 'about/index.html',
      });
      const actual = current.getSitemap();
      expect(actual).toContain('<url><loc>http://here.com/</loc></url>');
      expect(actual).toContain('<url><loc>http://here.com/about/</loc></url>');
      expect(actual).not.toContain(
        '<url><loc>http://here.com/404/</loc></url>'
      );
    });
  });
});
