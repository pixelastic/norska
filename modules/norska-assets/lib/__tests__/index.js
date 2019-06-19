import module from '../index';
import config from 'norska-config';
import firost from 'firost';
import cpx from 'cpx';

describe('norska-assets', () => {
  describe('run', () => {
    beforeAll(async () => {
      await config.init({
        from: './fixtures/src',
        to: './tmp/dist',
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
        const actual = await firost.isFile(config.toPath('foo.html'));

        expect(actual).toEqual(true);
      });
    });
  });
  describe('watch', () => {
    beforeAll(async () => {
      await config.init({
        from: '/from',
        to: '/to',
        assets: {
          files: '**/*.foo',
        },
      });
    });
    it('should call cpx.watch with the glob pattern and the destination', () => {
      jest.spyOn(cpx, 'watch').mockReturnValue();

      module.watch();

      expect(cpx.watch).toHaveBeenCalledWith('/from/**/*.foo', '/to');
    });
  });
});
