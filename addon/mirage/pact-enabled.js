import Interaction from 'ember-cli-pact/-private/interaction';

// Yikes.
let mode = 'data';

export default function PactEnabled(SerializerClass) {
  return class PactEnabledSerializer extends SerializerClass {
    serialize(resource, request) {
      let interaction = Interaction.current();
      if (interaction) {
        mode = 'rules';
        try {
          interaction.recordRequest(request, super.serialize(...arguments));
        } finally {
          mode = 'data';
        }
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
  }
}
