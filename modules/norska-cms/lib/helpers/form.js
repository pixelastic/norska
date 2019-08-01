import { _ } from 'golgoth';
import firost from 'firost';
export default {
  /**
   * Returns a list of fields for a given data file
   * @param {string} filepath Path to the data file
   * @returns {object} Field list of the data file
   **/
  async getFields(filepath) {
    const data = await firost.readJson(filepath);
    const fileSchema = await this.getFileSchema(filepath);

    if (fileSchema.type === 'list') {
      return this.getListFields(data, fileSchema);
    }

    // Merge object schema with data
    return _.map(fileSchema, fieldSchema => {
      return {
        ...fieldSchema,
        value: data[fieldSchema.name],
      };
    });
  },
  /**
   * Merges a list of items with a list schema to create a list of fields
   * @param {Array} listData Array of items
   * @param {object} listSchema List schema of the items
   * @returns {object} Field list of all the items
   **/
  getListFields(listData, listSchema) {
    const schema = listSchema;
    schema.items = _.map(schema.items, (item, itemIndex) => {
      const itemData = listData[itemIndex];
      // Update each field by adding the value equal to the matching value in
      // data
      const fields = _.map(item.fields, field => {
        const fieldName = field.name;
        const fieldValue = itemData[fieldName];
        return {
          ...field,
          value: fieldValue,
        };
      });

      // Add a potential .displayName based on the top-level .displayKey
      let displayName = `Item ${itemIndex}`;
      if (schema.displayKey) {
        const rawDisplayName = itemData[schema.displayKey];
        displayName = this.guessDisplayName(rawDisplayName);
      }

      return {
        ...item,
        displayName,
        fields,
      };
    });
    return [schema];
  },
  /**
   * Return the file schema.
   * Will read a potential schema on disk and guess one from the data and return
   * a merged version of both
   * @param {string} filepath Path to the _data file
   * @returns {object} Full file schema
   **/
  async getFileSchema(filepath) {
    const readFileSchema = await this.readFileSchema(filepath);
    const guessedFileSchema = await this.guessFileSchema(filepath);
    if (!readFileSchema) {
      return guessedFileSchema;
    }
    // If schema is a list, merging with the guessed schema is different process
    if (readFileSchema.type === 'list') {
      return this.getListFileSchema(readFileSchema, guessedFileSchema);
    }

    // Merging the read file schema with the guessed one
    let fileSchema = _.transform(
      readFileSchema,
      (result, readFieldSchema) => {
        const fieldName = readFieldSchema.name;
        // We find the matching guessed field
        const guessedFieldSchema = _.find(guessedFileSchema, {
          name: fieldName,
        });
        // We merge both, the real schema taking precedence, but keeping guessed
        // values not defined
        const fieldSchema = {
          ...guessedFieldSchema,
          ...readFieldSchema,
        };
        result.push(fieldSchema);
      },
      []
    );

    // We might have guessed fields that are not part defined in the schema, so
    // we add it at the end
    _.each(guessedFileSchema, guessedFieldSchema => {
      const fieldName = guessedFieldSchema.name;
      // If we already have it, we skip
      if (_.find(fileSchema, { name: fieldName })) {
        return;
      }
      // Not in the list, we add it
      fileSchema.push(guessedFieldSchema);
    });

    return fileSchema;
  },
  /**
   * Merges a list file schema read from disk with the list file schema guessed
   * from the data. This will use the top-levek .itemSchema key on the disk
   * schema to order item fields and set default schema to each of them
   * @param {object} readFileSchema List file schema read from disk
   * @param {object} guessedFileSchema List file schema guessed from data
   * @returns {object} Final merged list file schema
   **/
  getListFileSchema(readFileSchema, guessedFileSchema) {
    const fileSchema = {
      itemSchema: [],
      ...guessedFileSchema,
      ...readFileSchema,
    };

    // We recreate the list of items by using the guessed list as a base, but
    // enhancing the fields with what is defined in .itemSchema
    fileSchema.items = _.map(guessedFileSchema.items, guessedItem => {
      // We create a first field list based on the default .itemSchema
      let fields = _.transform(
        fileSchema.itemSchema,
        (result, baseFieldSchema) => {
          const fieldName = baseFieldSchema.name;
          const guessedFieldSchema = _.find(guessedItem.fields, {
            name: fieldName,
          });
          // We add a new field by merging the default schema with the guessed
          // one
          result.push({
            ...guessedFieldSchema,
            ...baseFieldSchema,
          });
        },
        []
      );

      // We might have guessed fields that are not in the base itemSchema, so we
      // need to add them at the end of the lits
      _.each(guessedItem.fields, guessedFieldSchema => {
        const fieldName = guessedFieldSchema.name;
        // If we already have it, we skip
        if (_.find(fields, { name: fieldName })) {
          return;
        }
        // Not in the list, we add it
        fields.push(guessedFieldSchema);
      });

      return {
        ...guessedItem,
        fields,
      };
    });

    return fileSchema;
  },
  /**
   * Guess a whole file schema by guessing all field schema of each field
   * @param {string} filepath Path to the _data file
   * @returns {object} Full file schema guessed from the data
   **/
  async guessFileSchema(filepath) {
    const data = await firost.readJson(filepath);
    // If data is an array, guessing its schema is a different process
    if (_.isArray(data)) {
      return this.guessListFileSchema(data);
    }
    // For object, we guess a field schema for each field
    return _.map(data, (value, key) => {
      return this.guessFieldSchema(key, value);
    });
  },
  /**
   * Guess a list file schema, by guessing all the field schema of all fields of
   * all items of the list
   * @param {Array} list The data list
   * @returns {object} Full file schema guessed from the list
   **/
  guessListFileSchema(list) {
    const items = _.map(list, item => {
      const fields = _.map(item, (value, key) => {
        return this.guessFieldSchema(key, value);
      });
      return {
        fields,
      };
    });
    return {
      type: 'list',
      items,
    };
  },

  /**
   * Read and return the schema of a specific file
   * If no schema file is found, returns false
   * @param {string} filepath Path to the _data file
   * @returns {boolean|object} Schema read from disk, or false if not found
   **/
  async readFileSchema(filepath) {
    const schemaPath = _.replace(filepath, /\.json$/, '.schema.json');
    if (!(await firost.isFile(schemaPath))) {
      return false;
    }
    return await firost.readJson(schemaPath);
  },
  /**
   * Guess all schema based only on the name and value
   * @param {string} name Name of the fields
   * @param {any} value Value of the field
   * @returns {object} Guessed field schema
   **/
  guessFieldSchema(name, value) {
    const type = this.guessFieldType(name, value);
    const displayName = this.guessDisplayName(name);
    return {
      name,
      displayName,
      type,
    };
  },
  /**
   * Guess the display name based on the field name
   * @param {string} name Field name
   * @returns {string} Display name
   **/
  guessDisplayName(name) {
    return _.chain(name)
      .replace(/\[\]$/g, '')
      .lowerCase()
      .capitalize()
      .thru(value => {
        const startsWithHas = _.startsWith(value, 'Has ');
        const startsWithIs = _.startsWith(value, 'Is ');
        return startsWithHas || startsWithIs ? `${value}?` : value;
      })
      .value();
  },
  /**
   * Guess the field type based on its value and name
   * @param {string} name Name of the fields
   * @param {any} value Value of the field
   * @returns {string} Type of the field
   **/
  guessFieldType(name, value) {
    if (_.isBoolean(value)) {
      return 'boolean';
    }
    if (_.isString(value) && value.length > 80) {
      return 'textarea';
    }
    if (_.isArray(value)) {
      return 'list';
    }
    return 'text';
  },
};
