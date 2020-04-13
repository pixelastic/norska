const algolia = require('algoliasearch/lite');
const instantsearch = require('instantsearch.js').default;
const { history } = require('instantsearch.js/es/lib/routers');
const router = require('./router');
const credentials = require('./credentials');
const transformHits = require('./transformHits');
const { filter } = require('lodash-es');

module.exports = {
  __client: null,
  __widgets: [],
  __transforms: {},
  /**
   * Init the search with credentials
   * @param {object} userCredentials object. Should include appId,
   * apiKey and indexName
   * @returns {object} Algolia instance, for chaining
   **/
  init(userCredentials) {
    credentials.init(userCredentials);
    const { appId, apiKey, indexName } = userCredentials;

    this.__client = instantsearch({
      indexName,
      searchClient: algolia(appId, apiKey),
      routing: {
        router: history(router),
      },
    });

    return this;
  },
  /**
   * Define the list of widgets to use
   * @param {Array} widgets List of widgets
   * @returns {object} Algolia instance, for chaining
   **/
  setWidgets(widgets) {
    this.__widgets = filter(widgets, this.hasContainer);
    return this;
  },
  /**
   * Define the list of transforms to apply on the hits
   * @param {object} transforms Transforms to apply on each hit
   * @returns {object} Algolia instance, for chaining
   **/
  setTransforms(transforms) {
    this.__transforms = transforms;
    return this;
  },
  /**
   * Checks if a given widget has a container available
   * @param {object} widget Widget definition
   * @returns {boolean} True if container is in the document
   **/
  hasContainer(widget) {
    const containerSelector = widget.options.container;
    const hasContainer = document.querySelector(containerSelector);
    return hasContainer;
  },
  /**
   * Starts the search, initializing the widgets and sending the initial query
   **/
  start() {
    // Finding the hits record and enhancing the results
    const widgets = this.__widgets.map(widget => {
      const isHitWidget = widget.type.name === 'hits';

      // Transforming hits before display
      if (isHitWidget) {
        widget.options.transformItems = items => {
          return transformHits(items, this.__transforms);
        };
      }

      return widget.type(widget.options);
    });

    this.__client.addWidgets(widgets);
    this.__client.start();
  },
};
