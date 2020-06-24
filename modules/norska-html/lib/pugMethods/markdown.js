const _ = require('golgoth/lib/lodash');
const markdownIt = require('markdown-it');
const markdownItHighlight = require('markdown-it-highlightjs');
const markdown = markdownIt({
  html: true,
  linkify: true,
}).use(markdownItHighlight);

/**
 * Convert markdown to html
 * @param {string} input Markdown string to parse
 * @returns {string} HTML string
 **/
module.exports = function (input) {
  return _.trim(markdown.render(input));
};
