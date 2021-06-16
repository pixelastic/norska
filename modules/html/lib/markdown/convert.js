const _ = require('golgoth/lodash');
const markdownIt = require('markdown-it');
const markdownItHighlight = require('markdown-it-highlightjs');
const highlightJsPug = require('highlightjs-pug');
const mixinHelperImg = require('../pug/mixins/helpers/img.js');
const path = require('../path.js');
const slug = require('./slug.js');
const isUrl = require('firost/isUrl');

module.exports = {
  /**
   * Convert a markdown source into HTML
   * @param {string} markdownSource The markdown text
   * @param {string} sourceFile Path to the file to resolve relative paths from
   * @param {object} options Option object to pass to the renderer
   * @param {string} options.imgUrlPrefix Url to prefix to all image src
   * attributes
   * @returns {string} HTML string
   **/
  run(markdownSource, sourceFile, options = {}) {
    if (!this.__compiler) {
      this.__compiler = markdownIt({
        html: true,
        linkify: true,
      })
        .use(markdownItHighlight, {
          register: {
            pug: highlightJsPug,
          },
        })
        .use(this.plugin.bind(this));
    }
    let compiler = this.__compiler;

    const renderOptions = {
      sourceFile,
      ...options,
    };

    return _.trim(compiler.render(markdownSource, renderOptions));
  },
  /**
   * Custom markdownIt plugin to add custom transformations
   * @param {object} instance The markdownIt instance.
   * Documentation for markdownIt plugins: https://github.com/markdown-it/markdown-it/tree/master/docs
   **/
  plugin(instance) {
    // Override the default handling of images
    this.__defaultImageRenderer = instance.renderer.rules.image;
    instance.renderer.rules.image = this.imageRenderer.bind(this);

    // Override the default handling of links
    instance.renderer.rules.link_open = this.linkRenderer.bind(this);

    // Override the default handling of headers
    instance.renderer.rules.heading_open = this.headingOpen.bind(this);
    instance.renderer.rules.heading_close = this.headingClose.bind(this);
  },
  /**
   * Custom markdownIt image renderer method to mimic the +img mixin
   * @param {Array} tokens List of all token
   * @param {number} tokenIndex Index of the current token
   * @param {object} _markdownItOptions Options passed when instanciating
   * markdownIt
   * @param {object} renderOptions Options passed to the compiler.render()
   * method
   * @param {object} _self Current rendered
   * @returns {string} HTML representation of the image
   **/
  imageRenderer(tokens, tokenIndex, _markdownItOptions, renderOptions, _self) {
    const { sourceFile, imgUrlPrefix } = renderOptions;

    const token = tokens[tokenIndex];
    const tokenAttributes = _.fromPairs(token.attrs);
    const srcAttribute = tokenAttributes.src;
    const isLocal = !isUrl(srcAttribute);

    if (imgUrlPrefix && isLocal) {
      tokenAttributes.src = `${imgUrlPrefix}/${srcAttribute}`;
    }

    const attributes = mixinHelperImg(tokenAttributes, sourceFile);

    // Add attributes in alphabetical order
    token.attrs = [];
    _.chain(attributes)
      .keys()
      .sort()
      .each((key) => {
        const value = attributes[key];
        token.attrSet(key, value);
      })
      .value();

    // Pass it back to the default image renderer
    return this.__defaultImageRenderer(
      tokens,
      tokenIndex,
      _markdownItOptions,
      renderOptions,
      _self
    );
  },
  /**
   * Normalize all links so starting / are relative to the website root and all
   * urls are normalized
   * @param {Array} tokens List of all token
   * @param {number} tokenIndex Index of the current token
   * @param {object} _markdownItOptions Options passed when instanciating
   * markdownIt
   * @param {object} renderOptions Options passed to the compiler.render()
   * method
   * @param {object} _self Current rendered
   * @returns {string} HTML representation of the opening link tag
   **/
  linkRenderer(tokens, tokenIndex, _markdownItOptions, renderOptions, _self) {
    const sourceFile = renderOptions.sourceFile;
    const token = tokens[tokenIndex];
    const attributes = _.fromPairs(token.attrs);

    const href = attributes.href;
    const normalizedHref = path.link(href, sourceFile);

    token.attrSet('href', normalizedHref);
    return _self.renderToken(tokens, tokenIndex, _markdownItOptions);
  },
  /**
   * Transform headers into links to themselves
   * @param {Array} tokens List of all token
   * @param {number} tokenIndex Index of the current token
   * @returns {string} HTML representation of the opening link tag
   **/
  headingOpen(tokens, tokenIndex) {
    const tag = _.get(tokens[tokenIndex], 'tag');
    const id = _.chain(tokens[tokenIndex + 1])
      .get('children')
      .map('content')
      .compact()
      .join('')
      .thru(slug)
      .kebabCase()
      .value();

    return `<${tag} id="${id}"><a href="#${id}">`;
  },
  headingClose(tokens, tokenIndex) {
    const tag = _.get(tokens[tokenIndex], 'tag');
    return `</a></${tag}>`;
  },
  __compiler: null,
  __defaultImageRenderer: null,
};
