import module from '../index';
import { chalk } from 'golgoth';

describe('norska-helper', () => {
  describe('consoleWarn', () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockReturnValue();
      jest.spyOn(chalk, 'yellow').mockReturnValue();
    });
    it('should be prefixed with yellow ⚠', () => {
      chalk.yellow.mockReturnValue('yellow ⚠');
      module.consoleWarn('foo');

      expect(console.info).toHaveBeenCalledWith('yellow ⚠', 'foo');
    });
  });
  describe('consoleSuccess', () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockReturnValue();
      jest.spyOn(chalk, 'green').mockReturnValue();
    });
    it('should be prefixed with green ✔', () => {
      chalk.green.mockReturnValue('green ✔');
      module.consoleSuccess('foo');

      expect(console.info).toHaveBeenCalledWith('green ✔', 'foo');
    });
  });
  describe('consoleError', () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockReturnValue();
      jest.spyOn(chalk, 'red').mockReturnValue();
    });
    it('should be prefixed with red ✘', () => {
      chalk.red.mockReturnValue('red ✘');
      module.consoleError('foo');

      expect(console.info).toHaveBeenCalledWith('red ✘', 'foo');
    });
  });
});
