const imgHelper = require('../mixinImgHelper.js');
const config = require('norska-config');
const _ = require('golgoth/lib/lodash');

/**
 * Normalize a url
 * Remote urls are unchanged.
 * Local urls are prefixed with ./ or the specified basePath
 * @param {string} url Image url
 * @param {object} context Pug context: .data, .methods, .destination
 * @returns {string} Normalized url
 **/
function normalizeUrl(url, context) {
  // Don't change remote urls
  const isRemote = url.startsWith('http');
  if (isRemote) {
    return url;
  }

  // Use basePath if defined
  const { basePath } = context.options;
  if (basePath) {
    const { destination } = context;
    return config.relativePath(destination, `${basePath}/${url}`);
  }

  // Force local urls to start with ./
  return `./${url}`;
}

module.exports = (md, _pluginOptions) => {
  const defaultImageRenderer = md.renderer.rules.image;

  md.renderer.rules.image = (tokens, tokenIndex, options, context, self) => {
    const token = tokens[tokenIndex];

    let src = normalizeUrl(token.attrGet('src'), context);

    const attributes = imgHelper({ src }, context);
    attributes.class = 'lazyload';

    // Add attributes in the same order each time
    _.chain(attributes)
      .keys()
      .sort()
      .each((key) => {
        const value = attributes[key];
        token.attrSet(key, value);
      })
      .value();

    return defaultImageRenderer(tokens, tokenIndex, options, context, self);
  };
};
