import helper from 'norska-helper';
import config from 'norska-config';
import path from 'path';
import { _, pMap, firost } from 'golgoth';
import pug from 'pug';

export default {
  /**
   * Returns a glob to match all pug files to convert, excluding layouts, mixins
   * and other meta pug files
   * @returns {Array} Array of glob patterns
   **/
  topLevelPugFilesGlob() {
    const from = config.from();
    return [`${from}/**/*.pug`, `!${from}/_*/*.pug`];
  },
  /**
   * Returns an object containing various path information about the output HTML
   * file. These info can then be used in all manner of absolute and relative
   * filepaths in the resulting HTML.
   * @param {String} destination Filepath of the resulting HTML
   * @returns {Object} Object containing various paths
   **/
  getPaths(destination) {
    const to = config.to();
    const basename = path.basename(destination, '.html');
    const dirname = path.dirname(_.replace(destination, `${to}/`, ''));
    const toRoot = path.relative(path.dirname(destination), to);

    return {
      toRoot,
      dirname,
      basename,
    };
  },
  // Compile a pug file to an html one
  async compile(filepath) {
    const timer = helper.timer();
    const from = config.from();
    const to = config.to();
    const basename = _.replace(path.relative(from, filepath), '.pug', '.html');
    const destination = path.join(to, basename);

    const rawContent = await firost.read(filepath);
    const pugCompile = pug.compile(rawContent, {
      filename: filepath,
    });

    // Gathering data to pass to compilation
    const siteData = await helper.siteData();
    siteData.path = this.getPaths(destination);

    // Compile layout
    const htmlContent = pugCompile(siteData);

    // Save to disk
    await helper.writeFile(htmlContent, destination, timer);
  },

  async run() {
    const pugFiles = await firost.glob(this.topLevelPugFilesGlob());
    await pMap(pugFiles, async filepath => {
      await this.compile(filepath);
    });
  },

  // Listen to changes in pug and update
  watch() {
    const from = config.from();
    firost.watch(this.topLevelPugFilesGlob(), filepath => {
      this.compile(filepath);
    });
    // Rebuild everything when a layout, include or data changes
    firost.watch(
      [
        `${from}/_layouts/*.pug`,
        `${from}/_includes/*.pug`,
        `${from}/_mixins/*.pug`,
        `${from}/_data.json`,
      ],
      () => {
        this.run();
      }
    );
  },
};
