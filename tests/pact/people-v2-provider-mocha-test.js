import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { setupPact, given, interaction } from 'ember-cli-pact';
import { assert } from 'chai';

describe('Pact | People | v2', function() {
  setupTest({ integration: true });
  setupPact({
    providerName: 'test-v2-provider',
    pactVersion: 2
  });

  beforeEach(function() {
    given('a person exists');
  });

  it('fetching a person by ID', async function() {
    let person = await interaction(() => this.store().findRecord('person', 1));

    assert.equal(person.get('id'), '1');
    assert.equal(person.get('name'), 'Person');
  });
});
