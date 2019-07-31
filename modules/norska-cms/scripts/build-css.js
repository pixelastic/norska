const norskaCms = require('../build/index.js').default;

(async function() {
  await norskaCms.generateCssFile();
  console.info('CSS file regenerated');
})();
