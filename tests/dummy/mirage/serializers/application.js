import { JSONAPISerializer } from 'ember-cli-mirage';
import PactEnabled from 'ember-cli-pact/mirage/pact-enabled';

export default class ApplicationSerializer extends PactEnabled(JSONAPISerializer) {

}
