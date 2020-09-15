const norskaCms = require('../lib/main.js');

(async function () {
  try {
    await norskaCms.generateCssFile();
    console.info('CSS file regenerated');
  } catch (err) {
    console.info(err.reason);
    process.exit(1);
  }
})();
