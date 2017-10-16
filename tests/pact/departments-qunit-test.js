import { test } from 'ember-qunit';
import { moduleForPact } from 'ember-cli-pact';

moduleForPact('Pact | Departments');

test('listing departments', async function(assert) {
  this.given('a department exists', { id: '1', name: 'People' });
  this.given('a department exists', { id: '2', name: 'Admin' });

  let departments = await this.interaction(() => this.store().findAll('department'));

  assert.deepEqual([...departments.mapBy('id')], ['1', '2']);
  assert.deepEqual([...departments.mapBy('name')], ['People', 'Admin']);
});
