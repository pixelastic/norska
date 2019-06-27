import module from '../index';
import config from 'norska-config';
import helper from 'norska-helper';
import firost from 'firost';

describe('norska-html', () => {
  beforeEach(async () => {
    await config.init({
      from: './fixtures/src',
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

      expect(actual).not.toContain(config.fromPath('_layouts/default.pug'));
    });
    it('should not find include pug file', async () => {
      const actual = await module.pugFiles();

      expect(actual).not.toContain(config.fromPath('_includes/mixins.pug'));
    });
  });
  describe('compile', () => {
    it('should fail if file is not in the source folder', async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
      const input = '/nope/foo.pug';

      const actual = await module.compile(input);

      expect(actual).toEqual(false);
      expect(helper.consoleWarn).toHaveBeenCalled();
    });
    it('should compile foo.pug', async () => {
      const input = 'foo.pug';
      const output = 'foo.html';

      await module.compile(input);
      const actual = await firost.read(config.toPath(output));

      expect(actual).toMatchSnapshot();
    });
    it('should compile ./subdir/foo.pug', async () => {
      const input = 'subdir/foo.pug';
      const output = 'subdir/foo.html';

      await module.compile(input);
      const actual = await firost.read(config.toPath(output));

      expect(actual).toMatchSnapshot();
    });
    it('should compile ./subdir/deep/foo.pug', async () => {
      const input = 'subdir/deep/foo.pug';
      const output = 'subdir/deep/foo.html';

      await module.compile(input);
      const actual = await firost.read(config.toPath(output));

      expect(actual).toMatchSnapshot();
    });
    it('should compile ./with-data.pug', async () => {
      const input = 'with-data.pug';
      const output = 'with-data.html';

      await module.compile(input);
      const actual = await firost.read(config.toPath(output));

      expect(actual).toMatchSnapshot();
    });
    describe('layouts', () => {
      it('absolute in root', async () => {
        const input = 'with-layout-absolute.pug';
        const output = 'with-layout-absolute.html';

        await module.compile(input);
        const actual = await firost.read(config.toPath(output));

        expect(actual).toMatchSnapshot();
      });
      it('relative in root', async () => {
        const input = 'with-layout-relative.pug';
        const output = 'with-layout-relative.html';

        await module.compile(input);
        const actual = await firost.read(config.toPath(output));

        expect(actual).toMatchSnapshot();
      });
      it('absolute in subdir', async () => {
        const input = 'subdir/with-layout-absolute.pug';
        const output = 'subdir/with-layout-absolute.html';

        await module.compile(input);
        const actual = await firost.read(config.toPath(output));

        expect(actual).toMatchSnapshot();
      });
      it('relative in subdir', async () => {
        const input = 'subdir/with-layout-relative.pug';
        const output = 'subdir/with-layout-relative.html';

        await module.compile(input);
        const actual = await firost.read(config.toPath(output));

        expect(actual).toMatchSnapshot();
      });
    });
    describe('paths', () => {
      it('should have paths for ./with-paths.pug', async () => {
        const input = 'with-paths.pug';
        const output = 'with-paths.html';

        await module.compile(input);
        const actual = await firost.read(config.toPath(output));

        expect(actual).toMatchSnapshot();
      });
      it('should have paths for ./subdir/with-paths.pug', async () => {
        const input = 'subdir/with-paths.pug';
        const output = 'subdir/with-paths.html';

        await module.compile(input);
        const actual = await firost.read(config.toPath(output));

        expect(actual).toMatchSnapshot();
      });
      it('should have paths for ./subdir/deep/with-paths.pug', async () => {
        const input = 'subdir/deep/with-paths.pug';
        const output = 'subdir/deep/with-paths.html';

        await module.compile(input);
        const actual = await firost.read(config.toPath(output));

        expect(actual).toMatchSnapshot();
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
  describe('run', () => {
    beforeAll(async () => {
      await config.init({
        from: './fixtures/src',
        to: './tmp/norska-html',
      });
      await firost.emptyDir('./tmp/norska-html');
      await module.run();
    });
    describe('excluded files', () => {
      it('_includes/mixins.html should not exist', async () => {
        const input = '_includes/mixins.html';
        const actual = await firost.exist(config.toPath(input));

        expect(actual).toEqual(false);
      });
      it('_layouts/default.html should not exist', async () => {
        const input = '_layouts/default.html';
        const actual = await firost.exist(config.toPath(input));

        expect(actual).toEqual(false);
      });
    });
    describe('simple files', () => {
      it('foo.html', async () => {
        const input = 'foo.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/foo.html', async () => {
        const input = 'subdir/foo.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/deep/foo.html', async () => {
        const input = 'subdir/deep/foo.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
    });
    describe('with paths', () => {
      it('with-paths.html', async () => {
        const input = 'with-paths.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/with-paths.html', async () => {
        const input = 'subdir/with-paths.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/deep/with-paths.html', async () => {
        const input = 'subdir/deep/with-paths.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
    });
    describe('with layout', () => {
      it('with-layout-absolute.html', async () => {
        const input = 'with-layout-absolute.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/with-layout-absolute.html', async () => {
        const input = 'subdir/with-layout-absolute.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('with-layout-relative.html', async () => {
        const input = 'with-layout-relative.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/with-layout-relative.html', async () => {
        const input = 'subdir/with-layout-relative.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
    });
  });
});
