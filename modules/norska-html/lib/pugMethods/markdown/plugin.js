const imgHelper = require('../mixinImgHelper.js');
const config = require('norska-config');
const _ = require('golgoth/lib/lodash');

module.exports = (md, _pluginOptions) => {
  const defaultImageRenderer = md.renderer.rules.image;

  md.renderer.rules.image = (tokens, tokenIndex, options, context, self) => {
    const token = tokens[tokenIndex];

    let src = token.attrGet('src');

    // Add a path prefix if defined
    const isRemote = src.startsWith('http');
    const { basePath } = context.options;
    if (!isRemote && basePath) {
      const fullPath = `${basePath}/${src}`;
      src = config.relativePath(context.destination, fullPath);
    }

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
