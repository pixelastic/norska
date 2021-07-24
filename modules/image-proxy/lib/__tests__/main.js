const current = require('../main');

describe('norska-image-proxy', () => {
  it('should call weserv by default', async () => {
    const input = 'http://www.example.com/foo.png';
    const actual = current(input);

    expect(actual).toStartWith('https://images.weserv.nl?url=');
  });
  it('should call cloudinary if a cloudinary key is set', async () => {
    const input = 'http://www.example.com/foo.png';
    const actual = current(input, { cloudinary: 'bucket-foo' });

    expect(actual).toStartWith(
      'https://res.cloudinary.com/bucket-foo/image/fetch/'
    );
  });
});
