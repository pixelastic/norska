const path = require('../../../path.js');
const he = require('he');
const _ = require('golgoth/lodash');

/**
 * This method is used only by the +img() mixin
 * We moved the code in its own file so it's easier to lint, test and debug
 * than inlined in the pug mixin
 * Mixin usage:
 * +img(src='path/to/image')
 * Will output an <img /> tag with src and data-src set for lazyloading. Any
 * additional attributes passed to the mixin of classes added to it will be
 * mirrored to the final one.
 *
 * @param {object} attributes HTML attributes passed to the tag
 * @param {string} sourceFile File calling the method
 * @returns {object} Formated HTML attributes to display in the img tag
 */
module.exports = function (attributes, sourceFile) {
  // options key is for lazyloading
  const options = attributes.options || {};
  delete attributes.options;

  let finalAttributes = attributes;

  // Enable lazyloading if src is set
  if (attributes.src) {
    const originUrl = he.decode(attributes.src); // Pug encodes ? and & in urls
    const lazyloadAttributes = path.lazyload(originUrl, sourceFile, options);
    finalAttributes.src = lazyloadAttributes.placeholder;
    finalAttributes['data-src'] = lazyloadAttributes.full;
    finalAttributes.loading = 'lazy';

    finalAttributes.class = _.chain(finalAttributes)
      .get('class', '')
      .split(' ')
      .concat(['lazyload'])
      .compact()
      .join(' ')
      .value();
  }

  return finalAttributes;
};
