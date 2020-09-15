module.exports = {
  __credentials: {},
  /**
   * Init the singleton, storing the credentials
   * @param {object} credentials Credential object to store
   **/
  init(credentials) {
    this.__credentials = credentials;
  },
  /**
   * Returns the index name
   * @returns {string} Name of the main index
   **/
  indexName() {
    return this.__credentials.indexName;
  },
};
