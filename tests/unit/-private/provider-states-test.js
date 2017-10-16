import { module, test } from 'qunit';
import { lookupProviderState, registerProviderState, loadProviderStates } from 'ember-cli-pact/-private/provider-states';
import config from 'dummy/config/environment';

module('Unit | provider-states', {
  beforeEach() {
    loadProviderStates(config);
  }
});

test('loading provider states', function(assert) {
  assert.throws(() => loadProviderStates({}), /different configuration/i);
  assert.throws(() => registerProviderState('test state one'), /duplicate provider state/i)
});

test('looking up provider states', function(assert) {
  let one = lookupProviderState('test state one');
  assert.equal(one.name, 'test state one');
  assert.equal(one.source, 'dummy/tests/helpers/pact-provider-states/-testing');
  assert.deepEqual(one.config, { hello: 'world' });

  let two = lookupProviderState('test state two');
  assert.equal(two.name, 'test state two');
  assert.equal(two.source, 'dummy/tests/helpers/pact-provider-states/-testing');
  assert.deepEqual(two.config(), 'ok');

  assert.throws(() => lookupProviderState('nonexistent state'), /unknown provider state/i);
})
