import { describe, it } from 'mocha';
import { assert } from 'chai';
import { setupPactTest } from 'ember-cli-pact';

describe('Pact | Departments', function() {
  setupPactTest();

  it('listing departments', async function() {
    this.given('a department exists', { id: '1', name: 'People' });
    this.given('a department exists', { id: '2', name: 'Admin' });

    let departments = await this.interaction(() => this.store().findAll('department'));

    assert.deepEqual([...departments.mapBy('id')], ['1', '2']);
    assert.deepEqual([...departments.mapBy('name')], ['People', 'Admin']);
  });
});
