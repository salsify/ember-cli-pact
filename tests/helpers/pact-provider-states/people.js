import { providerState } from 'ember-cli-pact';

providerState('a person exists', (server, { id, name, departmentId = null }) => {
  server.create('person', { id, name, departmentId });
});
