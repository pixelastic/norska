import module from '../backgroundColor';

describe('backgroundColor', () => {
  it('should contain .bg-black as RGB', () => {
    expect(module).toHaveProperty(
      'black',
      'rgba(0, 0, 0, var(--background-opacity, 1))'
    );
  });
  it('should contain .bg-transparent', () => {
    expect(module).toHaveProperty('transparent', 'transparent');
  });
});
