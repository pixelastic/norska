const highlight = require('./highlight.js');
/**
 * Enhance the hits data:
 *  - auto-highlight fields by default
 *  - add new keys defined in transform
 *  - edit exiting keys defined in transform
 * @param {Array} hits List of hits
 * @param {object} transforms Object containing one key per field to transform
 * @param {Function} rawOnDisplay Method to call on the hit before displaying it
 * @returns {Array} Transformed list of items
 */
module.exports = function(hits, transforms, rawOnDisplay) {
  const onDisplay = rawOnDisplay || (() => {});

  return hits.map((rawHit, index) => {
    const hit = {};

    // Highlight each key
    Object.keys(rawHit).forEach(key => {
      hit[key] = highlight(rawHit, key);
    });

    // Keep reference to original hit
    hit.__original = rawHit;

    // Apply custom transforms
    Object.keys(transforms).forEach(key => {
      hit[key] = transforms[key](hit, index);
    });

    onDisplay(hit);

    return hit;
  });
};
