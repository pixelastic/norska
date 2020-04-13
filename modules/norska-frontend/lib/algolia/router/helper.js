module.exports = {
  metaKeys: ['page', 'query'],
  filterKeys: ['refinementList', 'range'],
  rangePattern: /^{(.*)}/,
  refinementListPattern: /^\[(.*)\]/,
  /**
   * Converts a key and value pair to a string suitable to be put in the URL
   * @param {*} value Value of the filters
   * @param {string} key Key name
   * @returns {string} URL part
   **/
  keyValueToString(value, key) {
    const isMeta = this.metaKeys.includes(key);

    if (isMeta) {
      return `${key}:${value}`;
    }

    const isFilter = Array.isArray(value);

    // Filters
    if (isFilter) {
      const encodedValue = value.map(encodeURIComponent);
      const joinedValue = encodedValue.sort().join(',');
      return `${key}:[${joinedValue}]`;
    }

    // Range
    const isRange = value.includes(':');
    if (isRange) {
      const urlValue = value.replace(':', ',');
      return `${key}:{${urlValue}}`;
    }

    return 'TODO';
  },
  /**
   * Converts a key:value hash string into a filter object
   * @param {string} input key:value hash string
   * @returns {object} Filter object
   **/
  stringToFilterObject(input) {
    const [rawKey, rawValue] = input.split(':');
    let key = rawKey;
    let value = rawValue;

    // Pages must be converted to number
    const isPage = key === 'page';
    if (isPage) {
      value = parseInt(value);
    }

    // Meta keys are at the root
    const isMeta = this.metaKeys.includes(key);
    if (isMeta) {
      return {
        [key]: value,
      };
    }

    // Refinement list
    const isFilter = this.refinementListPattern.test(value);
    if (isFilter) {
      const capture = this.refinementListPattern.exec(value);
      value = capture[1]
        .split(',')
        .map(decodeURIComponent)
        .sort();
      return {
        refinementList: {
          [key]: value,
        },
      };
    }

    // Range
    const isRange = this.rangePattern.test(value);
    if (isRange) {
      const capture = this.rangePattern.exec(value);
      value = capture[1].replace(',', ':');
      return {
        range: {
          [key]: value,
        },
      };
    }
  },
  /**
   * Return the current url
   * @returns {string} Current url, without query string nor hash
   **/
  currentUrl() {
    const fullUrl = `${location.origin}${location.pathname}`;
    return fullUrl.replace(/index\.html$/, '');
  },
};
