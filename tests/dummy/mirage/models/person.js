import { Model, belongsTo } from 'ember-cli-mirage';
import { regex } from 'ember-cli-pact/matchers';

export default Model.extend({
  department: belongsTo()
}, {
  matchingRules: {
    createdAt: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  }
});
