import config from 'norska-config';
import path from 'path';
import firost from 'firost';
import { pMap } from 'golgoth';

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
   * Init a directory with the needed norska scaffolding
   **/
  async run() {
    const manifest = [
      { source: 'norska.config.js', destination: 'norska.config.js' },
      {
        source: 'src/script.js',
        destination: `${config.from()}/${config.get('js.input')}`,
      },
    ];
    await pMap(manifest, async item => {
      await this.copyTemplate(item.source, item.destination);
    });
  },
};
