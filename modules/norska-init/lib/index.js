import config from 'norska-config';
import path from 'path';
import firost from 'firost';
import { _, pMap, pMapSeries } from 'golgoth';

export default {
  /**
   * Init a directory with the needed norska scaffolding
   **/
  async run() {
    const progress = firost.spinner();
    const files = await firost.glob(
      [this.templatePath('**/*'), `!${this.templatePath('scripts')}`],
      { directories: false }
    );

    const templatePrefix = this.templatePath();
    const rootPrefix = config.rootDir();

    progress.tick('Scaffolding ./src');
    await pMap(files, async source => {
      const destination = _.replace(source, templatePrefix, rootPrefix);
      if (await firost.exist(destination)) {
        return;
      }

      await firost.copy(source, destination);
    });

    progress.tick('Adding scripts');
    await this.addScripts();

    progress.success('norska project initialized');
  },
  /**
   * Returns an absolute path to the templates stored in this module.
   * @param {string} relativePath Path relative from the ./templates directory
   * @returns {string} Absolute path to the template file, or template directory
   * if no path passed
   **/
  templatePath(relativePath = '') {
    return path.resolve(__dirname, '..', 'templates', relativePath);
  },
  /**
   * Add default scripts to the package.json scripts entry and copy scripts to
   * ./scripts if needed
   **/
  async addScripts() {
    const packagePath = config.rootPath('package.json');
    const currentPackage = await firost.readJson(packagePath);
    const currentScripts = _.get(currentPackage, 'scripts', {});

    const newScripts = [
      { name: 'build', filepath: 'scripts/build' },
      { name: 'build:prod', filepath: 'scripts/build-prod' },
      { name: 'cms', filepath: 'scripts/cms' },
      { name: 'serve', filepath: 'scripts/serve' },
    ];

    await pMapSeries(newScripts, async script => {
      const { name, filepath } = script;

      // Update package.json
      if (!currentScripts[name]) {
        _.set(currentPackage, `scripts.${name}`, `./${filepath}`);
      }

      // Copy the script file
      const destination = config.rootPath(filepath);
      if (!(await firost.exist(destination))) {
        const source = this.templatePath(filepath);
        await firost.copy(source, destination);
      }
    });

    await firost.writeJson(currentPackage, packagePath);
  },
};
