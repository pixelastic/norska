import module from '../index';
import config from 'norska-config';
import helper from 'norska-helper';
import firost from 'firost';

describe('norska-html', () => {
  describe('pugFilesPattern', () => {
    beforeEach(async () => {
      await config.init({ from: './fixtures/src', to: './tmp/norska-html' });
    });
    it('should find pug file in source', async () => {
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).toContain(config.fromPath('index.pug'));
    });
    it('should find pug file in sub directory of source', async () => {
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).toContain(config.fromPath('subdir/index.pug'));
    });
    it('should not find pug file in root', async () => {
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).not.toContain(config.rootPath('root.pug'));
    });
    it('should not find layout pug file', async () => {
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).not.toContain(config.fromPath('_layouts/default.pug'));
    });
    it('should not find include pug file', async () => {
      const actual = await firost.glob(await module.pugFilesPattern());

      expect(actual).not.toContain(config.fromPath('_includes/mixins.pug'));
    });
  });
  describe('getPaths', () => {
    beforeEach(async () => {
      await config.init({ from: './fixtures/src', to: './tmp/norska-html' });
    });
    describe('basename', () => {
      it('index.html => index.html', () => {
        const actual = module.getPaths(config.toPath('index.html'));

        expect(actual).toHaveProperty('basename', 'index.html');
      });
      it('subdir/index.html => index.html', () => {
        const actual = module.getPaths(config.toPath('subdir/index.html'));

        expect(actual).toHaveProperty('basename', 'index.html');
      });
      it('subdir/deep/index.html => index.html', () => {
        const actual = module.getPaths(config.toPath('subdir/deep/index.html'));

        expect(actual).toHaveProperty('basename', 'index.html');
      });
    });
    describe('dirname', () => {
      it('index.html => ', () => {
        const actual = module.getPaths(config.toPath('index.html'));

        expect(actual).toHaveProperty('dirname', '');
      });
      it('subdir/index.html => subdir', () => {
        const actual = module.getPaths(config.toPath('subdir/index.html'));

        expect(actual).toHaveProperty('dirname', 'subdir');
      });
      it('subdir/deep/index.html => subdir', () => {
        const actual = module.getPaths(config.toPath('subdir/deep/index.html'));

        expect(actual).toHaveProperty('dirname', 'subdir/deep');
      });
    });
    describe('toRoot', () => {
      it('index.html => .', () => {
        const actual = module.getPaths(config.toPath('index.html'));

        expect(actual).toHaveProperty('toRoot', '.');
      });
      it('subdir/index.html => ..', () => {
        const actual = module.getPaths(config.toPath('subdir/index.html'));

        expect(actual).toHaveProperty('toRoot', '..');
      });
      it('subdir/deep/index.html => ..', () => {
        const actual = module.getPaths(config.toPath('subdir/deep/index.html'));

        expect(actual).toHaveProperty('toRoot', '../..');
      });
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      await config.init({ from: './fixtures/src', to: './tmp/norska-html' });
      await firost.emptyDir('./tmp/norska-html');
    });
    it('should fail if file is not in the source folder', async () => {
      jest.spyOn(helper, 'consoleWarn').mockReturnValue();
      const input = '/nope/foo.pug';

      const actual = await module.compile(input);

      expect(actual).toEqual(false);
      expect(helper.consoleWarn).toHaveBeenCalled();
    });
    it('should compile index.pug', async () => {
      const input = 'index.pug';
      const output = 'index.html';

      await module.compile(input);
      const actual = await firost.read(config.toPath(output));

      expect(actual).toMatchSnapshot();
    });
    it('should compile ./subdir/index.pug', async () => {
      const input = 'subdir/index.pug';
      const output = 'subdir/index.html';

      await module.compile(input);
      const actual = await firost.read(config.toPath(output));

      expect(actual).toMatchSnapshot();
    });
    it('should compile ./subdir/deep/index.pug', async () => {
      const input = 'subdir/deep/index.pug';
      const output = 'subdir/deep/index.html';

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
  describe('run', () => {
    beforeEach(async () => {
      await config.init({
        from: './fixtures/src',
        to: './tmp/norska-html',
      });
    });
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
      it('index.html', async () => {
        const input = 'index.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/index.html', async () => {
        const input = 'subdir/index.html';
        const actual = await firost.read(config.toPath(input));

        expect(actual).toMatchSnapshot();
      });
      it('subdir/deep/index.html', async () => {
        const input = 'subdir/deep/index.html';
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
  describe('watch', () => {
    // Note: The setup here is different from the others tests as we need to
    // test the watching of files, we need to be able to change files in the
    // .from() directory. We can't do that from the fixtures files directly, so
    // we first copy them to ./norska-html/src
    // So we override the from and to in the beforeEach from what is set in the
    // top-level beforeEach
    // But because beforeAll are called before beforeEach and because we
    // actually run .watch() in beforeAll, we need to manuall also set the
    // config with the new values there.
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-html/src',
        to: './tmp/norska-html/dist',
      });
    });
    beforeAll(async () => {
      await config.init({
        from: './tmp/norska-html/src',
        to: './tmp/norska-html/dist',
      });
      await firost.emptyDir('./tmp/norska-html');
      await firost.copy('./fixtures/src', './tmp/norska-html/src');
      await module.watch();
    });
    afterAll(async () => {
      await firost.unwatchAll();
    });
    describe('individual files', () => {
      it('should recompile individual pug files when changed', async () => {
        await firost.write('p Updated index', config.fromPath('./index.pug'));

        await firost.nextWatchTick();

        const actual = await firost.read(config.toPath('./index.html'));
        expect(actual).toMatchSnapshot();
      });
      it('should compile individual pug files when created', async () => {
        await firost.write('p new file', config.fromPath('./newfile.pug'));

        await firost.nextWatchTick();

        const actual = await firost.read(config.toPath('./newfile.html'));
        expect(actual).toMatchSnapshot();
      });
    });
    describe('_data.json', () => {
      beforeEach(() => {
        jest.spyOn(module, 'run').mockReturnValue();
      });
      it('should run everything when _data.json is modified', async () => {
        await firost.writeJson({ foo: 'bar' }, config.fromPath('_data.json'));

        await firost.nextWatchTick();

        expect(module.run).toHaveBeenCalled();
      });
      it('should reload the siteData with the new data', async () => {
        const newData = { foo: `${new Date()}` };
        await firost.writeJson(newData, config.fromPath('_data.json'));

        await firost.nextWatchTick();

        const actual = await helper.siteData();
        expect(actual).toEqual(newData);
      });
    });
    describe('includes', () => {
      beforeEach(() => {
        jest.spyOn(module, 'run').mockReturnValue();
      });
      it('should run everything when an included file is changed', async () => {
        const layoutPath = config.fromPath('_includes/layout.pug');
        const layout = await firost.read(layoutPath);
        await firost.write(layout, layoutPath);

        await firost.nextWatchTick();

        expect(module.run).toHaveBeenCalled();
      });
    });
  });
});
