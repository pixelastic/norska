import { pify } from 'golgoth';
import cpx from 'cpx';
import config from 'norska-config';
const copy = pify(cpx.copy);

export default {
  // Custom config added to the main config.assets key
  config() {
    return {
      extensions: [
        // Images
        'gif',
        'ico',
        'jpg',
        'png',
        'svg',
        // Fonts
        'eot',
        'otf',
        'ttf',
        'woff',
        // Other
        'html',
      ],
    };
  },
  // Get the glob pattern to match all files we need to copy
  glob() {
    const extensions = config.get('assets.extensions').join(',');
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
