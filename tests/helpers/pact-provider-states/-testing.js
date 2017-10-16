import { providerState } from 'ember-cli-pact';

providerState('test state one', {
  hello: 'world'
});

providerState('test state two', () => {
  return 'ok';
});
