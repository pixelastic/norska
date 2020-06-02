const credentials = require('../credentials.js');
module.exports = {
  metaKeys: ['page', 'query'],
  indexKeys: ['sortBy', 'index'],
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
    const isIndex = this.indexKeys.includes(key);

    if (isMeta || isIndex) {
      return `${key}:${encodeURIComponent(value)}`;
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

    // Stop if a filter than changes the index
    const isIndex = this.indexKeys.includes(key);
    if (isIndex) {
      return {};
    }

    // Pages must be converted to number
    const isPage = key === 'page';
    if (isPage) {
      value = parseInt(value);
    }

    // Meta keys are at the root
    const isMeta = this.metaKeys.includes(key);
    if (isMeta) {
      return {
        [key]: decodeURIComponent(value),
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
   * Return the name of the index base on the location hash
   * Default to base index, unless index: is set, or sortBy: is set
   * @param {string} locationHash location hash to decode
   * @returns {string} name of the index
   */
  indexNameFromLocationHash(locationHash) {
    const stringFilters = locationHash.replace(/^#/, '').split('/');
    const filters = {};
    stringFilters.forEach(filter => {
      const [key, value] = filter.split(':');
      filters[key] = value;
    });

    const baseIndex = this.indexName();
    const sortByKey = filters.sortBy;
    const indexKey = filters.index;
    if (sortByKey) {
      return `${baseIndex}_${sortByKey}`;
    }
    if (indexKey) {
      return indexKey;
    }
    return baseIndex;
  },
  /**
   * Return the current url
   * @returns {string} Current url, without query string nor hash
   **/
  currentUrl() {
    const fullUrl = `${location.origin}${location.pathname}`;
    return fullUrl.replace(/index\.html$/, '');
  },
  /**
   * Returns the index name
   * @returns {string} Name of the main index
   **/
  indexName() {
    return credentials.indexName();
  },
  /**
   * Checks if a given index name seems to be a replica
   * Replicas start with the base index name as prefix
   * @param {string} indexName name of the index to test
   * @returns {boolean} true if seems like a replica
   **/
  isReplica(indexName) {
    const baseIndexName = this.indexName();
    return indexName.startsWith(baseIndexName);
  },
  /**
   * Return the short replica name (minus the base index prefix)
   * @param {string} indexName name of the replica index
   * @returns {string} short name of the replica
   **/
  replicaShortname(indexName) {
    const baseIndexName = this.indexName();
    const regexp = new RegExp(`^${baseIndexName}_`);
    return indexName.replace(regexp, '');
  },
};
