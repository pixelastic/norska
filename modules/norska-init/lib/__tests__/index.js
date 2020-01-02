import module from '../index';
import path from 'path';
import firost from 'firost';
import config from 'norska-config';

describe('norska-init', () => {
  beforeEach(async () => {
    jest
      .spyOn(config, 'rootDir')
      .mockReturnValue(path.resolve('./tmp/norska-init'));
    jest
      .spyOn(firost, 'spinner')
      .mockReturnValue({ tick: jest.fn(), success: jest.fn() });
    await config.init({
      from: config.rootPath('src'),
      to: config.rootPath('dist'),
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
      const filepath = module.templatePath('src/script.js');
      const actual = await firost.isFile(filepath);

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
    it('should create tailwind.config.js in the root', async () => {
      await module.run();

      const actual = await firost.isFile(config.rootPath('tailwind.config.js'));

      expect(actual).toEqual(true);
    });
    it('should create _data files', async () => {
      await module.run();

      const actual = await firost.glob(config.fromPath('_data/*.json'));

      expect(actual).toInclude(config.fromPath('_data/site.json'));
    });
    it('should create pug files', async () => {
      await module.run();

      const actual = await firost.glob(config.fromPath('**/*.pug'));

      expect(actual).toInclude(config.fromPath('_includes/_layouts/core.pug'));
      expect(actual).toInclude(config.fromPath('index.pug'));
      expect(actual).toInclude(config.fromPath('404.pug'));
    });
    it('should create CSS files', async () => {
      await module.run();

      const actual = await firost.glob(config.fromPath('**/*.css'));

      expect(actual).toInclude(config.fromPath('style.css'));
    });
    it('should create JavaScript file', async () => {
      await module.run();

      const actual = await firost.isFile(config.fromPath('script.js'));

      expect(actual).toEqual(true);
    });
    it('should create netlify.toml file', async () => {
      await module.run();

      const actual = await firost.isFile(config.rootPath('netlify.toml'));

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
