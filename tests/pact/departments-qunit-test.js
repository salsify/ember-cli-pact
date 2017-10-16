import { test } from 'ember-qunit';
import { moduleForPact } from 'ember-cli-pact';

moduleForPact('Pact | Departments', {
  beforeEach() {
    this.given('a department exists', { id: '1', name: 'People' });
    this.given('a department exists', { id: '2', name: 'Admin' });
  }
});

test('listing departments', async function(assert) {
  let departments = await this.interaction(() => this.store().findAll('department'));

  assert.deepEqual([...departments.mapBy('id')], ['1', '2']);
  assert.deepEqual([...departments.mapBy('name')], ['People', 'Admin']);
});
