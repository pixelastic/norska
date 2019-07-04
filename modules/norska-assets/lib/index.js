import { pify } from 'golgoth';
import cpx from 'cpx';
import config from 'norska-config';
const copy = pify(cpx.copy);

export default {
  /**
   * Default configuration object
   * @returns {object} Default module config
   **/
  defaultConfig() {
    return {
      files: '**/*.{eot,gif,html,ico,jpg,otf,png,svg,ttf,txt,woff}',
    };
  },
  /**
   * Copy static assets from source to destination, keeping same directory
   * structure but not performing any transformation
   **/
  async run() {
    const pattern = config.fromPath(config.get('assets.files'));
    await copy(pattern, config.to());
  },
  /**
   * Listen for any changes in assets and copy them to destination
   **/
  watch() {
    const pattern = config.fromPath(config.get('assets.files'));
    cpx.watch(pattern, config.to());
  },
};
