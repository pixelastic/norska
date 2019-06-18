import module from '../index';

describe('norska-config', () => {
  describe('defaultConfig', () => {
    it('should set the default port', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('port');
    });
    it('should set the default source folder', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('from', './src');
    });
    it('should set the default destination folder', () => {
      const actual = module.defaultConfig();

      expect(actual).toHaveProperty('to', './dist');
    });
  });
});
