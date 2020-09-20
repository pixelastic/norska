/**
 * Converts an RGB object into a string to be used in a rgb() context
 * @param {string} color Color object
 * @returns {string} String representation of the rgb
 */
module.exports = function (color) {
  const { red, green, blue } = color;
  return `${red}, ${green}, ${blue}`;
};
