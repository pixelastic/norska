import module from '../index';

describe('norska-helper', () => {
  describe('isProduction', () => {
    it('should return true if current env is prod', () => {
      jest.spyOn(module, 'currentEnvironment').mockReturnValue('prod');

      const actual = module.isProduction();

      expect(actual).toEqual(true);
    });
    it('should return true if current env is production', () => {
      jest.spyOn(module, 'currentEnvironment').mockReturnValue('production');

      const actual = module.isProduction();

      expect(actual).toEqual(true);
    });
    it('should return false otherwise', () => {
      jest.spyOn(module, 'currentEnvironment').mockReturnValue('dev');

      const actual = module.isProduction();

      expect(actual).toEqual(false);
    });
  });
});
