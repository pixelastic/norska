import module from '../form';
import firost from 'firost';
import { _ } from 'golgoth';
const objectWith = expect.objectContaining;

describe('helpers/form', () => {
  const tmpDirectory = './tmp/norska-cms/helper/form';
  describe('getFields', () => {
    beforeEach(async () => {
      await firost.emptyDir(tmpDirectory);
    });
    it('should set value from data to each field schema', async () => {
      const data = { title: 'foo' };

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.getFields(filepath);

      expect(actual[0]).toHaveProperty('name', 'title');
      expect(actual[0]).toHaveProperty('value', 'foo');
    });
    it('should delegate to getListField if schema is a list', async () => {
      jest.spyOn(module, 'getFileSchema').mockReturnValue({ type: 'list' });
      jest.spyOn(module, 'getListFields').mockReturnValue('list field');
      const data = [{ name: 'foo' }];

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.getFields(filepath);

      expect(module.getListFields).toHaveBeenCalledWith(data, { type: 'list' });
      expect(actual).toEqual('list field');
    });
  });
  describe('getListFields', () => {
    it('should return an array', () => {
      const data = [{ title: 'alpha', isAwesome: false }];
      const schema = {
        type: 'list',
        items: [{ fields: [{ name: 'foo' }, { name: 'isAwesome' }] }],
      };

      const actual = module.getListFields(data, schema);

      expect(_.isArray(actual)).toEqual(true);
    });
    it('should set value to each item field', () => {
      const data = [{ title: 'alpha', isAwesome: false }];
      const schema = {
        type: 'list',
        items: [{ fields: [{ name: 'title' }, { name: 'isAwesome' }] }],
      };

      const actual = module.getListFields(data, schema)[0];
      const item = actual.items[0];
      const fields = item.fields;

      expect(fields[0]).toEqual(objectWith({ name: 'title', value: 'alpha' }));
      expect(fields[1]).toEqual(
        objectWith({ name: 'isAwesome', value: false })
      );
    });
    it('should set a displayName to each field based on the top-level displayKey', () => {
      const data = [{ title: 'alpha', isAwesome: false }];
      const schema = {
        type: 'list',
        displayKey: 'title',
        items: [{ fields: [{ name: 'title' }, { name: 'isAwesome' }] }],
      };

      const actual = module.getListFields(data, schema)[0];
      const item = actual.items[0];

      expect(item).toHaveProperty('displayName', 'Alpha');
    });
  });
  describe('getFileSchema', () => {
    beforeEach(async () => {
      await firost.emptyDir(tmpDirectory);
    });
    it('should return the guessed version if no schema on disk', async () => {
      jest.spyOn(module, 'guessFileSchema').mockReturnValue('guessed schema');
      const data = { name: 'foo' };

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.getFileSchema(filepath);

      expect(actual).toEqual('guessed schema');
    });
    it('keys from schema on disk should have precedence over keys guessed', async () => {
      const data = { name: 'foo' };
      const schema = [{ name: 'name', type: 'textarea' }];

      const filepath = `${tmpDirectory}/foo.json`;
      const schemaFilepath = `${tmpDirectory}/foo.schema.json`;
      await firost.writeJson(data, filepath);
      await firost.writeJson(schema, schemaFilepath);
      const actual = await module.getFileSchema(filepath);

      expect(actual[0]).toHaveProperty('type', 'textarea');
    });
    it('guessed keys should be set if no such key in disk schema', async () => {
      const data = { name: 'foo' };
      const schema = [{ name: 'name', type: 'textarea' }];

      const filepath = `${tmpDirectory}/foo.json`;
      const schemaFilepath = `${tmpDirectory}/foo.schema.json`;
      await firost.writeJson(data, filepath);
      await firost.writeJson(schema, schemaFilepath);
      const actual = await module.getFileSchema(filepath);

      expect(actual[0]).toHaveProperty('displayName', 'Name');
    });
    it('fields should be ordered as in disk schema', async () => {
      const data = { baz: true, foo: true, bar: false };
      const schema = [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }];

      const filepath = `${tmpDirectory}/foo.json`;
      const schemaFilepath = `${tmpDirectory}/foo.schema.json`;
      await firost.writeJson(data, filepath);
      await firost.writeJson(schema, schemaFilepath);
      const actual = await module.getFileSchema(filepath);

      expect(actual[0].name).toEqual('foo');
      expect(actual[1].name).toEqual('bar');
      expect(actual[2].name).toEqual('baz');
    });
    it('extraneous guessed fields should be added after disk fields', async () => {
      const data = { baz: true, foo: true, bar: false };
      const schema = [{ name: 'foo' }];

      const filepath = `${tmpDirectory}/foo.json`;
      const schemaFilepath = `${tmpDirectory}/foo.schema.json`;
      await firost.writeJson(data, filepath);
      await firost.writeJson(schema, schemaFilepath);
      const actual = await module.getFileSchema(filepath);

      expect(actual[0].name).toEqual('foo');
      expect(actual[1].name).toEqual('bar');
      expect(actual[2].name).toEqual('baz');
    });
    it('should delegate to getListFileSchema if schema is a list', async () => {
      jest.spyOn(module, 'getListFileSchema').mockReturnValue('list schema');
      jest.spyOn(module, 'guessFileSchema').mockReturnValue('guessed schema');
      const data = [{ name: 'foo' }];
      const schema = { type: 'list' };

      const filepath = `${tmpDirectory}/foo.json`;
      const schemaFilepath = `${tmpDirectory}/foo.schema.json`;
      await firost.writeJson(data, filepath);
      await firost.writeJson(schema, schemaFilepath);
      const actual = await module.getFileSchema(filepath);

      expect(module.getListFileSchema).toHaveBeenCalledWith(
        schema,
        'guessed schema'
      );
      expect(actual).toEqual('list schema');
    });
  });
  describe('getListFileSchema', () => {
    it('should use the guessed items if none defined in the file schema', async () => {
      const readSchema = { type: 'list' };
      const guessedSchema = { items: [{ fields: [] }] };

      const actual = module.getListFileSchema(readSchema, guessedSchema);

      expect(actual).toHaveProperty('type', 'list');
      expect(actual).toHaveProperty('items', guessedSchema.items);
    });
    it('should include top-level keys from the read schema', async () => {
      const readSchema = { type: 'list', customProperty: 'foo' };
      const guessedSchema = { items: [{ fields: [] }] };

      const actual = module.getListFileSchema(readSchema, guessedSchema);

      expect(actual).toHaveProperty('customProperty', 'foo');
    });
    it('should merge each item field schema with those defined in the top-level itemSchema', async () => {
      const readSchema = {
        type: 'list',
        itemSchema: [{ name: 'foo', type: 'boolean' }],
      };
      const guessedSchema = {
        items: [{ fields: [{ name: 'foo', type: 'text' }] }],
      };

      const actual = module.getListFileSchema(readSchema, guessedSchema);
      const item = actual.items[0];
      const field = item.fields[0];

      expect(field).toHaveProperty('type', 'boolean');
    });
    it('should set the item fields in the order defined in the top-level itemSchema', async () => {
      const readSchema = {
        type: 'list',
        itemSchema: [{ name: 'bar' }, { name: 'foo' }, { name: 'baz' }],
      };
      const guessedSchema = {
        items: [
          { fields: [{ name: 'foo' }, { name: 'baz' }, { name: 'bar' }] },
        ],
      };

      const actual = module.getListFileSchema(readSchema, guessedSchema);
      const item = actual.items[0];

      expect(item.fields[0]).toHaveProperty('name', 'bar');
      expect(item.fields[1]).toHaveProperty('name', 'foo');
      expect(item.fields[2]).toHaveProperty('name', 'baz');
    });
    it('should add guessed fields not part of the top-level itemSchema at the end', async () => {
      const readSchema = {
        type: 'list',
        itemSchema: [{ name: 'bar' }, { name: 'foo' }],
      };
      const guessedSchema = {
        items: [
          { fields: [{ name: 'foo' }, { name: 'baz' }, { name: 'bar' }] },
        ],
      };

      const actual = module.getListFileSchema(readSchema, guessedSchema);
      const item = actual.items[0];

      expect(item.fields[0]).toHaveProperty('name', 'bar');
      expect(item.fields[1]).toHaveProperty('name', 'foo');
      expect(item.fields[2]).toHaveProperty('name', 'baz');
    });
  });
  describe('guessFileSchema', () => {
    beforeEach(async () => {
      await firost.emptyDir(tmpDirectory);
    });
    it('should aggregate guessFieldSchema on each field', async () => {
      const data = { foo: 'bar', isAwesome: true };

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.guessFileSchema(filepath);

      expect(actual[0]).toEqual(objectWith({ name: 'foo', type: 'text' }));
      expect(actual[1]).toEqual(
        objectWith({ name: 'isAwesome', type: 'boolean' })
      );
    });
    it('should delegate to guessListFileSchema if data is an array', async () => {
      const data = ['foo'];
      jest.spyOn(module, 'guessListFileSchema').mockReturnValue('bar');

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.guessFileSchema(filepath);

      expect(actual).toEqual('bar');
      expect(module.guessListFileSchema).toHaveBeenCalledWith(['foo']);
    });
  });
  describe('guessListFileSchema', () => {
    beforeEach(async () => {
      await firost.emptyDir(tmpDirectory);
    });
    it('should return a list type', async () => {
      const data = [];

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.guessFileSchema(filepath);

      expect(actual).toHaveProperty('type', 'list');
    });
    it('should set an array of objects for items', async () => {
      const data = [{ name: 'foo', isAwesome: true }];

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.guessFileSchema(filepath);

      expect(_.isArray(actual.items)).toEqual(true);
      expect(_.isPlainObject(actual.items[0])).toEqual(true);
    });
    it('each item should have a .field key as an array of objects', async () => {
      const data = [{ name: 'foo', isAwesome: true }];

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.guessFileSchema(filepath);
      const items = actual.items;

      expect(_.isArray(items)).toEqual(true);
      expect(_.isPlainObject(items[0])).toEqual(true);
    });
    it('should aggregate guessFieldSchema on each field of each item', async () => {
      const data = [{ name: 'foo', isAwesome: true }];

      const filepath = `${tmpDirectory}/foo.json`;
      await firost.writeJson(data, filepath);
      const actual = await module.guessFileSchema(filepath);
      const fields = actual.items[0].fields;

      expect(fields).toContainEqual(objectWith({ name: 'name' }));
      expect(fields).toContainEqual(objectWith({ name: 'isAwesome' }));
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
    it('should guess the displayName', () => {
      jest.spyOn(module, 'guessDisplayName').mockReturnValue('bar');
      const actual = module.guessFieldSchema('name', 'foo');
      const expected = objectWith({ displayName: 'bar' });
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
