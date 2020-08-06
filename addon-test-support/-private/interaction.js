import { assert } from '@ember/debug';
import { serializeV3, serializeV2 } from 'ember-cli-pact/-private/serialization';

export default class Interaction {
  constructor(description) {
    this.description = description;
    this.captured = null;
    this.providerStates = [];
    this.matchingRules = [];
  }

  addProviderState(name, params) {
    return this.providerStates.push({ name, params });
  }

  recordRequest(request) {
    assert('Attempted to record multiple requests in a single interaction', !this.captured);
    this.captured = request;
  }

  addMatchingRules(rules) {
    this.matchingRules.push(rules);
  }

  serialize(version) {
    if (`${version}` === '3') {
      return serializeV3(this);
    } else if (`${version}` === '2') {
      return serializeV2(this);
    } else {
      throw new Error(`Unsupported serialization version: ${version}`);
    }
  }
}
