const assets = require('norska-assets');
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

  // Stop if no src
  if (!attributes.src) {
    return attributes;
  }

  const { src } = attributes;
  const isLocal = path.isLocal(src);

  let finalAttributes = attributes;

  const originUrl = he.decode(src); // Pug encodes ? and & in urls
  const lazyloadAttributes = path.lazyload(originUrl, sourceFile, options);
  finalAttributes.src = lazyloadAttributes.placeholder;
  finalAttributes['data-src'] = lazyloadAttributes.full;
  finalAttributes.loading = 'lazy';

  // Local images have a set width and height
  // Additional styling (blurry, gray background) is done through the CSS class
  if (isLocal) {
    const runtimeKey = path.pathFromRoot(src, sourceFile);
    const { width, height } = assets.readImageManifest(runtimeKey);
    finalAttributes.width = width;
    finalAttributes.height = height;
  }

  const cssClass = isLocal ? 'lazyload-local' : 'lazyload-remote';

  finalAttributes.class = _.chain(finalAttributes)
    .get('class', '')
    .split(' ')
    .concat(['lazyload', cssClass])
    .compact()
    .sort()
    .join(' ')
    .value();

  return finalAttributes;
};
