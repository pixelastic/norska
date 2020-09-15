const current = require('../main');

describe('norska-helper', () => {
  describe('isProduction', () => {
    it('should return true if current env is prod', () => {
      jest.spyOn(current, 'currentEnvironment').mockReturnValue('prod');

      const actual = current.isProduction();

      expect(actual).toEqual(true);
    });
    it('should return true if current env is production', () => {
      jest.spyOn(current, 'currentEnvironment').mockReturnValue('production');

      const actual = current.isProduction();

      expect(actual).toEqual(true);
    });
    it('should return false otherwise', () => {
      jest.spyOn(current, 'currentEnvironment').mockReturnValue('dev');

      const actual = current.isProduction();

      expect(actual).toEqual(false);
    });
  });
});
