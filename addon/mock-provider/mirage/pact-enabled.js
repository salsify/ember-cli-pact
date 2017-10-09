import MirageProvider from 'ember-cli-pact/mock-provider/mirage';

let mode = 'data';

export default function PactEnabled(SerializerClass) {
  return class PactEnabledSerializer extends SerializerClass {
    serialize(resource, request) {
      let provider = MirageProvider.current();
      if (provider) {
        mode = 'rules';
        try {
          provider.recordRequest(request, super.serialize(...arguments));
        } finally {
          mode = 'data';
        }
      }

      return super.serialize(...arguments);
    }

    getHashForResource() {
      if (mode === 'rules') {
        return this.getMatchRulesForResource(...arguments);
      } else {
        return super.getHashForResource(...arguments);
      }
    }

    getMatchRulesForResource(resource) {
      if (this.isCollection(resource)) {
        return resource.models.map(item => this.getMatchRulesForResource(item));
      } else {
        return { 'rules for': resource };
      }
    }
  };
}
