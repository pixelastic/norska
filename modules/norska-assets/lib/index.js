import { pify } from 'golgoth';
import cpx from 'cpx';
import config from 'norska-config';
const copy = pify(cpx.copy);

export default {
  /**
   * Default configuration object
   **/
  defaultConfig() {
    return {
      files: '**/*.{eot,gif,html,ico,jpg,otf,png,svg,ttf,woff}',
    };
  },
  /**
   * Copy static assets from source to destination, keeping same directory
   * structure but not performing any transformation
   * @returns {Void}
   **/
  async run() {
    const pattern = config.fromPath(config.get('assets.files'));
    return await copy(pattern, config.to());
  },
  /**
   * Listen for any changes in assets and copy them to destination
   * @returns {Void}
   **/
  watch() {
    const pattern = config.fromPath(config.get('assets.files'));
    cpx.watch(pattern, config.to());
  },
};
