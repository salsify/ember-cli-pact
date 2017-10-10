import require from 'require';
import { v4 as uuid } from 'ember-uuid';

const SESSION_ID = uuid();

export function finalize() {
  return fetch('/_pact/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: SESSION_ID })
    })
    .then((result) => result.ok || warn(`Error finalizing pacts: ${result.statusText}`))
    .catch((error) => warn(`Error finalizing pacts: ${error}`));
}

export function uploadInteraction(interaction, options) {
  return fetch('/_pact/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session: SESSION_ID,
        provider: options.provider,
        consumer: options.consumer,
        interaction
      })
    })
    .then((result) => result.ok || warn(`Error uploading interaction result: ${result.statusText}`))
    .catch((error) => warn(`Error uploading interaction result: ${error}`));
}

function warn(...args) {
  // eslint-disable-next-line no-console
  console.warn(...args);
}

// Use native fetch if available, or fallback to e.g. ember-fetch as a polyfill
let fetch;
try {
  fetch = self.fetch || require('fetch').default;
} catch (e) {
  throw new Error('ember-cli-pact requires support for `fetch()`, either natively or via an addon such as ember-fetch');
}
