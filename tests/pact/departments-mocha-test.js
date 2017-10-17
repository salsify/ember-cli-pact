import { describe, it, beforeEach } from 'mocha';
import { assert } from 'chai';
import { setupPactTest } from 'ember-cli-pact';

describe('Pact | Departments', function() {
  setupPactTest({
    providerName: 'departments-server'
  });

  beforeEach(function() {
    this.given('a department exists', { id: '1', name: 'People' });
    this.given('a department exists', { id: '2', name: 'Admin' });

    this.provider().beforeUpload((interaction) => {
      delete interaction.request.headers['X-Requested-With'];
    });
  });

  it('listing departments', async function() {
    let departments = await this.interaction(() => this.store().findAll('department'));

    assert.deepEqual([...departments.mapBy('id')], ['1', '2']);
    assert.deepEqual([...departments.mapBy('name')], ['People', 'Admin']);
  });
});
