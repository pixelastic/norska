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
};
