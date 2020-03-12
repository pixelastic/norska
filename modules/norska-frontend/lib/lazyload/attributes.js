/**
 * Computes all HTML attributes needed to lazyload an image: src, dataSrc, style
 * and dataBg
 *
 * @param {string} url Path to the image
 * @param {object} userOptions
 * - disable: Force loading if set to true
 * @returns {object} Attribute object
 */
module.exports = function(url, userOptions = {}) {
  const options = {
    disable: false,
    ...userOptions,
  };

  let src = null;
  let dataSrc = url;
  let style = null;
  let dataBg = url;

  // When disabled, we revert the urls
  if (options.disable) {
    src = url;
    dataSrc = null;
    style = `background-image:url(${url})`;
    dataBg = null;
  }

  return { src, dataSrc, style, dataBg };
};
