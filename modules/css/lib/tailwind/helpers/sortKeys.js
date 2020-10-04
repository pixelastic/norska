const _ = require('golgoth/lib/lodash');

/**
 * Checks if the key looks like a number
 * @param {string} key Input key
 * @returns {boolean} True if a number
 */
function isNumber(key) {
  return !isNaN(key);
}
/**
 * Converts the key to a number
 * @param {string} key Input key
 * @returns {number} The string converted to number
 */
function toNumber(key) {
  return _.parseInt(key);
}
/**
 * Checks if the key is "0"
 * @param {string} key Input key
 * @returns {boolean} True if exactly 0
 */
function isZero(key) {
  return key === '0';
}
/**
 * Parses a 100vh string in { value: 100, unit: 'vh' }
 * @param {string} key Input key
 * @returns {object} Objetc with .value and .unit
 */
function parseUnit(key) {
  const regexp = /^(?<value>\d+)(?<unit>.*)$/;
  const matches = key.match(regexp);
  if (!matches) {
    return false;
  }
  const { value, unit } = matches.groups;
  return { value, unit };
}
/**
 * Returns the number of zeroes used for padding
 * @param {string} key Input key
 * @returns {number} Number of zeroes
 */
function prefixZeroCount(key) {
  const regexp = /^(?<prefix>0+)(.+)$/;
  const matches = key.match(regexp);
  if (!matches) {
    return 0;
  }
  return matches.groups.prefix.length;
}
/**
 * Compare two numbers, considering zeroes used for padding
 *
 * @param {string} a First element
 * @param {string} b Second element
 * @returns {number} -1 if a is before b, 1 otherwise
 */
function compareNumbers(a, b) {
  // Starts with several zeros
  const prefixZeroA = prefixZeroCount(a);
  const prefixZeroB = prefixZeroCount(b);
  // Different number of padding zeros, the one with most zeroes comes first
  if (prefixZeroA != prefixZeroB) {
    const aIsZero = isZero(a);
    const bIsZero = isZero(b);
    const longerPrefixInA = prefixZeroA > prefixZeroB;
    // Special case if the key is exactly "0", it goes first
    if (aIsZero) return -1;
    if (bIsZero) return 1;
    return longerPrefixInA ? -1 : 1;
  }

  // Same number of padding zeros, we compare the actual value
  const numberA = toNumber(a);
  const numberB = toNumber(b);
  return numberA - numberB;
}

/**
 * Compare two numbers with units. First order by unit, then by value
 *
 * @param {object} parsedUnitA First element
 * @param {object} parsedUnitB Second element
 * @returns {number} -1 if a is before b, 1 otherwise
 */
function compareUnits(parsedUnitA, parsedUnitB) {
  const unitA = parsedUnitA.unit;
  const unitB = parsedUnitB.unit;
  // Different unit, we order them alphabetically
  if (unitA != unitB) {
    return compareStrings(unitA, unitB);
  }

  // Same unit, we order by value
  const valueA = parsedUnitA.value;
  const valueB = parsedUnitB.value;
  return valueA - valueB;
}

/**
 * Compare two strings
 *
 * @param {string} a First element
 * @param {string} b Second element
 * @returns {number} -1 if a is before b, 1 otherwise
 */
function compareStrings(a, b) {
  return a.localeCompare(b, 'en', { numeric: true });
}

/**
 * Sort keys in a consistent manner
 * - Numbers
 *   - Zero is first
 *   - Padding zeroes next, with 00X before 0X
 *   - Then elements with units, in alphabetical order of units
 * - Strings
 * @param {Array} keys List of keys to order
 * @returns {Array} Ordered list of keys
 */
module.exports = function (keys) {
  return _.clone(keys).sort((a, b) => {
    const isNumberA = isNumber(a);
    const isNumberB = isNumber(b);

    // Comparing two numbers
    if (isNumberA && isNumberB) {
      return compareNumbers(a, b);
    }

    // Comparing two units
    const parsedUnitA = parseUnit(a);
    const parsedUnitB = parseUnit(b);
    if (parsedUnitA && parsedUnitB) {
      return compareUnits(parsedUnitA, parsedUnitB);
    }

    // Compare strings
    return compareStrings(a, b);
  });
};
