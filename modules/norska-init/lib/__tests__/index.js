import module from '../index';
import path from 'path';
import firost from 'firost';
import config from 'norska-config';

describe('norska-init', () => {
  beforeEach(async () => {
    jest.spyOn(config, 'rootDir').mockReturnValue('./tmp/norska-init');
    await config.init({
      from: './tmp/norska-init/src',
      to: './tmp/norska-init/dist',
      js: { input: 'js/script.js' },
      css: { input: 'css/style.css' },
    });
    await firost.emptyDir('./tmp/norska-init');
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
  describe('addPackageScript', () => {
    it('should return false if entry in package.json scripts already exist', async () => {
      await firost.writeJson(
        { scripts: { foo: 'bar' } },
        config.rootPath('package.json')
      );

      const actual = await module.addPackageScript('foo', 'scripts/build');

      expect(actual).toEqual(false);
    });
    it('should add an entry to the package.json scripts keys', async () => {
      await firost.writeJson({}, config.rootPath('package.json'));

      await module.addPackageScript('build', 'scripts/build');

      const actual = await firost.readJson(config.rootPath('package.json'));

      expect(actual).toHaveProperty('scripts.build', './scripts/build');
    });
    it('should copy script to the host ./scripts directory', async () => {
      await firost.writeJson({}, config.rootPath('package.json'));

      await module.addPackageScript('build', 'scripts/build');

      const actual = await firost.isFile(config.rootPath('scripts/build'));

      expect(actual).toEqual(true);
    });
  });
  describe('addScripts', () => {
    beforeEach(async () => {
      await firost.writeJson({}, config.rootPath('package.json'));
    });
    it('should add build script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        config.rootPath('package.json')
      );
      const fileCreated = await firost.isFile(config.rootPath('scripts/build'));

      expect(packageJson).toHaveProperty('scripts.build', './scripts/build');
      expect(fileCreated).toEqual(true);
    });
    it('should add build:prod script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        config.rootPath('package.json')
      );
      const fileCreated = await firost.isFile(
        config.rootPath('scripts/build-prod')
      );

      expect(packageJson).toHaveProperty(
        'scripts.build:prod',
        './scripts/build-prod'
      );
      expect(fileCreated).toEqual(true);
    });
    it('should add cms script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        config.rootPath('package.json')
      );
      const fileCreated = await firost.isFile(config.rootPath('scripts/cms'));

      expect(packageJson).toHaveProperty('scripts.cms', './scripts/cms');
      expect(fileCreated).toEqual(true);
    });
    it('should add serve script', async () => {
      await module.addScripts();

      const packageJson = await firost.readJson(
        config.rootPath('package.json')
      );
      const fileCreated = await firost.isFile(config.rootPath('scripts/serve'));

      expect(packageJson).toHaveProperty('scripts.serve', './scripts/serve');
      expect(fileCreated).toEqual(true);
    });
  });
  describe('run', () => {
    beforeEach(async () => {
      await firost.writeJson({}, config.rootPath('package.json'));
    });
    it('should create norska.config.js in the root', async () => {
      await module.run();

      const actual = await firost.isFile(config.rootPath('norska.config.js'));

      expect(actual).toEqual(true);
    });
    it('should create _data files', async () => {
      await module.run();

      const actual = await firost.glob(config.fromPath('_data/*.json'));

      expect(actual).toInclude(config.fromPath('_data/author.json'));
      expect(actual).toInclude(config.fromPath('_data/page.json'));
      expect(actual).toInclude(config.fromPath('_data/site.json'));
    });
    it('should create pug files', async () => {
      await module.run();

      const actual = await firost.glob(config.fromPath('**/*.pug'));

      expect(actual).toInclude(config.fromPath('_includes/layout.pug'));
      expect(actual).toInclude(config.fromPath('index.pug'));
    });
    it('should create CSS file', async () => {
      await module.run();

      const actual = await firost.isFile(config.fromPath('css/style.css'));

      expect(actual).toEqual(true);
    });
    it('should create JavaScript file', async () => {
      await module.run();

      const actual = await firost.isFile(config.fromPath('js/script.js'));

      expect(actual).toEqual(true);
    });
    it('should add scripts to the package.json', async () => {
      await module.run();

      const actual = await firost.readJson(config.rootPath('package.json'));
      expect(actual).toHaveProperty('scripts.build');
      expect(actual).toHaveProperty('scripts.build:prod');
      expect(actual).toHaveProperty('scripts.cms');
      expect(actual).toHaveProperty('scripts.serve');
    });
  });
});
