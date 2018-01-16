import { describe, beforeEach, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { setupPact, given, interaction } from 'ember-cli-pact';
import { assert } from 'chai';

describe('Pact | Beds', function() {
  setupTest({ integration: true });
  setupPact();

  beforeEach(function() {
    given('a bed exists', { id: '1', size: 'double' });
    given('a bed exists', { id: '2', size: 'queen' });
  });

  it('listing beds', async function() {
    let beds = await interaction(() => this.store().findAll('bed'));

    assert.deepEqual([...beds.mapBy('id')], ['1', '2']);
    assert.deepEqual([...beds.mapBy('size')], ['double', 'queen']);
  });
});
