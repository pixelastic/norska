const imageProxy = require('norska-image-proxy');

/**
 * Simplifies the handling of image lazyloading in a search result page.
 * - Keeps track of which image has been proxified or not, to prevent blinking
 * - Provides a method to generate HTML attributes for an image
 **/
module.exports = {
  /**
   * Initialize method to be called at page load
   * Will keep track of which images are lazyloaded or not
   **/
  init() {
    // Listen to lazyload images, and store which one we already have processed
    document.addEventListener('lazyloaded', (event) => {
      const { target } = event;
      const uuid = target.dataset.uuid;
      this.loaded[uuid] = true;
    });
  },
  // Keep track of which picture are already lazyloaded
  loaded: {},
  // Check if we have already loaded such an image
  isLoaded(objectId) {
    return !!this.loaded[objectId];
  },
  /**
   * Returns the list of HTML attributes to add to the <img /> tag
   * @param {string} originUrl URL to the full size image
   * @param {object} options Options
   * @param {string} options.cloudinary Cloudinary bucket to use (optional)
   * @param {object} options.imoen Imoen object holding image metadata (dimensions, lqip, hash)
   * @param {string} options.uuid A unique identifier for this image
   * @returns {object} Object of HTML attributes to add to an <img /> tag
   **/
  attributes(originUrl, options = {}) {
    const { cloudinary, imoen, uuid, cacheBusting } = {
      cloudinary: null,
      imoen: {},
      uuid: originUrl,
      cacheBusting: true,
      ...options,
    };
    const { hash, width, height, lqip } = imoen;

    // Add the image hash to the url if cacheBusting is set to true
    const url = cacheBusting ? `${originUrl}?v=${hash}` : originUrl;

    const fullUrl = imageProxy(url, {
      cloudinary,
    });

    const attributes = {
      width,
      height,
      lqip,
      fullUrl,
      dataUuid: uuid,
    };

    // Image has already been lazyloaded, so we display the full size directly
    if (this.loaded[uuid]) {
      return {
        ...attributes,
        cssClass: '',
        dataSrc: fullUrl,
        src: fullUrl,
      };
    }

    // This is the first time displaying the image, so we use the LQIP as
    // placeholder
    return {
      ...attributes,
      cssClass: 'lazyload',
      dataSrc: fullUrl,
      src: lqip,
      width,
      height,
    };
  },
};
