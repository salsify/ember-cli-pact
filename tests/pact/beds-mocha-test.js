import { describe, beforeEach, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { setupPact, given, interaction } from 'ember-cli-pact';
import { assert } from 'chai';

describe('Pact | Beds', function() {
  setupTest({ integration: true });
  setupPact();

  beforeEach(function() {
    this.bed1 = given('a bed exists', { id: '1', size: 'double' });
    this.bed2 = given('a bed exists', { id: '2', size: 'queen' });
  });

  it('listing beds', async function() {
    let beds = await interaction(() => this.store().findAll('bed'));
    assert.equal(this.bed1.id, 1);
    assert.equal(this.bed2.id, 2);

    assert.deepEqual([...beds.mapBy('id')], ['1', '2']);
    assert.deepEqual([...beds.mapBy('size')], ['double', 'queen']);
  });
});
