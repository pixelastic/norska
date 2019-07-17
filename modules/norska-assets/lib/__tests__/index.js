import module from '../index';
import config from 'norska-config';
import firost from 'firost';
import cpx from 'cpx';

describe('norska-assets', () => {
  describe('run', () => {
    beforeAll(async () => {
      await config.init({
        from: './fixtures/src',
        to: './tmp/norska-assets',
        assets: module.defaultConfig(),
      });
      await firost.emptyDir(config.to());
      await module.run();
    });
    describe('images', () => {
      it('should copy gif files', async () => {
        const actual = await firost.isFile(config.toPath('images/foo.gif'));

        expect(actual).toEqual(true);
      });
      it('should copy png files', async () => {
        const actual = await firost.isFile(config.toPath('images/foo.png'));

        expect(actual).toEqual(true);
      });
      it('should copy jpg files', async () => {
        const actual = await firost.isFile(config.toPath('images/foo.jpg'));

        expect(actual).toEqual(true);
      });
      it('should copy svg files', async () => {
        const actual = await firost.isFile(config.toPath('images/foo.svg'));

        expect(actual).toEqual(true);
      });
      it('should copy ico files', async () => {
        const actual = await firost.isFile(config.toPath('favicon.ico'));

        expect(actual).toEqual(true);
      });
    });
    describe('fonts', () => {
      it('should copy eot files', async () => {
        const actual = await firost.isFile(config.toPath('fonts/foo.eot'));

        expect(actual).toEqual(true);
      });
      it('should copy otf files', async () => {
        const actual = await firost.isFile(config.toPath('fonts/foo.otf'));

        expect(actual).toEqual(true);
      });
      it('should copy ttf files', async () => {
        const actual = await firost.isFile(config.toPath('fonts/foo.ttf'));

        expect(actual).toEqual(true);
      });
      it('should copy woff files', async () => {
        const actual = await firost.isFile(config.toPath('fonts/foo.woff'));

        expect(actual).toEqual(true);
      });
    });
    describe('misc', () => {
      it('should copy html files', async () => {
        const actual = await firost.isFile(config.toPath('static.html'));

        expect(actual).toEqual(true);
      });
      it('should copy txt files', async () => {
        const actual = await firost.isFile(config.toPath('robots.txt'));

        expect(actual).toEqual(true);
      });
    });
  });
  describe('watch', () => {
    beforeEach(async () => {
      await config.init({
        from: './tmp/norska-assets-watch/src',
        to: './tmp/norska-assets-watch/dist',
        assets: module.defaultConfig(),
      });
      await firost.emptyDir(config.from());
      await firost.emptyDir(config.to());
    });
    afterEach(async () => {
      await firost.unwatchAll();
    });
    // it('should copy files added', async () => {
    //   const output = 'image.jpg';
    //   await firost.write('content', config.fromPath(output));
    //   await firost.waitForWatchers();

    //   const actual = await firost.isFile(config.toPath(output));

    //   expect(actual).toEqual(true);
    // });
    it('should update files modified', async () => {
      // Create a file
      const output = 'image.jpg';
      await firost.write('content', config.fromPath(output));

      // Update the file
      await module.watch();
      // await firost.write('new content', config.fromPath(output));
      await firost.waitForWatchers();
      await firost.sleep(400);

      const actual = await firost.isFile(config.toPath(output));
      console.info(config.toPath(output));

      expect(actual).toEqual(true);
    });
    // it('should delete files deleted', async () => {
    // });
  });
});
