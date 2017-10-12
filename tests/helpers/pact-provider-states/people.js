import { providerState } from 'ember-cli-pact';

providerState('a person exists', (server, {
  id,
  name,
  departmentId = null,
  createdAt = '1969-07-20T20:18:04.000Z'
}) => {
  server.create('person', { id, name, departmentId, createdAt });
});
