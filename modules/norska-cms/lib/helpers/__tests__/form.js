import module from '../form';
import firost from 'firost';
import { _ } from 'golgoth';
const objectWith = expect.objectContaining;

describe('helpers/form', () => {
  const tmpDirectory = './tmp/norska-cms/helper/form';
  describe('getFields', () => {
    it('should set value from data to each field schema', async () => {
      const data = { title: 'foo' };

      const schema = module.guessSchema(data);
      const actual = module.getFields(data, schema);

      expect(actual).toContainEqual(
        objectWith({ name: 'title', value: 'foo' })
      );
    });
    describe('with list', () => {
      it('should return an array', () => {
        const data = [{ title: 'alpha', isAwesome: false }];

        const schema = module.guessSchema(data);
        const actual = module.getFields(data, schema);

        expect(_.isArray(actual)).toEqual(true);
      });
      it('first element should be a list', () => {
        const data = [{ title: 'alpha', isAwesome: false }];

        const schema = module.guessSchema(data);
        const actual = module.getFields(data, schema);

        expect(actual[0]).toHaveProperty('type', 'list');
      });
      it('should set value to each item field', () => {
        const data = [{ title: 'alpha', isAwesome: false }];

        const schema = module.guessSchema(data);
        const actual = module.getFields(data, schema);
        const item = actual[0].items[0];
        const fields = item.fields;

        expect(fields).toContainEqual(objectWith({ value: 'alpha' }));
        expect(fields).toContainEqual(objectWith({ value: false }));
      });
      it('should set a displayName to each field based on the top-level displayKey', () => {
        const data = [{ title: 'alpha', isAwesome: false }];
        const schema = {
          ...module.guessSchema(data),
          displayKey: 'title',
        };

        const actual = module.getFields(data, schema);
        const item = actual[0].items[0];

        expect(item).toHaveProperty('displayName', 'Alpha');
      });
      it('should set each value as an array', () => {
        const data = [
          { title: 'alpha', isAwesome: false },
          { title: 'beta', isAwesome: true },
        ];

        const schema = module.guessSchema(data);
        const actual = module.getFields(data, schema);
        const firstItem = actual[0].items[0];
        const secondItem = actual[0].items[1];

        expect(firstItem.fields).toContainEqual(
          objectWith({ name: 'title[0]' })
        );
        expect(firstItem.fields).toContainEqual(
          objectWith({ name: 'isAwesome[0]' })
        );
        expect(secondItem.fields).toContainEqual(
          objectWith({ name: 'title[1]' })
        );
        expect(secondItem.fields).toContainEqual(
          objectWith({ name: 'isAwesome[1]' })
        );
      });
    });
  });
  describe('reconcileFileSchema', () => {
    it('should return the guessed version if no schema on disk', async () => {
      const readFileSchema = false;
      const guessedFileSchema = 'guessed schema';

      const actual = module.reconcileFileSchema(
        readFileSchema,
        guessedFileSchema
      );

      expect(actual).toEqual('guessed schema');
    });
    it('keys from schema on disk should have precedence over keys guessed', async () => {
      const readFileSchema = [{ name: 'name', type: 'textarea' }];
      const data = { name: 'foo' };

      const guessedFileSchema = module.guessSchema(data);
      const actual = module.reconcileFileSchema(
        readFileSchema,
        guessedFileSchema
      );

      expect(actual[0]).toHaveProperty('type', 'textarea');
    });
    it('guessed keys should be set if no such key in disk schema', async () => {
      const readFileSchema = [{ name: 'name', type: 'textarea' }];
      const data = { name: 'foo' };

      const guessedFileSchema = module.guessSchema(data);
      const actual = module.reconcileFileSchema(
        readFileSchema,
        guessedFileSchema
      );

      expect(actual[0]).toHaveProperty('displayName', 'Name');
    });
    it('fields should be ordered as in disk schema', async () => {
      const readFileSchema = [
        { name: 'foo' },
        { name: 'bar' },
        { name: 'baz' },
      ];
      const data = { baz: true, foo: true, bar: false };
      const guessedFileSchema = module.guessSchema(data);

      const actual = module.reconcileFileSchema(
        readFileSchema,
        guessedFileSchema
      );

      expect(actual[0].name).toEqual('foo');
      expect(actual[1].name).toEqual('bar');
      expect(actual[2].name).toEqual('baz');
    });
    it('extraneous guessed fields should be added after disk fields', async () => {
      const data = { baz: true, foo: true, bar: false };
      const readFileSchema = [{ name: 'foo' }];

      const guessedFileSchema = module.guessSchema(data);
      const actual = module.reconcileFileSchema(
        readFileSchema,
        guessedFileSchema
      );

      expect(actual[0].name).toEqual('foo');
      expect(actual).toContainEqual(objectWith({ name: 'bar' }));
      expect(actual).toContainEqual(objectWith({ name: 'baz' }));
    });
    describe('displayName', () => {
      it('should be set on fields in schema', () => {
        const data = { title: 'foo' };
        const readFileSchema = [{ name: 'title' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );

        expect(actual).toContainEqual(
          objectWith({ name: 'title', displayName: 'Title' })
        );
      });
      it('should not be set if one is defined in schema', () => {
        const data = { title: 'foo' };
        const readFileSchema = [{ name: 'title', displayName: 'Custom' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );

        expect(actual).toContainEqual(
          objectWith({ name: 'title', displayName: 'Custom' })
        );
      });
      it('should be set on additional fields not in schema', () => {
        const data = { description: 'foo' };
        const readFileSchema = [{ name: 'title' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );

        expect(actual).toContainEqual(
          objectWith({ name: 'description', displayName: 'Description' })
        );
      });
      it('should be set on fields defined in schema but not in data', () => {
        const data = { description: 'foo' };
        const readFileSchema = [{ name: 'title' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );

        expect(actual).toContainEqual(
          objectWith({ name: 'title', displayName: 'Title' })
        );
      });
    });
    describe('with a list', () => {
      it('should use the guessed items if none defined in the file schema', async () => {
        const readFileSchema = { type: 'list' };
        const data = [{ title: 'foo' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );
        const items = actual.items;

        expect(items[0].fields).toContainEqual(objectWith({ name: 'title' }));
      });
      it('should include top-level keys from the read schema', async () => {
        const readFileSchema = { type: 'list', customProperty: 'foo' };
        const data = [{ title: 'foo' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );

        expect(actual).toHaveProperty('customProperty', 'foo');
      });
      it('should merge each item field schema with those defined in the top-level itemSchema', async () => {
        const readFileSchema = {
          type: 'list',
          itemSchema: [{ name: 'title', type: 'boolean' }],
        };
        const data = [{ title: 'foo' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );
        const items = actual.items;

        expect(items[0].fields).toContainEqual(
          objectWith({ name: 'title', type: 'boolean' })
        );
      });
      it('should set the item fields in the order defined in the top-level itemSchema', async () => {
        const readFileSchema = {
          type: 'list',
          itemSchema: [
            { name: 'title' },
            { name: 'url' },
            { name: 'description' },
          ],
        };
        const data = [{ description: 'foo', url: 'foo', title: 'foo' }];

        const guessedFileSchema = module.guessSchema(data);
        const actual = module.reconcileFileSchema(
          readFileSchema,
          guessedFileSchema
        );
        const item = actual.items[0];

        expect(item.fields[0]).toHaveProperty('name', 'title');
        expect(item.fields[1]).toHaveProperty('name', 'url');
        expect(item.fields[2]).toHaveProperty('name', 'description');
      });
    });
  });
  describe('guessSchema', () => {
    it('should aggregate guessFieldSchema on each field', async () => {
      const data = { foo: 'bar', isAwesome: true };

      const actual = module.guessSchema(data);

      expect(actual[0]).toEqual(objectWith({ name: 'foo', type: 'text' }));
      expect(actual[1]).toEqual(
        objectWith({ name: 'isAwesome', type: 'boolean' })
      );
    });
    describe('with a list', () => {
      it('should return a list type', async () => {
        const data = [];

        const actual = module.guessSchema(data);

        expect(actual).toHaveProperty('type', 'list');
      });
      it('should set an array of objects for items', async () => {
        const data = [{ name: 'foo', isAwesome: true }];

        const actual = module.guessSchema(data);

        expect(_.isArray(actual.items)).toEqual(true);
        expect(_.isPlainObject(actual.items[0])).toEqual(true);
      });
      it('each item should have a .field key as an array of objects', async () => {
        const data = [{ name: 'foo', isAwesome: true }];

        const actual = module.guessSchema(data);
        const items = actual.items;

        expect(_.isArray(items)).toEqual(true);
        expect(_.isPlainObject(items[0])).toEqual(true);
      });
      it('should aggregate guessFieldSchema on each field of each item', async () => {
        const data = [{ name: 'foo', isAwesome: true }];

        const actual = module.guessSchema(data);
        const fields = actual.items[0].fields;

        expect(fields).toContainEqual(objectWith({ name: 'name' }));
        expect(fields).toContainEqual(objectWith({ name: 'isAwesome' }));
      });
    });
  });
  describe('readFileSchema', () => {
    beforeEach(async () => {
      await firost.emptyDir(tmpDirectory);
    });
    it('should return false if no schema exist for the file', async () => {
      const actual = await module.readFileSchema('nope');
      expect(actual).toEqual(false);
    });
    it('should return the schema if found', async () => {
      await firost.writeJson({ foo: 'bar' }, `${tmpDirectory}/foo.schema.json`);
      const actual = await module.readFileSchema(`${tmpDirectory}/foo.json`);
      expect(actual).toEqual({ foo: 'bar' });
    });
  });

  describe('guessFieldSchema', () => {
    it('should include the specified name', () => {
      const actual = module.guessFieldSchema('name', 'foo');
      const expected = objectWith({ name: 'name' });
      expect(actual).toEqual(expected);
    });
    it('should guess the type', () => {
      jest.spyOn(module, 'guessFieldType').mockReturnValue('baz');
      const actual = module.guessFieldSchema('name', 'foo');
      const expected = objectWith({ type: 'baz' });
      expect(actual).toEqual(expected);
    });
  });
  describe('guessDisplayName', () => {
    it('should return a capitalized version of the name', () => {
      const actual = module.guessDisplayName('foo');
      expect(actual).toEqual('Foo');
    });
    it('should remove any trailing []', () => {
      const actual = module.guessDisplayName('foo[]');
      expect(actual).toEqual('Foo');
    });
    it('should separate words of camelcase', () => {
      const actual = module.guessDisplayName('bestMovies');
      expect(actual).toEqual('Best movies');
    });
    it('should add question mark to isXXX', () => {
      const actual = module.guessDisplayName('isAwesome');
      expect(actual).toEqual('Is awesome?');
    });
    it('should add question mark to hasXXX', () => {
      const actual = module.guessDisplayName('hasAwesomeness');
      expect(actual).toEqual('Has awesomeness?');
    });
  });
  describe('guessFieldType', () => {
    it('should return textarea if has long text', () => {
      const actual = module.guessFieldType(
        'foo',
        'This is a very long text that should ideally trigger a textarea because it is over the threshold'
      );

      expect(actual).toEqual('textarea');
    });
    it('should return list if an array', () => {
      const actual = module.guessFieldType('foo', ['bar', 'baz']);

      expect(actual).toEqual('list');
    });
    it('should return boolean for false', () => {
      const actual = module.guessFieldType('isAwesome', false);

      expect(actual).toEqual('boolean');
    });
    it('should return boolean for true', () => {
      const actual = module.guessFieldType('isAwesome', true);

      expect(actual).toEqual('boolean');
    });
    it('should return text by default', () => {
      const actual = module.guessFieldType();

      expect(actual).toEqual('text');
    });
  });
});
