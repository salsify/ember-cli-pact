import { providerState } from 'ember-cli-pact';

providerState('a bed exists', (server, { id, size }) => {
  return server.create('bed', { id, size });
});
