const current = require('../weserv');

describe('weserv', () => {
  it('should pass the url through image proxy', async () => {
    const input = 'http://www.example.com/foo.png';
    const actual = current(input);

    expect(actual).toStartWith('https://images.weserv.nl?url=');
  });
  it('should set af (compressPng) and il (progressive) by default', async () => {
    const input = 'http://www.example.com/foo.png';
    const actual = current(input);

    expect(actual).toEqual(
      'https://images.weserv.nl?url=http%3A%2F%2Fwww.example.com%2Ffoo.png&af&il'
    );
  });
  it('should encode query string', async () => {
    const input = 'http://www.example.com/foo.png?v=42';
    const actual = current(input);

    expect(actual).toEqual(
      'https://images.weserv.nl?url=http%3A%2F%2Fwww.example.com%2Ffoo.png%3Fv%3D42&af&il'
    );
  });
  it('should throw an error if url is not remote', async () => {
    const input = './foo.png';
    let actual;

    try {
      current(input);
    } catch (err) {
      actual = err;
    }

    expect(actual).toHaveProperty('code', 'IMAGE_PROXY_NOT_URL');
  });
  it('should not change the url if already proxyfied', async () => {
    const input =
      'https://images.weserv.nl?url=http%3A%2F%2Fwww.example.com%2Ffoo.png';
    const actual = current(input);

    expect(actual).toEqual(input);
  });
  describe('transforms', () => {
    it.each([
      // Object | String
      [{ width: 42 }, '&af&il&w=42'],
      [{ height: 42 }, '&af&h=42&il'],
      [{ quality: 42 }, '&af&il&q=42'],
      [{ blur: 42 }, '&af&blur=42&il'],
      [{ grayscale: true }, '&af&filt=greyscale&il'],
      [
        { grayscale: true, width: 90, height: 42 },
        '&af&filt=greyscale&h=42&il&w=90',
      ],
      [{ unknown: 42 }, '&af&il'],
    ])('%s => %s', async (options, params) => {
      const input = 'http://www.example.com/foo.png';
      const expected = `https://images.weserv.nl?url=http%3A%2F%2Fwww.example.com%2Ffoo.png${params}`;
      const actual = current(input, options);
      expect(actual).toEqual(expected);
    });
  });
});
