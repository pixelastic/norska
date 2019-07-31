import { _ } from 'golgoth';
export default {
  inferType(value) {
    switch (true) {
      case this.isList(value):
        return 'list';
      case this.isTextarea(value):
        return 'textarea';
      default:
        return 'input';
    }
  },
  isTextarea(value) {
    return value.length > 80;
  },
  isList(value) {
    return _.isArray(value);
  },
};
