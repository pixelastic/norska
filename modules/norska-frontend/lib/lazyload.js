const lazySizes = require('lazysizes');

module.exports = {
  /**
   * Enable lazyloading of images when they enter the viewport
   **/
  init() {
    this.enableBackgroundImageLoading();
    lazySizes.init();
  },
  /**
   * Set the data-bg attribute to the background image when elements enter
   * viewport
   **/
  enableBackgroundImageLoading() {
    document.addEventListener('lazybeforeunveil', function(event) {
      const element = event.target;
      const background = element.getAttribute('data-bg');
      if (!background) {
        return;
      }
      element.style.backgroundImage = `url(${background})`;
    });
  },
  /**
   * Computes the data-bg and style attributes for lazyloading a background
   * image
   *
   * @param {string} url Path to the image
   * @param {object} userOptions
   * - disable: Force loading if set to true
   * @returns {object} Attribute object, with .style and .dataBg keys
   */
  background(url, userOptions = {}) {
    const options = {
      disable: false,
      ...userOptions,
    };
    const style = options.disable ? `background-image:url(${url})` : null;
    const dataBg = options.disable ? null : url;
    return { style, dataBg };
  },
};
