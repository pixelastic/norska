import { _ } from 'golgoth';
import firost from 'firost';
/**
 * Helper method to get input field types from data. Those fields will be used
 * to create the add/edit UI
 **/
export default {
  async getFieldsFromFilepath(filepath) {
    const data = await firost.readJson(filepath);
    const readFileSchema = await this.readFileSchema(filepath);
    const guessedFileSchema = await this.guessSchema(data);
    const fileSchema = this.reconcileFileSchema(
      readFileSchema,
      guessedFileSchema
    );

    return this.getFields(data, fileSchema);
  },
  /**
   * Returns a list of fields for any data, following the specified schema
   * @param {object|Array} data Data used to compute fields
   * @param {object} schema Schema the data should follow
   * @returns {object} Field list of the data file
   **/
  getFields(data, schema) {
    // Special handling of list
    if (schema.type === 'list') {
      const items = _.map(schema.items, (itemSchema, itemIndex) => {
        const itemData = data[itemIndex];
        let fields = this.getFields(itemData, itemSchema.fields);

        // Update each fields to add [] to the value
        fields = _.map(fields, field => {
          return {
            ...field,
            name: `${field.name}[${itemIndex}]`,
          };
        });

        // Add a potential .displayName to the item based on the top-level .displayKey
        let displayName = `Item ${itemIndex}`;
        if (schema.displayKey) {
          const rawDisplayName = itemData[schema.displayKey];
          displayName = this.guessDisplayName(rawDisplayName);
        }

        return {
          ...itemSchema,
          fields,
          displayName,
        };
      });

      return [
        {
          ...schema,
          items,
        },
      ];
    }

    // Merge object schema with data
    return _.map(schema, field => {
      return {
        ...field,
        value: data[field.name],
      };
    });
  },
  /**
   * Return the final file schema based on the one defined on disk and the one
   * guessed from the dat
   * @param {object|Array} readFileSchema Schema defined on disk
   * @param {object|Array} guessedFileSchema Schema guessed from data
   * @returns {object} Full file schema
   **/
  reconcileFileSchema(readFileSchema, guessedFileSchema) {
    if (!readFileSchema) {
      return guessedFileSchema;
    }
    // If schema is a list, merging with the guessed schema is different process
    if (readFileSchema.type === 'list') {
      const defaultItemSchema = readFileSchema.itemSchema;
      const items = _.map(guessedFileSchema.items, guessedItem => {
        const fields = this.reconcileFileSchema(
          defaultItemSchema,
          guessedItem.fields
        );
        return {
          ...guessedItem,
          fields,
        };
      });
      return {
        ...readFileSchema,
        ...guessedFileSchema,
        items,
      };
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

    // We add displayName to all fields
    fileSchema = _.map(fileSchema, item => {
      return {
        displayName: this.guessDisplayName(item.name),
        ...item,
      };
    });

    return fileSchema;
  },
  /**
   * Guess a whole schema by guessing all field schema of each field
   * @param {string} data Data to guess
   * @returns {object} Full file schema guessed from the data
   **/
  guessSchema(data) {
    // If data is an array, we need to guess its inner item fields
    if (_.isArray(data)) {
      const items = _.map(data, item => {
        return {
          fields: this.guessSchema(item),
        };
      });
      return {
        type: 'list',
        items,
      };
    }
    // For object, we guess a field schema for each field
    return _.map(data, (value, key) => {
      return this.guessFieldSchema(key, value);
    });
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
    return {
      name,
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
      return 'checkbox';
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
