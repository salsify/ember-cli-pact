import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact, given, interaction } from 'ember-cli-pact';

module('Pact | People | v2', function(hooks) {
  setupTest(hooks);
  setupPact(hooks, {
    providerName: 'test-v2-provider',
    pactVersion: 2
  });

  hooks.beforeEach(function() {
    given('a person exists');
  });

  test('fetching a person by ID', async function(assert) {
    let person = await interaction(() => this.store().findRecord('person', 1));

    assert.equal(person.get('id'), '1');
    assert.equal(person.get('name'), 'Person');
  });
});
