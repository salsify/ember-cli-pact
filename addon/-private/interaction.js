import { assert } from '@ember/debug';
import { v3 as serializeV3 } from 'ember-cli-pact/-private/serialization';

export default class Interaction {
  constructor(description) {
    this.description = description;
    this.captured = null;
    this.providerStates = [];
    this.matchingRules = [];
  }

  addProviderState(name, params) {
    this.providerStates.push({ name, params });
  }

  recordRequest(request) {
    assert('Attempted to record multiple requests in a single interaction', !this.captured);
    this.captured = request;
  }

  addMatchingRules(rules) {
    this.matchingRules.push(rules);
  }

  serialize(version) {
    assert('Only v3 of the Pact Specification is currently supported', `${version}` === '3');
    return serializeV3(this);
  }
}
