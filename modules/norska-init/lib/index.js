import config from 'norska-config';
import path from 'path';
import firost from 'firost';
import { _, pMap, pMapSeries } from 'golgoth';

export default {
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
   * Copy a template file from the norska-init module to the host.
   * @param {string} source Path to the source file, relative to the template
   * dir
   * @param {string} destination Path to the destination file, relative to the
   * root
   * @returns {boolean} True on success, false othewise
   **/
  async copyTemplate(source, destination) {
    const absoluteSource = this.templatePath(source);
    const absoluteDestination = config.rootPath(destination);

    // Source file does not exist
    if (!(await firost.isFile(absoluteSource))) {
      return false;
    }
    // Destination file already exist
    if (await firost.isFile(absoluteDestination)) {
      return false;
    }

    await firost.copy(absoluteSource, absoluteDestination);

    return true;
  },
  /**
   * Add scripts entry to the host package.json with specified command.
   * @param {string} scriptName Script name
   * @param {string} scriptPath Path to the script to run, must be a path
   * relative to the templates/ directory
   * @returns {boolean} False if can't add entry, true otherwise
   **/
  async addPackageScript(scriptName, scriptPath) {
    const packagePath = config.rootPath('package.json');
    const currentPackage = await firost.readJson(packagePath);
    const currentScripts = _.get(currentPackage, 'scripts', {});

    if (currentScripts[scriptName]) {
      return false;
    }

    await this.copyTemplate(scriptPath, scriptPath);

    const newPackage = _.set(
      _.clone(currentPackage),
      `scripts.${scriptName}`,
      `./${scriptPath}`
    );
    await firost.writeJson(newPackage, packagePath);
    return true;
  },
  /**
   * Add default scripts to the package.json scripts entry and copy scripts to
   * ./scripts if needed
   **/
  async addScripts() {
    const defaultScripts = [
      { key: 'build', value: 'scripts/build' },
      { key: 'build:prod', value: 'scripts/build-prod' },
      { key: 'cms', value: 'scripts/cms' },
      { key: 'serve', value: 'scripts/serve' },
    ];

    await pMapSeries(defaultScripts, async script => {
      await this.addPackageScript(script.key, script.value);
    });
  },
  /**
   * Init a directory with the needed norska scaffolding
   **/
  async run() {
    const manifest = [
      { source: 'norska.config.js', destination: 'norska.config.js' },
      {
        source: 'src/_data/author.json',
        destination: `${config.fromPath('_data/author.json')}`,
      },
      {
        source: 'src/_data/page.json',
        destination: `${config.fromPath('_data/page.json')}`,
      },
      {
        source: 'src/_data/site.json',
        destination: `${config.fromPath('_data/site.json')}`,
      },
      {
        source: 'src/_includes/layout.pug',
        destination: `${config.fromPath('_includes/layout.pug')}`,
      },
      {
        source: 'src/index.pug',
        destination: `${config.fromPath('index.pug')}`,
      },
      {
        source: 'src/script.js',
        destination: `${config.fromPath(config.get('js.input'))}`,
      },
      {
        source: 'src/style.css',
        destination: `${config.fromPath(config.get('css.input'))}`,
      },
    ];

    await pMap(manifest, async item => {
      await this.copyTemplate(item.source, item.destination);
    });

    await this.addScripts();
  },
};
