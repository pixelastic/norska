import module from '../index';
import config from 'norska-config';
import firost from 'firost';

describe('norska-assets', () => {
  describe('compile', () => {
    beforeEach(async () => {
      await config.init({
        from: './fixtures/src',
        to: './tmp/norska-assets',
        assets: module.defaultConfig(),
      });
      await firost.emptyDir('./tmp/norska-assets');
    });
    it('should copy file to root of destination', async () => {
      const filepath = 'favicon.ico';
      await module.compile(config.fromPath(filepath));

      const actual = await firost.isFile(config.toPath(filepath));
      expect(actual).toEqual(true);
    });
    it('should copy files relative to from()', async () => {
      const filepath = 'favicon.ico';
      await module.compile(filepath);

      const actual = await firost.isFile(config.toPath(filepath));
      expect(actual).toEqual(true);
    });
    it('should copy file to subfolder', async () => {
      const filepath = 'images/foo.gif';
      await module.compile(filepath);

      const actual = await firost.isFile(config.toPath(filepath));
      expect(actual).toEqual(true);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        assets: module.defaultConfig(),
      });
      await firost.emptyDir('./tmp/norska-assets');
    });
    describe('images', () => {
      it('should copy gif files', async () => {
        const filepath = 'images/foo.gif';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy jpg files', async () => {
        const filepath = 'images/foo.jpg';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy png files', async () => {
        const filepath = 'images/foo.png';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy svg files', async () => {
        const filepath = 'images/foo.svg';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy ico files', async () => {
        const filepath = 'images/foo.ico';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
    describe('fonts', () => {
      it('should copy eot files', async () => {
        const filepath = 'fonts/foo.eot';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy otf files', async () => {
        const filepath = 'fonts/foo.otf';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy ttf files', async () => {
        const filepath = 'fonts/foo.ttf';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy woff files', async () => {
        const filepath = 'fonts/foo.woff';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
    describe('misc', () => {
      it('should not copy unknown files', async () => {
        const filepath = 'foo.weird';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(false);
      });
      it('should copy html files', async () => {
        const filepath = 'index.html';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
      it('should copy txt files', async () => {
        const filepath = 'robots.txt';

        await firost.write('foo', config.fromPath(filepath));
        await module.run();

        const actual = await firost.isFile(config.toPath(filepath));
        expect(actual).toEqual(true);
      });
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets/src',
        to: './tmp/norska-assets/dist',
        assets: module.defaultConfig(),
      });
      await firost.emptyDir('./tmp/norska-assets');
      await firost.mkdirp(config.from());
    });
    afterEach(async () => {
      await firost.unwatchAll();
    });
    it('should not copy files initially', async () => {
      await firost.write('foo', config.fromPath('foo.jpg'));
      await module.watch();

      const actual = await firost.exists(config.toPath('foo.jpg'));
      expect(actual).toEqual(false);
    });
    it('should update files modified', async () => {
      await firost.write('foo', config.fromPath('foo.jpg'));
      await module.watch();

      await firost.write('bar', config.fromPath('foo.jpg'));
      await firost.waitForWatchers();

      const actual = await firost.read(config.toPath('foo.jpg'));

      expect(actual).toEqual('bar');
    });
    it('should copy files added', async () => {
      await module.watch();

      await firost.write('foo', config.fromPath('foo.jpg'));
      await firost.waitForWatchers();

      const actual = await firost.read(config.toPath('foo.jpg'));
      expect(actual).toEqual('foo');
    });
    it('should copy files added in subfolder', async () => {
      await module.watch();

      await firost.write('foo', config.fromPath('./images/foo.jpg'));
      await firost.waitForWatchers();

      const actual = await firost.read(config.toPath('./images/foo.jpg'));
      expect(actual).toEqual('foo');
    });
    it('should delete files deleted', async () => {
      await module.watch();

      await firost.write('foo', config.fromPath('foo.jpg'));
      await firost.waitForWatchers();
      await firost.remove(config.fromPath('foo.jpg'));
      await firost.waitForWatchers();

      const actual = await firost.exists(config.toPath('foo.jpg'));
      expect(actual).toEqual(false);
    });
  });
});
