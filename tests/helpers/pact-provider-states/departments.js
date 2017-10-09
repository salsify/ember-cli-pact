import { providerState } from 'ember-cli-pact';

providerState('a department exists', (server, { id, name }) => {
  server.create('department', { id, name });
});
