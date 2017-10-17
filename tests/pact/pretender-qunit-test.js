import { test } from 'ember-qunit';
import { moduleForPact } from 'ember-cli-pact';
import { regex } from 'ember-cli-pact/matchers';
import $ from 'jquery';

moduleForPact('Pact | Imports', {
  mockProvider: 'pretender',
  providerName: 'non-rest-server'
});

test('stopping an import', async function(assert) {
  this.given('an import is running');
  this.provider().map((pretender) => {
    pretender.put('/imports/current/stop', () => {
      return [200, { 'Content-Type': 'application/json' }, JSON.stringify({
        status: 'stopped',
        lastUpdated: '2015-10-21T00:00:00.000Z'
      })];
    });
  });

  this.matchingRules({
    response: {
      body: {
        lastUpdated: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      }
    }
  });

  let response = await this.interaction(() => $.ajax('/imports/current/stop', { method: 'PUT' }));

  assert.deepEqual(response, {
    status: 'stopped',
    lastUpdated: '2015-10-21T00:00:00.000Z'
  });
});
