const config = require('norska-config');
const _ = require('golgoth/lib/lodash');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const firostError = require('firost/lib/error');
const dedent = require('golgoth/lib/dedent');
const frontMatter = require('front-matter');
const pug = require('../pug/index.js');

module.exports = {
  /**
   * Compile a markdown page into html
   * @param {string} sourcePath Path to the source markdown file
   * @param {string} destinationPath Path to the destination html file
   * @returns {boolean} True on success
   **/
  async compile(sourcePath, destinationPath) {
    const absoluteSourcePath = config.fromPath(sourcePath);
    const absoluteDestinationPath = config.toPath(destinationPath);

    let result;
    try {
      const markdownSource = await read(absoluteSourcePath);

      const { attributes, body } = frontMatter(markdownSource);
      const meta = _.omit(attributes, ['layout']);

      const layout = attributes.layout || 'core';
      const pugSource = dedent`
      extends /_includes/layouts/${layout}

      block content
        !=markdown(markdownContent)
      `;
      const options = {
        from: sourcePath,
        to: destinationPath,
        data: {
          markdownContent: body,
          meta,
        },
      };
      result = await pug.convert(pugSource, options);
    } catch (err) {
      throw firostError('ERROR_MARKDOWN_COMPILATION_FAILED', err.toString());
    }

    await write(result, absoluteDestinationPath);
    return true;
  },
};
