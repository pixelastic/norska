const _ = require('golgoth/lib/lodash');
const normalizeUrl = require('firost/lib/normalizeUrl');

/**
 * This method is used only by the +norska_head() mixin
 * Having the code in a js file instead of a pug file makes it easier to lint
 * and test
 *
 * This returns an object containing all the meta values to includes
 * @param {object} meta The current meta object, takes precedence
 * @param {object} defaultValues The current data.site object, as fallback
 * @param {object} urlData The current url object
 * @returns {object} Object of meta keys to include in the head
 */
module.exports = function (meta, defaultValues, urlData) {
  const currentUrl = normalizeUrl(`${defaultValues.defaultUrl}${urlData.here}`);

  const title = _.get(meta, 'title', defaultValues.defaultTitle);
  const description = _.chain(meta)
    .get('description', defaultValues.defaultDescription)
    .truncate({ length: 180 })
    .value();
  const twitter = _.get(meta, 'twitter', defaultValues.defaultTwitter);
  const image = _.get(meta, 'image', null);
  const pageUrl = _.get(meta, 'url', currentUrl);

  return {
    title,
    description,
    twitter,
    image,
    pageUrl,
  };
};
