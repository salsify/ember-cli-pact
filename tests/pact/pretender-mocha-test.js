import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { setupPact, given, interaction, getProvider, specifyMatchingRules } from 'ember-cli-pact';
import { assert } from 'chai';
import { regex } from 'ember-cli-pact/matchers';
import $ from 'jquery';

describe('Pact | Imports', function() {
  setupTest({ integration: true });
  setupPact({
    mockProvider: 'pretender',
    providerName: 'non-rest-server'
  });

  it('stopping an import', async function() {
    given('an import is running');
    getProvider().map((pretender) => {
      pretender.put('/imports/current/stop', () => {
        return [200, { 'Content-Type': 'application/json' }, JSON.stringify({
          status: 'stopped',
          lastUpdated: '2015-10-21T00:00:00.000Z'
        })];
      });
    });

    specifyMatchingRules({
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
