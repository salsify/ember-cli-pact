import { assert } from '@ember/debug';

export default class Interaction {
  constructor(description) {
    this.description = description;
    this.captured = null;
    this.providerStates = [];
    this.matchRules = [];
  }

  addProviderState(name, params) {
    this.providerStates.push({ name, params });
  }

  recordRequest(request) {
    assert('Attempted to record multiple requests in a single interaction', !this.captured);
    this.captured = request;
  }

  addMatchRules(rules) {
    this.matchRules.push(rules);
  }

  toJSON() {
    // TODO handle match rules, query params
    return {
      description: this.description,
      providerStates: this.providerStates,
      request: {
        type: this.captured.method,
        path: this.captured.url,
        headers: this.captured.requestHeaders,
        body: JSON.parse(this.captured.requestBody || 'null'),
      },
      response: {
        status: this.captured.status,
        headers: this.captured.responseHeaders,
        body: JSON.parse(this.captured.responseText || 'null')
      }
    };
  }
}
