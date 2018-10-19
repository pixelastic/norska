import pify from 'pify';
import cpx from 'cpx';
import config from './config';
const copy = pify(cpx.copy);

export default {
  // Get the glob pattern to match all files we need to copy
  glob() {
    const source = config.get('from');
    const extensions = config.get('assets.extensions').join(',');
    return `${source}/**/*.{${extensions}}`;
  },
  // Copy all assets to destination
  async run() {
    const destination = config.get('to');
    const pattern = this.glob();
    return await copy(pattern, destination);
  },
  // Watch for asset change and copy them to destination
  watch() {
    const destination = config.get('to');
    const pattern = this.glob();
    cpx.watch(pattern, destination);
  },
};
