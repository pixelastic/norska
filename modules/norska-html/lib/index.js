import config from 'norska-config';
import helper from 'norska-helper';
import path from 'path';
import { _ } from 'golgoth';
import firost from 'firost';
import pug from 'pug';

export default {
  /**
   * Returns the list of pug files to be processed by the plugin
   * @returns {Array} List of absolute path to pug files to process
   **/
  async pugFiles() {
    const source = config.from();
    const pattern = [`${source}/**/*.pug`, `!${source}/_*`];
    return await firost.glob(pattern);
  },
  /**
   * Returns an object containing path information about the specified file.
   * Those path will be injected in the data passed to the render to be used in
   * pug directly.
   * @param {string} filepath Path to the destination created
   * @returns {object} Object containing path information, with the following
   * keys:
   * - basename: The filename (like index.html)
   * - dirname: The relative path from the root to the directory (like
   *   blog/2019)
   * - toRoot: The relative prefix from the file, to the root (like: ../..)
   **/
  getPaths(filepath) {
    const basename = path.basename(filepath);
    const absoluteDirname = path.dirname(filepath);
    const absoluteDestination = config.to();
    const dirname = _.chain(absoluteDirname)
      .replace(new RegExp(`^${absoluteDestination}`), '')
      .trim('/')
      .value();
    const toRoot = path.relative(absoluteDirname, absoluteDestination) || '.';
    return {
      basename,
      dirname,
      toRoot,
    };
  },
  async compile(relativeSource) {
    // Make path relative to source and destination
    const source = config.fromPath(relativeSource);
    const destination = _.replace(
      config.toPath(relativeSource),
      /.pug$/,
      '.html'
    );

    // TODO: Need to contain paths

    const compiler = pug.compileFile(source, {
      filename: source,
      basedir: config.from(),
    });
    const data = await helper.siteData();

    const result = compiler(data);
    await firost.write(result, destination);
  },

  // // Compile a pug file to an html one
  // async compile(filepath) {
  //   const timer = helper.timer();
  //   siteData.path = this.getPaths(destination);

  //   await helper.writeFile(htmlContent, destination, timer);
  // },

  async run() {
    const pugFiles = await this.pugFiles();
    await pMap(pugFiles, async filepath => {
      await this.compile(filepath);
    });
  },

  // // Listen to changes in pug and update
  // watch() {
  //   const from = config.from();
  //   console.info(this.topLevelPugFilesGlob());
  //   firost.watch(this.topLevelPugFilesGlob(), filepath => {
  //     console.info(filepath);
  //     this.compile(filepath);
  //   });
  //   // Rebuild everything when a layout, include or data changes
  //   firost.watch([`${from}/_*/**/*.pug`, `${from}/_data.json`], () => {
  //     this.run();
  //   });
  // },
};
