const _ = require('golgoth/lib/lodash');
const path = require('../../../path.js');

/**
 * This method is used only by the +head() mixin
 * Having the code in a js file instead of a pug file makes it easier to lint
 * and test
 *
 * This returns an object containing all the meta values to includes
 * @param {object} meta The meta object (meta defined in page, with site meta as
 * fallback)
 * @param {string} sourceFile File calling the method
 * @returns {object} Object of meta keys to include in the head
 */
module.exports = function (meta, sourceFile) {
  const currentUrl = path.pageUrl(sourceFile);

  const { title, twitter } = meta;
  const description = _.chain(meta)
    .get('description')
    .truncate({ length: 180 })
    .value();
  const image = _.get(meta, 'image', path.screenshot(sourceFile));
  const url = _.get(meta, 'url', currentUrl);

  return {
    description,
    image,
    title,
    twitter,
    url,
  };
};
