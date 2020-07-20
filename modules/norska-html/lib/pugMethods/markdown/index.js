const _ = require('golgoth/lib/lodash');
const markdownIt = require('markdown-it');
const markdownItHighlight = require('markdown-it-highlightjs');
const highlightJsPug = require('highlightjs-pug');
const norskaPlugin = require('./plugin.js');
const markdown = markdownIt({
  html: true,
  linkify: true,
})
  .use(markdownItHighlight, {
    register: {
      pug: highlightJsPug,
    },
  })
  .use(norskaPlugin, {
    foo: 'bar',
  });

/**
 * Convert markdown to html
 * @param {string} input Markdown string to parse
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} HTML string
 **/
module.exports = function (input, context) {
  return _.trim(markdown.render(input, context));
};
