import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact, given, interaction, getProvider } from 'ember-cli-pact';
import { regex } from 'ember-cli-pact/matchers';
import $ from 'jquery';

module('Pact | Imports', function(hooks) {
  setupTest(hooks);
  setupPact(hooks, {
    mockProvider: 'pretender',
    providerName: 'non-rest-server'
  });

  test('stopping an import', async function(assert) {
    given('an import is running');
    getProvider().map((pretender) => {
      pretender.put('/imports/current/stop', () => {
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({
          status: 'stopped',
          lastUpdated: '2015-10-21T00:00:00.000Z'
        })];
      });
    });

    getProvider().specifyMatchingRules({
      response: {
        body: {
          lastUpdated: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
        }
      }
    });

    let response = await interaction(() => $.ajax('/imports/current/stop', { method: 'PUT' }));

    assert.deepEqual(response, {
      status: 'stopped',
      lastUpdated: '2015-10-21T00:00:00.000Z'
    });
  });
});
