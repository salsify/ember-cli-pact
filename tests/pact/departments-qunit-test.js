import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact, given, getProvider, interaction } from 'ember-cli-pact';

module('Pact | Departments', function(hooks) {
  setupTest(hooks);
  setupPact(hooks, {
    mockProvider: 'custom',
    providerName: 'departments-server'
  });

  hooks.beforeEach(function() {
    given('a department exists', { id: '1', name: 'People' });
    given('a department exists', { id: '2', name: 'Admin' });

    getProvider().beforeUpload((interaction) => {
      delete interaction.request.headers['X-Requested-With'];
    });
  });

  test('listing departments', async function(assert) {
    let departments = await interaction(() => this.store().findAll('department'));

    assert.deepEqual([...departments.mapBy('id')], ['1', '2']);
    assert.deepEqual([...departments.mapBy('name')], ['People', 'Admin']);
  });
});
