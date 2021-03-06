const config = require('norska-config');
const netlify = require('norska-netlify');
const path = require('path');
const _ = require('golgoth/lodash');
const pMap = require('golgoth/pMap');
const pMapSeries = require('golgoth/pMapSeries');
const copy = require('firost/copy');
const exist = require('firost/exist');
const glob = require('firost/glob');
const readJson = require('firost/readJson');
const spinner = require('firost/spinner');
const writeJson = require('firost/writeJson');
const prompt = require('firost/prompt');
const consoleInfo = require('firost/consoleInfo');
const consoleWarn = require('firost/consoleWarn');

module.exports = {
  /**
   * Init a directory with the needed norska scaffolding
   **/
  async run() {
    const progress = this.__spinner();
    const files = await glob(
      [this.templatePath('**/*'), `!${this.templatePath('scripts')}`],
      { directories: false }
    );

    const templatePrefix = this.templatePath();
    const rootPrefix = config.root();

    progress.tick('initializing new project');
    await pMap(files, async (source) => {
      const destination = _.replace(source, templatePrefix, rootPrefix);
      if (await exist(destination)) {
        return;
      }

      await copy(source, destination);
    });

    await this.addScripts();

    await this.setPackageFiles();
    progress.success('norska project initialized');

    await this.enableNetlify();
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
   * Will set the files key of package.json to an empty array
   * The files key define which keys should be released in a module. As a norska
   * website will not be released as a module, we set the key to an empty array.
   * This helps ESLint warn about require calls that might require a file not
   * available
   * */
  async setPackageFiles() {
    const packagePath = config.rootPath('package.json');
    const currentPackage = await readJson(packagePath);
    currentPackage.files = [];
    await writeJson(currentPackage, packagePath);
  },
  /**
   * Add default scripts to the package.json scripts entry and copy scripts to
   * ./scripts if needed
   **/
  async addScripts() {
    const packagePath = await config.rootPath('package.json');
    const currentPackage = await readJson(packagePath);
    const currentScripts = _.get(currentPackage, 'scripts', {});

    const newScripts = [
      { name: 'build', filepath: 'scripts/build' },
      { name: 'build:prod', filepath: 'scripts/build-prod' },
      { name: 'cms', filepath: 'scripts/cms' },
      { name: 'serve', filepath: 'scripts/serve' },
    ];

    await pMapSeries(newScripts, async (script) => {
      const { name, filepath } = script;

      // Update package.json
      if (!currentScripts[name]) {
        _.set(currentPackage, `scripts.${name}`, `./${filepath}`);
      }

      // Copy the script file
      const destination = config.rootPath(filepath);
      if (!(await exist(destination))) {
        const source = this.templatePath(filepath);
        await copy(source, destination);
      }
    });

    await writeJson(currentPackage, packagePath);
  },
  /**
   * Configure Netlify to deploy this project. Asks for confirmation first
   **/
  async enableNetlify() {
    consoleInfo('Configuring Netlify...');
    try {
      await prompt('Press Enter to continue, or CTRL-C to skip');
    } catch (err) {
      consoleWarn('Skipping Netlify configuration');
      return;
    }

    await netlify.enable();
  },
  __spinner: spinner,
};
