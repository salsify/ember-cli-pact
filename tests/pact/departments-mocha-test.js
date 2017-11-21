import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import { setupPact, given, getProvider, interaction } from 'ember-cli-pact';
import { assert } from 'chai';

describe('Pact | Departments', function() {
  setupTest({ integration: true });
  setupPact({
    providerName: 'departments-server'
  });

  beforeEach(function() {
    given('a department exists', { id: '1', name: 'People' });
    given('a department exists', { id: '2', name: 'Admin' });

    getProvider().beforeUpload((interaction) => {
      delete interaction.request.headers['X-Requested-With'];
    });
  });

  it('listing departments', async function() {
    let departments = await interaction(() => this.store().findAll('department'));

    assert.deepEqual([...departments.mapBy('id')], ['1', '2']);
    assert.deepEqual([...departments.mapBy('name')], ['People', 'Admin']);
  });
});
