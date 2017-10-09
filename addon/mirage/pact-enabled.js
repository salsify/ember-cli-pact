import MockProvider from 'ember-cli-pact/mock-provider';

// Yikes.
let mode = 'data';

export default function PactEnabled(SerializerClass) {
  return class PactEnabledSerializer extends SerializerClass {
    serialize(resource, request) {
      mode = 'rules';
      try {
        // TODO build a proper mock provider for Pact
        MockProvider.prototype.recordRequest(request, super.serialize(...arguments));
      } finally {
        mode = 'data';
      }

      return super.serialize(...arguments);
    }

    getHashForResource(resource) {
      if (mode === 'rules') {
        return this.getRulesForResource(resource);
      } else {
        return super.getHashForResource(...arguments);
      }
    }

    getRulesForResource(resource) {
      if (this.isCollection(resource)) {
        return resource.models.map(item => this.getRulesForResource(item));
      } else {
        return { 'rules for': resource };
      }
    }
  };
}
