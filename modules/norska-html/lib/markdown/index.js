const config = require('norska-config');
const _ = require('golgoth/lib/lodash');
const write = require('firost/write');
const read = require('firost/read');
const firostError = require('firost/error');
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
      const pugFrontmatter = _.chain(attributes)
        .map((value, key) => {
          return `//- ${key}: ${value}`;
        })
        .join('\n')
        .value();

      const pugSource = dedent`
        //- ---
        ${pugFrontmatter}
        //- ---

        block content
          !=markdown(markdownContent)
      `;
      const options = {
        from: sourcePath,
        to: destinationPath,
        data: {
          markdownContent: body,
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
