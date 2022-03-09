import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact, given, interaction } from 'ember-cli-pact';

module('Pact | Beds', function(hooks) {
  setupTest(hooks);
  setupPact(hooks);

  hooks.beforeEach(function() {
    this.bed1 = given('a bed exists', { id: '1', size: 'double' });
    this.bed2 = given('a bed exists', { id: '2', size: 'queen' });
  });

  test('listing beds', async function(assert) {
    let beds = await interaction(() => this.store().findAll('bed'));
    assert.equal(this.bed1.id, 1);
    assert.equal(this.bed2.id, 2);

    assert.deepEqual([...beds.mapBy('id')], ['1', '2']);
    assert.deepEqual([...beds.mapBy('size')], ['double', 'queen']);
  });
});
