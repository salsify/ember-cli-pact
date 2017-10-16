import MirageProvider from 'ember-cli-pact/mock-provider/mirage';
import { allOf, arrayElements } from 'ember-cli-pact/matchers';

let mode = 'data';

export default function PactEnabled(SerializerClass) {
  return class PactEnabledSerializer extends SerializerClass {
    serialize(resource, request) {
      let serialized = super.serialize(...arguments);
      let provider = MirageProvider.current();
      if (provider) {
        mode = 'rules';
        try {
          let requestRules = this.getMatchingRules(request, serialized);
          let bodyRules = super.serialize(...arguments);
          provider.recordRequest(request);
          provider.specifyMatchingRules(this._mergeMatchingRules(requestRules, bodyRules));
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

    /**
     * @public
     * @method getMatchingRules
     * @param {FakeRequest} request
     * @param {any} serializedResponse
     * @return Pact matching rules for the given request/response
     */
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
