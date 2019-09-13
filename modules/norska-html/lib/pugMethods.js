import { _ } from 'golgoth';
import fs from 'fs';
import path from 'path';
import config from 'norska-config';
import pug from 'pug';
import markdownIt from 'markdown-it';
import markdownItHighlight from 'markdown-it-highlightjs';
const markdown = markdownIt({
  html: true,
  linkify: true,
}).use(markdownItHighlight);

/**
 * Returns an object containing custom methods to pass to every pug file
 * It must be called with the base data object to be made available in the pug
 * files as it needs to be passed down recursively to each include() call
 * @param {object} data Data object to be made available in pug files
 * @returns {object} Custom methods available in pug files
 **/
export default function(data) {
  const methods = {
    // Making lodash available in pug files
    _,
    /**
     * Workaround for Pug not having dynamic include by default
     * This will read the file in the src directory and return it
     * If it's a pug file, it will even parse it
     * @param {string} filepath Path to the file to include, relative to source
     * @returns {string} Content to include
     **/
    include(filepath) {
      const input = config.fromPath(filepath);
      if (!fs.existsSync(input)) {
        return `ERROR: ${input} does not exist`;
      }

      const content = fs.readFileSync(input, 'utf8');
      const extname = path.extname(input);
      if (extname === '.pug') {
        // We make sure we pass both the data from the parent, and this set of
        // methods recursively
        return pug.compile(content)({ ...data, ...methods });
      }
      return content;
    },
    /**
     * Convert markdown to html
     * @param {string} input Markdown string to parse
     * @returns {string} HTML string
     **/
    markdown(input) {
      return _.trim(markdown.render(input));
    },
  };

  return methods;
}
