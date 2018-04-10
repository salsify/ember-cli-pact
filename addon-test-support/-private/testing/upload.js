import require from 'require';
import { v4 as uuid } from 'ember-uuid';
import { assert } from '@ember/debug';

const SESSION_ID = uuid();

export /* istanbul ignore next */ function finalize() {
  return post('finalize', { session: SESSION_ID });
}

export function uploadInteraction(interaction, options) {
  assert('You must configure a provider name', options.provider);

  return post('upload', {
    session: SESSION_ID,
    provider: options.provider,
    consumer: options.consumer,
    interaction
  });
}

function post(path, body) {
  let options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };

  return fetch(`/_pact/${path}`, options)
    .then((result) => {
      if (!result.ok) {
        return result.text().then((message) => {
          throw new Error(message);
        });
      }
    })
    .catch((error) => {
      throw new Error(`[ember-cli-pact] ${error.message}`);
    });
}

// Use native fetch if available, or fallback to e.g. ember-fetch as a polyfill
const fetch = self.fetch || /* istanbul ignore next */ require('fetch').default;
