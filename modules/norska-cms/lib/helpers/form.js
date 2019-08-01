import { _ } from 'golgoth';
import firost from 'firost';
export default {
  async getFields(filepath) {
    const data = await firost.readJson(filepath);
    const fileSchema = await this.getFileSchema(filepath);

    // Merge list schema with data
    if (_.get(fileSchema, 'type') === 'list') {
      const fields = fileSchema;
      fields.items = _.map(fields.items, (item, itemIndex) => {
        // A specific schema is defined, we need to use it as a base
        if (fileSchema.itemSchema) {
          return _.map(fileSchema.itemSchema, fieldSchema => {
            const fieldName = fieldSchema.name;
            const guessedField = _.find(item, { name: fieldName });
            return {
              ...guessedField,
              ...fieldSchema,
              value: data[itemIndex][fieldName],
              name: `${fieldSchema.name}[]`,
            };
          });
        }

        return _.map(item, fieldSchema => {
          return {
            ...fieldSchema,
            value: data[itemIndex][fieldSchema.name],
          };
        });
      });
      return [fields];
    }

    // Merge object schema with data
    return _.map(fileSchema, fieldSchema => {
      return {
        ...fieldSchema,
        value: data[fieldSchema.name],
      };
    });
  },
  async getFileSchema(filepath) {
    const readFileSchema = await this.readFileSchema(filepath);
    const guessedFileSchema = await this.guessFileSchema(filepath);
    if (!readFileSchema) {
      return guessedFileSchema;
    }
    return _.merge(readFileSchema, guessedFileSchema);
  },
  async readFileSchema(filepath) {
    const schemaPath = _.replace(filepath, /\.json$/, '.schema.json');
    if (!(await firost.isFile(schemaPath))) {
      return false;
    }
    return await firost.readJson(schemaPath);
  },
  async guessFileSchema(filepath) {
    const data = await firost.readJson(filepath);
    if (_.isArray(data)) {
      const items = _.map(data, item => {
        return _.map(item, (value, key) => {
          return this.guessFieldSchema(key, value);
        });
      });
      return {
        type: 'list',
        items,
      };
    }
    return _.map(data, (value, key) => {
      return this.guessFieldSchema(key, value);
    });
  },
  guessDisplayName(name) {
    return _.chain(name)
      .split('.')
      .last()
      .replace(/\[\]/g, '')
      .capitalize()
      .value();
  },
  guessFieldSchema(name, value) {
    const type = this.guessFieldType(name, value);
    return {
      name,
      displayName: this.guessDisplayName(name),
      type,
    };
  },
  guessFieldType(name, value) {
    if (value.length > 80) {
      return 'textarea';
    }
    if (_.isArray(value)) {
      return 'list';
    }
    return 'text';
  },
};
