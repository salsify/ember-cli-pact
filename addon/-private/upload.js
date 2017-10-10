import require from 'require';
import { v4 as uuid } from 'ember-uuid';

const SESSION_ID = uuid();

export function finalize() {
  return post('finalize', { session: SESSION_ID });
}

export function uploadInteraction(interaction, options) {
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
      throw new Error(`[ember-cli-pact] Upload error: ${error.message}`);
    });
}

// Use native fetch if available, or fallback to e.g. ember-fetch as a polyfill
let fetch;
try {
  fetch = self.fetch || require('fetch').default;
} catch (e) {
  throw new Error('ember-cli-pact requires support for `fetch()`, either natively or via an addon such as ember-fetch');
}
