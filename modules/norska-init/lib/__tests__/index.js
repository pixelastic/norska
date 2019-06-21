import module from '../index';
import path from 'path';
import firost from 'firost';
import config from 'norska-config';

describe('norska-init', () => {
  beforeEach(() => {
    jest.spyOn(config, 'rootDir').mockReturnValue('./tmp/norska-init');
  });
  describe('templatePath', () => {
    it('should return the path to the template directory', () => {
      const actual = module.templatePath();

      expect(actual).toEqual(path.resolve(__dirname, '../..', 'templates'));
    });
    it('should return a path to a file in the template directory', async () => {
      const path = module.templatePath('src/script.js');
      const actual = await firost.isFile(path);

      expect(actual).toEqual(true);
    });
  });
  describe('copyTemplate', () => {
    beforeEach(async () => {
      await firost.emptyDir('./tmp/norska-init');
    });
    it('should copy from template directory to host', async () => {
      await module.copyTemplate('norska.config.js', 'norska.config.js');

      const actual = await firost.isFile(config.rootPath('norska.config.js'));

      expect(actual).toEqual(true);
    });
    it("should copy into subfolders, even if they don't exist", async () => {
      await module.copyTemplate('src/script.js', 'my/sub/dir/script.js');

      const actual = await firost.isFile(
        config.rootPath('my/sub/dir/script.js')
      );

      expect(actual).toEqual(true);
    });
    it('should return true if file copied', async () => {
      const actual = await module.copyTemplate(
        'norska.config.js',
        'norska.config.js'
      );

      expect(actual).toEqual(true);
    });
    it('should return false if source does not exist', async () => {
      const actual = await module.copyTemplate('nope', 'norska.config.js');

      expect(actual).toEqual(false);
    });
    it('should return false if destination already exist', async () => {
      await firost.write('creating file', config.rootPath('already-there.js'));

      const actual = await module.copyTemplate(
        'norska.config.js',
        'already-there.js'
      );

      expect(actual).toEqual(false);
    });
  });
  describe('run', () => {
    beforeAll(async () => {
      jest.spyOn(config, 'rootDir').mockReturnValue('./tmp/norska-init');
      await firost.emptyDir('./tmp/norska-init');

      await config.init({
        from: 'source',
        js: {
          input: 'my-script.js',
        },
      });
      await module.run();
    });
    it('should create a norska.config.js file at the root', async () => {
      const actual = await firost.isFile(config.rootPath('norska.config.js'));

      expect(actual).toEqual(true);
    });
    it('should create an input js file in the source', async () => {
      const actual = await firost.isFile(
        config.rootPath('source/my-script.js')
      );

      expect(actual).toEqual(true);
    });
  });
});
