import { assert } from '@ember/debug';
import { run } from '@ember/runloop';
import { makeArray } from '@ember/array';
import { resolve } from 'rsvp';
import { lookupProviderState } from './provider-states';

// There is some *ahem* wonderful global state management going on here.
let CURRENT;

export default class Interaction {
  static start(description, provider) {
    assert('Only one interaction should be active at a time', !CURRENT);
    return CURRENT = new Interaction(description, provider);
  }

  static assertCurrent() {
    assert('No current interaction', CURRENT);
    return CURRENT;
  }

  static current() {
    return CURRENT;
  }

  constructor(description, provider) {
    this.description = description;
    this.provider = provider;
    this.providerStates = [];
    this.captured = null;
    this.rules = null;
    this.requestSpec = null;
    this.responseSpec = null;
    this._capturing = false;
  }

  given(state, params) {
    if (typeof state === 'object') {
      params = state.params;
      state = state.state;
    }

    let providerState = lookupProviderState(state);
    this.providerStates.push({ state: providerState.name, params });
    providerState.callback.call(null, this.provider, params)
  }

  capture(context, options) {
    if (typeof options === 'function') {
      options = { perform: options };
    }

    let { given, uponReceiving, withRequest, willRespondWith, perform } = options;

    this.description = uponReceiving || this.description;
    this.requestSpec = withRequest;
    this.responseSpec = willRespondWith;

    for (let state of makeArray(given)) {
      this.given(state);
    }

    let result;
    this._capturing = true;
    try {
      result = run(() => perform.call(context));
    } catch (error) {
      this._capturing = false;
      throw error;
    }

    if (result && typeof result.then === 'function') {
      return resolve(result).finally(() => this._capturing = false);
    } else {
      this._capturing = false;
      return result;
    }
  }

  recordRequest(request, rules) {
    if (this._capturing) {
      assert('Attempted to record multiple requests in a single interaction', !this.captured);
      this.captured = request;
      this.rules = rules;
    }
  }

  teardown() {
    assert('Attempted to teardown an interaction that was not the current one', CURRENT === this);
    if (this.provider && this.provider.shutdown) {
      this.provider.shutdown();
    }
    CURRENT = null;
  }

  toJSON() {
    return {
      description: this.description,
      providerState: this.providerStates,
      matchRules: this.rules,
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
