import pify from 'pify';
import cpx from 'cpx';
import config from './config';
const copy = pify(cpx.copy);

export default {
  // Get the glob pattern to match all files we need to copy
  glob() {
    const extensions = config.get('assetsExtensions');
    return `${config.from()}/**/*.{${extensions}}`;
  },
  // Copy all assets to destination
  async run() {
    const pattern = this.glob();
    return await copy(pattern, config.to());
  },
  // Watch for asset change and copy them to destination
  watch() {
    const pattern = this.glob();
    cpx.watch(pattern, config.to());
  },
};
