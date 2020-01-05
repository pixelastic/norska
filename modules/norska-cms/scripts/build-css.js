import norskaCms from '../lib/index.js';

(async function() {
  try {
    await norskaCms.generateCssFile();
    console.info('CSS file regenerated');
  } catch (err) {
    console.info(err.reason);
    process.exit(1);
  }
})();
