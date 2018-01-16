import { RestSerializer } from 'ember-cli-mirage';
import { PactEnabled } from 'ember-cli-pact/mock-provider/mirage';

export default class DepartmentSerializer extends PactEnabled(RestSerializer) {
  // Workaround for https://github.com/salsify/ember-cli-pact/issues/19
  getMatchingRulesForResource() {
    return [super.getMatchingRulesForResource(...arguments)];
  }
}
