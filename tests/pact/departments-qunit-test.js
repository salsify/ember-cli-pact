import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact } from 'ember-cli-pact';

module('Pact | Departments', function(hooks) {
  setupTest(hooks);
  setupPact(hooks, {
    providerName: 'departments-server'
  });

  hooks.beforeEach(function() {
    this.given('a department exists', { id: '1', name: 'People' });
    this.given('a department exists', { id: '2', name: 'Admin' });

    this.provider().beforeUpload((interaction) => {
      delete interaction.request.headers['X-Requested-With'];
    });
  });

  test('listing departments', async function(assert) {
    let departments = await this.interaction(() => this.store().findAll('department'));

    assert.deepEqual([...departments.mapBy('id')], ['1', '2']);
    assert.deepEqual([...departments.mapBy('name')], ['People', 'Admin']);
  });
});
