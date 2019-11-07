import { _, pMap, timeSpan } from 'golgoth';
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
      files: [
        // Static files
        '**/*.{html,txt}',
        // Images
        '**/*.{ico,jpg,gif,png,svg}',
        // Fonts
        '**/*.{eot,otf,ttf,woff,woff2}',
        // Documents
        '**/*.pdf',
        // Netlify
        '_redirects',
        '_headers',
        'netlify.toml',
      ],
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
   * Returns a list of all absolute globs to copy
   * @returns {Array} List of all absolute glob patterns
   **/
  globs() {
    return _.map(config.get('assets.files'), filepath => {
      return config.fromPath(filepath);
    });
  },
  /**
   * Copy static assets from source to destination, keeping same directory
   * structure but not performing any transformation
   **/
  async run() {
    const inputFiles = await firost.glob(this.globs());
    const timer = timeSpan();
    const progress = firost.spinner(inputFiles.length);
    progress.text('Copying assets');

    await pMap(
      inputFiles,
      async filepath => {
        const relativePath = path.relative(config.from(), filepath);
        progress.tick(`Copying ${relativePath}`);
        await this.compile(filepath);
      },
      { concurrency: 20 }
    );
    progress.success(`Assets copied in ${timer.rounded()}ms`);
  },
  /**
   * Listen for any changes in assets and copy them to destination
   **/
  async watch() {
    await firost.watch(this.globs(), async (filepath, type) => {
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
