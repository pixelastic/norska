const imgHelper = require('../mixinImgHelper.js');
const _ = require('golgoth/lib/lodash');

module.exports = (md, _pluginOptions) => {
  const defaultImageRenderer = md.renderer.rules.image;

  md.renderer.rules.image = (tokens, tokenIndex, options, context, self) => {
    const token = tokens[tokenIndex];
    const src = token.attrGet('src');
    const attributes = imgHelper({ src }, context);

    token.attrJoin('class', 'lazyload');

    _.each(attributes, (value, key) => {
      token.attrSet(key, value);
    });

    return defaultImageRenderer(tokens, tokenIndex, options, context, self);
  };
};
