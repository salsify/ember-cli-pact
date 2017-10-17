import require from 'require';
import { assert } from '@ember/debug';
import MockProvider from 'ember-cli-pact/mock-provider';
import { allOf, arrayElements } from 'ember-cli-pact/matchers';

let activeProvider = null;

export default class MirageProvider extends MockProvider {
  constructor() {
    super(...arguments);
    this.server = null;
  }

  startInteraction() {
    super.startInteraction(...arguments);
    this._activate();
    this._startServer();
  }

  addState(name, params) {
    super.addState(...arguments);

    let state = this.lookupProviderState(name);
    assert('Mirage provider states require a callback function', typeof state.config === 'function');
    state.config.call(null, this.server, params);
  }

  endInteraction() {
    this._shutdownServer();
    this._deactivate();
    super.endInteraction(...arguments);
  }

  // Called by the PactEnabled serializer mixin
  recordRequest(request) {
    if (this.isCapturing()) {
      this.interaction.recordRequest(request);
    }
  }

  _activate() {
    assert('Attempted to activate multiple mock Mirage providers at once', !activeProvider);
    activeProvider = this;
  }

  _deactivate() {
    assert('Attempted to shut down a mock Mirage provider that wasn\'t active', activeProvider === this);
    activeProvider = null;
  }

  _startServer() {
    try {
      let { modulePrefix } = this.config;
      let { startMirage } = require(`${modulePrefix}/initializers/ember-cli-mirage`);
      this.server = startMirage();
      this.server.passthrough('/_pact/*path');
    } catch (error) {
      // istanbul ignore next: mirage will always be around in our tests
      throw new Error(`Unable to start mirage server; is ember-cli-mirage installed? ${error.message}`);
    }
  }

  _shutdownServer() {
    this.server.shutdown();
  }
}

let mode = 'data';

export function PactEnabled(SerializerClass) {
  return class PactEnabledSerializer extends SerializerClass {
    serialize(resource, request) {
      let serialized = super.serialize(...arguments);
      if (activeProvider) {
        mode = 'rules';
        try {
          let requestRules = this.getMatchingRules(request, serialized);
          let bodyRules = super.serialize(...arguments);
          activeProvider.recordRequest(request);
          activeProvider.specifyMatchingRules(this._mergeMatchingRules(requestRules, bodyRules));
        } finally {
          mode = 'data';
        }
      }

      return serialized;
    }

    getHashForResource() {
      if (mode === 'rules') {
        return this.getMatchingRulesForResource(...arguments);
      } else {
        return super.getHashForResource(...arguments);
      }
    }

    getMatchingRules(/* request, serialized */) {
      return {};
    }

    getMatchingRulesForResource(resource) {
      let { matchingRules } = this.schema.modelFor(resource.modelName).class;
      if (matchingRules) {
        let normalized = {};
        for (let key of (Object.keys(matchingRules))) {
          normalized[this.keyForAttribute(key)] = matchingRules[key];
        }
        matchingRules = this.isCollection(resource) ? arrayElements(normalized) : normalized;
      }
      return matchingRules;
    }

    _mergeMatchingRules(requestRules, bodyRules) {
      let merged = Object.assign({}, requestRules);
      merged.response = Object.assign({}, merged.response);
      merged.response.body = allOf([merged.response.body, bodyRules].filter(Boolean));
      return merged;
    }
  };
}
