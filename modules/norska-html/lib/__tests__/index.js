import module from '../index';
import config from 'norska-config';
import firost from 'firost';

describe('norska-html', () => {
  beforeEach(async () => {
    jest.spyOn(config, 'rootDir').mockReturnValue('./fixtures');
    await config.init({
      from: 'src',
      to: './tmp/norska-html',
    });
  });
  describe('pugFiles', () => {
    it('should find pug file in source', async () => {
      const actual = await module.pugFiles();

      expect(actual).toContain(config.fromPath('foo.pug'));
    });
    it('should find pug file in sub directory of source', async () => {
      const actual = await module.pugFiles();

      expect(actual).toContain(config.fromPath('subdir/foo.pug'));
    });
    it('should not find pug file in root', async () => {
      const actual = await module.pugFiles();

      expect(actual).not.toContain(config.rootPath('root.pug'));
    });
    it('should not find layout pug file', async () => {
      const actual = await module.pugFiles();

      expect(actual).toContain(config.fromPath('_layouts/default.pug'));
    });
    it('should not find include pug file', async () => {
      const actual = await module.pugFiles();

      expect(actual).toContain(config.fromPath('_includes/mixins.pug'));
    });
  });
  describe('compile', () => {
    it('should compile foo.pug', async () => {
      await module.compile('foo.pug');

      const actual = await firost.read(config.toPath('foo.html'));

      expect(actual).toEqual('<p>Foo</p>');
    });
    it('should compile ./subdir/foo.pug', async () => {
      await module.compile('subdir/foo.pug');

      const actual = await firost.read(config.toPath('subdir/foo.html'));

      expect(actual).toEqual('<p>Subdir Foo</p>');
    });
    it('should compile ./subdir/deep/foo.pug', async () => {
      await module.compile('subdir/deep/foo.pug');

      const actual = await firost.read(config.toPath('subdir/deep/foo.html'));

      expect(actual).toEqual('<p>Subdir Deep Foo</p>');
    });
    it('should compile ./with-data.pug', async () => {
      await module.compile('with-data.pug');

      const actual = await firost.read(config.toPath('with-data.html'));

      expect(actual).toEqual('<p>bar</p>');
    });
    describe('layouts', () => {
      it('absolute in root', async () => {
        await module.compile('with-layout-absolute.pug');

        const actual = await firost.read(
          config.toPath('with-layout-absolute.html')
        );

        expect(actual).toEqual(
          '<html><head><title>Title</title></head><body><p>In a layout</p></body></html>'
        );
      });
      it('relative in root', async () => {
        await module.compile('with-layout-relative.pug');

        const actual = await firost.read(
          config.toPath('with-layout-relative.html')
        );

        expect(actual).toEqual(
          '<html><head><title>Title</title></head><body><p>In a layout</p></body></html>'
        );
      });
      it('absolute in subdir', async () => {
        await module.compile('./subdir/with-layout-absolute.pug');

        const actual = await firost.read(
          config.toPath('./subdir/with-layout-absolute.html')
        );

        expect(actual).toEqual(
          '<html><head><title>Title</title></head><body><p>In a layout</p></body></html>'
        );
      });
      it('relative in subdir', async () => {
        await module.compile('./subdir/with-layout-relative.pug');

        const actual = await firost.read(
          config.toPath('./subdir/with-layout-relative.html')
        );

        expect(actual).toEqual(
          '<html><head><title>Title</title></head><body><p>In a layout</p></body></html>'
        );
      });
    });
  });
  describe('getPaths', () => {
    describe('basename', () => {
      it('foo.html => foo.html', () => {
        const actual = module.getPaths(config.toPath('foo.html'));

        expect(actual).toHaveProperty('basename', 'foo.html');
      });
      it('subdir/foo.html => foo.html', () => {
        const actual = module.getPaths(config.toPath('subdir/foo.html'));

        expect(actual).toHaveProperty('basename', 'foo.html');
      });
      it('subdir/deep/foo.html => foo.html', () => {
        const actual = module.getPaths(config.toPath('subdir/deep/foo.html'));

        expect(actual).toHaveProperty('basename', 'foo.html');
      });
    });
    describe('dirname', () => {
      it('foo.html => ', () => {
        const actual = module.getPaths(config.toPath('foo.html'));

        expect(actual).toHaveProperty('dirname', '');
      });
      it('subdir/foo.html => subdir', () => {
        const actual = module.getPaths(config.toPath('subdir/foo.html'));

        expect(actual).toHaveProperty('dirname', 'subdir');
      });
      it('subdir/deep/foo.html => subdir', () => {
        const actual = module.getPaths(config.toPath('subdir/deep/foo.html'));

        expect(actual).toHaveProperty('dirname', 'subdir/deep');
      });
    });
    describe('toRoot', () => {
      it('foo.html => .', () => {
        const actual = module.getPaths(config.toPath('foo.html'));

        expect(actual).toHaveProperty('toRoot', '.');
      });
      it('subdir/foo.html => ..', () => {
        const actual = module.getPaths(config.toPath('subdir/foo.html'));

        expect(actual).toHaveProperty('toRoot', '..');
      });
      it('subdir/deep/foo.html => ..', () => {
        const actual = module.getPaths(config.toPath('subdir/deep/foo.html'));

        expect(actual).toHaveProperty('toRoot', '../..');
      });
    });
  });
});
