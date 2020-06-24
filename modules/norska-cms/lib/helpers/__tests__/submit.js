const current = require('../submit');
const path = require('path');
const cms = require('../../main.js');
const config = require('norska-config');
const emptyDir = require('firost/lib/emptyDir');
const write = require('firost/lib/write');
const read = require('firost/lib/read');
const exist = require('firost/lib/exist');

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
    await emptyDir(tmpPath);
  });
  describe('getDataFromRequest', () => {
    describe('simple form', () => {
      it('should get the form body as-is', async () => {
        const input = {
          body: {
            foo: 'bar',
          },
        };

        const actual = await current.getDataFromRequest(input);

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

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', 'foo');
      });
      it('should return the upload path with extension if upload given', async () => {
        await write('foo', `${uploadTmpPath}/uuid`);

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

        const actual = await current.getDataFromRequest(input);

        expect(actual.screenshot).toMatch(/uuid.png$/);
      });
      it('should return the upload path in the uploads/ directory by defaul', async () => {
        await write('foo', `${uploadTmpPath}/uuid`);
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

        const actual = await current.getDataFromRequest(input);

        expect(actual.screenshot).toMatch(
          new RegExp(`^${uploadPathRelative}/`)
        );
      });
      it('should save the uploaded file to the uploads/ folder', async () => {
        await write('foo', `${uploadTmpPath}/uuid`);

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

        const data = await current.getDataFromRequest(input);

        const actual = await read(config.fromPath(data.screenshot));

        expect(actual).toEqual('foo');
      });
      it('should delete the previous file if new upload given', async () => {
        await write('previous file', `${uploadPath}/old.png`);
        await write('foo', `${uploadTmpPath}/uuid`);

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

        await current.getDataFromRequest(input);

        const actual = await exist(`${uploadPath}/old.png`);

        expect(actual).toEqual(false);
      });
      it('should allow changing the upload directory to static value', async () => {
        await write('foo', `${uploadTmpPath}/uuid`);

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

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', 'assets/uuid.png');
      });
      it('should allow changing the upload name to static value', async () => {
        await write('foo', `${uploadTmpPath}/uuid`);

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

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty(
          'screenshot',
          `${uploadPathRelative}/foo.png`
        );
      });
      it('should allow changing the upload directory to dynamic value', async () => {
        await write('foo', `${uploadTmpPath}/uuid`);

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

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', 'assets/fooBar/uuid.png');
      });
      it('should allow changing the upload name to dynamic value', async () => {
        await write('foo', `${uploadTmpPath}/uuid`);

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

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty(
          'screenshot',
          `${uploadPathRelative}/fooBar.png`
        );
      });
      it('should delete the previous file if .deletePreviousValue is set', async () => {
        await write('previous file', `${uploadPath}/old.png`);

        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
            'screenshot.previousValue': `${uploadPathRelative}/old.png`,
            'screenshot.deletePreviousValue': '',
          },
          files: [],
        };

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', null);
        expect(await exist(`${uploadPath}/old.png`)).toEqual(false);
      });
      it('should not upload a new file if .deletePreviousValue is set', async () => {
        await write('previous file', `${uploadPath}/old.png`);
        await write('new file', `${uploadTmpPath}/uuid`);

        const input = {
          body: {
            'screenshot.uploadKey': 'screenshot',
            'screenshot.previousValue': `${uploadPathRelative}/old.png`,
            'screenshot.deletePreviousValue': '',
          },
          files: [
            {
              fieldname: 'screenshot',
              originalname: 'something.png',
              path: `${uploadTmpPath}/uuid`,
            },
          ],
        };

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('screenshot', null);
        expect(await exist(`${uploadPath}/old.png`)).toEqual(false);
        expect(await exist(`${uploadPath}/uuid.png`)).toEqual(false);
      });
    });
    describe('checkboxes', () => {
      it('should set false to unchecked checkboxes', async () => {
        const input = {
          body: {
            'isOk.isCheckbox': '',
          },
        };

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('isOk', false);
      });
      it('should set true to checked checkboxes', async () => {
        const input = {
          body: {
            'isOk.isCheckbox': '',
            'isOk.isChecked': '',
          },
        };

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('isOk', true);
      });
      it('should set true to checked checkboxes no matter the value', async () => {
        const input = {
          body: {
            'isOk.isCheckbox': '',
            'isOk.isChecked': 'whatever',
          },
        };

        const actual = await current.getDataFromRequest(input);

        expect(actual).toHaveProperty('isOk', true);
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

        const actual = await current.getDataFromRequest(input);

        expect(actual[0]).toEqual({ name: 'foo', description: 'foooooooo' });
        expect(actual[1]).toEqual({ name: 'bar', description: 'baaaaaar' });
      });
      describe('with upload', () => {
        it('should upload all files', async () => {
          await write('foo', `${uploadTmpPath}/uuid1`);
          await write('bar', `${uploadTmpPath}/uuid2`);

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

          const data = await current.getDataFromRequest(input);

          const uploadOne = await read(config.fromPath(data[0].screenshot));
          const uploadTwo = await read(config.fromPath(data[1].screenshot));

          expect(uploadOne).toEqual('foo');
          expect(uploadTwo).toEqual('bar');
        });
      });
    });
  });
});
