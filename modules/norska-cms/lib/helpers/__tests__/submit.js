import module from '../submit';
import path from 'path';
import cms from '../../index.js';
import firost from 'firost';
import config from 'norska-config';

describe('helpers/submit', () => {
  const tmpPath = './tmp/norska-cms/helper/submit';
  const srcPath = path.resolve(tmpPath, 'src');
  const uploadTmpPath = path.resolve(tmpPath, 'tmp');
  const uploadPathRelative = 'uploads';
  const uploadPath = path.resolve(srcPath, uploadPathRelative);
  beforeEach(async () => {
    jest.spyOn(cms, 'uploadTmpPath').mockReturnValue(uploadTmpPath);
    jest.spyOn(cms, 'uploadPath').mockReturnValue(uploadPath);
    jest.spyOn(config, 'from').mockReturnValue(srcPath);
    await firost.emptyDir(tmpPath);
  });
  describe('getDataFromRequest', () => {
    describe('simple form', () => {
      it('should get the form body as-is', async () => {
        const input = {
          body: {
            foo: 'bar',
          },
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual).toHaveProperty('foo', 'bar');
      });
    });
    describe('upload', () => {
      it('should keep the original value if no upload set', async () => {
        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
            'screenshot.previousValue': 'foo',
          },
          files: [],
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', 'foo');
      });
      it('should return the upload path with extension if upload given', async () => {
        await firost.write('foo', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual.screenshot).toMatch(/uuid.png$/);
      });
      it('should return the upload path in the uploads/ directory by defaul', async () => {
        await firost.write('foo', `${uploadTmpPath}/uuid`);
        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual.screenshot).toMatch(
          new RegExp(`^${uploadPathRelative}/`)
        );
      });
      it('should save the uploaded file to the uploads/ folder', async () => {
        await firost.write('foo', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const data = await module.getDataFromRequest(input);

        const actual = await firost.read(config.fromPath(data.screenshot));

        expect(actual).toEqual('foo');
      });
      it('should delete the previous file if new upload given', async () => {
        await firost.write('previous file', `${uploadPath}/old.png`);
        await firost.write('foo', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
            'screenshot.previousValue': `${uploadPathRelative}/old.png`,
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        await module.getDataFromRequest(input);

        const actual = await firost.exist(`${uploadPath}/old.png`);

        expect(actual).toEqual(false);
      });
      it('should allow changing the upload directory to static value', async () => {
        await firost.write('foo', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
            'screenshot.uploadDirectory': 'assets',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', 'assets/uuid.png');
      });
      it('should allow changing the upload name to static value', async () => {
        await firost.write('foo', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
            'screenshot.uploadBasename': 'foo',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual).toHaveProperty(
          'screenshot',
          `${uploadPathRelative}/foo.png`
        );
      });
      it('should allow changing the upload directory to dynamic value', async () => {
        await firost.write('foo', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            title: 'Foo Bar',
            'screenshot.uploadKey': 'screenshot',
            'screenshot.uploadDirectory': 'assets/{title}',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', 'assets/fooBar/uuid.png');
      });
      it('should allow changing the upload name to dynamic value', async () => {
        await firost.write('foo', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            title: 'Foo Bar',
            'screenshot.uploadKey': 'screenshot',
            'screenshot.uploadBasename': '{title}',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual).toHaveProperty(
          'screenshot',
          `${uploadPathRelative}/fooBar.png`
        );
      });
    });
    describe('multiple items', () => {
      it('should zip list of items together', async () => {
        const input = {
          body: {
            __isList: '1',
            name: ['foo', 'bar'],
            description: ['foooooooo', 'baaaaaar'],
          },
        };

        const actual = await module.getDataFromRequest(input);

        expect(actual[0]).toEqual({ name: 'foo', description: 'foooooooo' });
        expect(actual[1]).toEqual({ name: 'bar', description: 'baaaaaar' });
      });
      describe('with upload', () => {
        it('should upload all files', async () => {
          await firost.write('foo', `${uploadTmpPath}/uuid1`);
          await firost.write('bar', `${uploadTmpPath}/uuid2`);

          const input = {
            body: {
              __isList: '1',
              name: ['foo', 'bar'],
              'screenshot[0].uploadKey': 'screenshot[0]',
              'screenshot[1].uploadKey': 'screenshot[1]',
            },
            files: [
              {
                fieldname: 'screenshot[0]',
                originalname: 'one.png',
                path: `${uploadTmpPath}/uuid1`,
              },
              {
                fieldname: 'screenshot[1]',
                originalname: 'two.png',
                path: `${uploadTmpPath}/uuid2`,
              },
            ],
          };

          const data = await module.getDataFromRequest(input);

          const uploadOne = await firost.read(
            config.fromPath(data[0].screenshot)
          );
          const uploadTwo = await firost.read(
            config.fromPath(data[1].screenshot)
          );

          expect(uploadOne).toEqual('foo');
          expect(uploadTwo).toEqual('bar');
        });
      });
    });
  });
});
