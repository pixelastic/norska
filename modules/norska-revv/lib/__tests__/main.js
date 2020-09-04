const current = require('../main');
const config = require('norska-config');
const helper = require('norska-helper');
const emptyDir = require('firost/emptyDir');
const write = require('firost/write');
const read = require('firost/read');
const glob = require('firost/glob');

describe('norska-revv', () => {
  const tmpDirectory = './tmp/norska-revv/main';
  beforeEach(async () => {
    await config.init({
      root: tmpDirectory,
    });
    current.__hashes = {};
    await emptyDir(tmpDirectory);
  });
  describe('run', () => {
    describe('in prod', () => {
      beforeEach(async () => {
        jest.spyOn(helper, 'isProduction').mockReturnValue(true);
        jest.spyOn(current, 'spinner').mockReturnValue({
          text() {},
          tick() {},
          success() {},
          failure() {},
        });
      });
      it('nominal case', async () => {
        await write('root', config.toPath('cover.png'));
        await write('blog', config.toPath('blog/cover.png'));
        await write('assets', config.toPath('assets/cover.png'));

        const sourceFile = config.toPath('blog/index.html');
        const htmlSource = dedent`
      <img src="{revv: cover.png}" />
      <img src="{revv: blog/cover.png}" />
      <img src="{revv: /assets/cover.png}" />
      <img src="{revv: assets/cover.png}" />
      `;
        await write(htmlSource, sourceFile);
        await current.run();

        const expected = dedent`
      <img src="../cover.63a9f0ea7b.png" />
      <img src="cover.126ac9f614.png" />
      <img src="assets/cover.32bb636196.png" />
      <img src="../assets/cover.32bb636196.png" />
      `;
        const actual = await read(config.toPath('blog/index.html'));
        expect(actual).toEqual(expected);

        const files = await glob(config.toPath('**/*'));
        expect(files).toContain(config.toPath('cover.png'));
        expect(files).toContain(config.toPath('cover.63a9f0ea7b.png'));
        expect(files).toContain(config.toPath('blog/cover.png'));
        expect(files).toContain(config.toPath('blog/cover.126ac9f614.png'));
        expect(files).toContain(config.toPath('assets/cover.png'));
        expect(files).toContain(config.toPath('assets/cover.32bb636196.png'));
      });
    });
  });
  describe('compile', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'read').mockReturnValue(null);
      jest.spyOn(current, 'revHash').mockReturnValue('h4sh');
    });
    it('should replace all occurences', async () => {
      const sourceFile = config.toPath('blog/index.html');
      const htmlSource = dedent`
      <img src="{revv: cover.png}" />
      <img src="{revv: blog/cover.png}" />
      <img src="{revv: /assets/cover.png}" />
      <img src="{revv: assets/cover.png}" />
      `;
      const expected = dedent`
      <img src="../cover.h4sh.png" />
      <img src="cover.h4sh.png" />
      <img src="assets/cover.h4sh.png" />
      <img src="../assets/cover.h4sh.png" />
      `;
      await write(htmlSource, sourceFile);
      await current.compile(sourceFile);

      const actual = await read(config.toPath('blog/index.html'));
      expect(actual).toEqual(expected);
    });
  });
  describe('convert', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'read').mockReturnValue(null);
      jest.spyOn(current, 'revHash').mockReturnValue('h4sh');
    });
    it.each([
      // htmlSource, sourceFile, expected
      ['{revv: cover.png}', 'index.html', 'cover.h4sh.png'],
      ['{revv: cover.png}', 'blog/index.html', '../cover.h4sh.png'],
      ['{revv: /cover.png}', 'index.html', 'cover.h4sh.png'],
      ['{revv: /cover.png}', 'blog/index.html', 'cover.h4sh.png'],
      ['{revv: /assets/cover.png}', 'index.html', 'assets/cover.h4sh.png'],
      [
        '{revv: cover.png}{revv: cover.png}',
        'index.html',
        'cover.h4sh.pngcover.h4sh.png',
      ],
      ['%7Brevv%3A%20cover.png%7D', 'index.html', 'cover.h4sh.png'],
      ['%7Brevv%3A%20cover.png%7D', 'blog/index.html', '..%2Fcover.h4sh.png'],
      [
        '%7Brevv%3A%20assets%2Fcover.png%7D',
        'blog/index.html',
        '..%2Fassets%2Fcover.h4sh.png',
      ],
      [
        '%7Brevv%3A%20%2Fassets%2Fcover.png%7D',
        'blog/index.html',
        'assets%2Fcover.h4sh.png',
      ],
      [
        '%7Brevv%3A%20cover.png%7D%7Brevv%3A%20cover.png%7D',
        'index.html',
        'cover.h4sh.pngcover.h4sh.png',
      ],
    ])('%s in %s => %s', async (htmlSource, sourceFile, expected) => {
      const actual = await current.convert(htmlSource, sourceFile);
      expect(actual).toEqual(expected);
    });
  });
  describe('hashFile', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'read').mockReturnValue(null);
      jest.spyOn(current, 'revHash').mockReturnValue('h4sh');
    });
    it.each([
      ['cover.png', 'cover.h4sh.png'],
      ['assets/cover.png', 'assets/cover.h4sh.png'],
      ['scripts.js.map', 'scripts.js.h4sh.map'],
    ])('%s => %s', async (input, expected) => {
      const actual = await current.hashFile(input);
      expect(actual).toEqual(expected);
    });
  });
  describe('getFileHash', () => {
    beforeEach(async () => {
      jest.spyOn(current, 'hashFile').mockImplementation((filepath) => {
        return `REVVED:${filepath}`;
      });
    });
    it('should hash the input', async () => {
      const actual = await current.getFileHash('cover.png');
      expect(actual).toEqual('REVVED:cover.png');
    });
    it('should allow passing a custom method', async () => {
      config.set('revv.hashingMethod', (filepath) => {
        return `CUSTOM_REVVED:${filepath}`;
      });
      const actual = await current.getFileHash('cover.png');
      expect(actual).toEqual('CUSTOM_REVVED:cover.png');
    });
    it('should normalize paths starting with /', async () => {
      const actual = await current.getFileHash('/cover.png');
      expect(actual).toEqual('REVVED:cover.png');
    });
    it('should read from cache on next calls', async () => {
      await current.getFileHash('cover.png');
      await current.getFileHash('cover.png');
      expect(current.hashFile).toHaveBeenCalledTimes(1);
      expect(current).toHaveProperty(
        ['__hashes', 'cover.png'],
        'REVVED:cover.png'
      );
    });
  });
});
