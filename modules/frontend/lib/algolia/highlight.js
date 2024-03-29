const { get } = require('lodash-es');
/**
 * Replace <mark> with <mark> with the needed class
 * @param {string} input Highlighted string
 * @returns {string} Better highlighted string
 */
function __replaceHighlightMarkup(input) {
  return input.value.replace(/<mark>/g, '<mark class="ais-highlight">');
}

/**
 * Return the highlighted version of a key
 * @param {object} item Initial object
 * @param {string} key Key of the object to highlight
 * @returns {string|Array} Highlighted string or array
 **/
module.exports = function highlight(item, key) {
  let highlightValue =
    get(item, `_snippetResult.${key}`) || get(item, `_highlightResult.${key}`);
  if (!highlightValue) {
    return get(item, key);
  }

  const rawValue = get(item, key);
  // Highlight all elements of array
  if (Array.isArray(rawValue)) {
    return highlightValue.map(__replaceHighlightMarkup.bind(this));
  }

  // Recursively highlight all subkeys of objects
  if (typeof rawValue == 'object' && rawValue.constructor == Object) {
    const subItem = {};
    Object.keys(rawValue).forEach((subKey) => {
      subItem[subKey] = highlight(item, `${key}.${subKey}`);
    });
    return subItem;
  }
  // Highlight simple string
  return __replaceHighlightMarkup(highlightValue);
};
