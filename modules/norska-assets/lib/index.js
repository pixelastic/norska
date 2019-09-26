import { pMap } from 'golgoth';
import firost from 'firost';
import path from 'path';
import config from 'norska-config';

export default {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return {
      files: '**/*.{eot,gif,html,ico,jpg,otf,png,svg,ttf,txt,woff,woff2}',
    };
  },
  /**
   * Copy a static file from source to destination, keeping the same directory
   * structure
   * @param {string} inputFile Relative path to the source file
   * */
  async compile(inputFile) {
    const sourceFolder = config.from();
    const absoluteSource = config.fromPath(inputFile);
    const relativeSource = path.relative(sourceFolder, absoluteSource);
    const absoluteDestination = config.toPath(relativeSource);

    await firost.copy(absoluteSource, absoluteDestination);
  },
  /**
   * Copy static assets from source to destination, keeping same directory
   * structure but not performing any transformation
   **/
  async run() {
    const inputFiles = await firost.glob(
      config.fromPath(config.get('assets.files'))
    );

    await pMap(inputFiles, this.compile);
  },
  /**
   * Listen for any changes in assets and copy them to destination
   **/
  async watch() {
    const pattern = config.fromPath(config.get('assets.files'));
    await firost.watch(pattern, async (filepath, type) => {
      // When removing a file in source, we remove it in destination as well
      if (type === 'removed') {
        const sourceFolder = config.from();
        const relativeSource = path.relative(sourceFolder, filepath);
        const absoluteDestination = config.toPath(relativeSource);
        await firost.remove(absoluteDestination);
        return;
      }
      // Otherwise, we simly copy it
      await this.compile(filepath);
    });
  },
};
