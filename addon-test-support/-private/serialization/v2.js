import { assert } from '@ember/debug';
import { createPactSkeleton, applyBody, serializeMatchingRules, applyMatchingRules } from './utils';

const VERSION = 2;

export default function serializeV2(interaction) {
  let pact = createPactSkeleton(interaction);

  applyProviderState(pact, interaction);

  applyBody(pact.request, interaction.captured.requestBody);
  applyBody(pact.response, interaction.captured.responseText);

  let requestRules = {};
  let responseRules = {};
  for (let matchingRules of interaction.matchingRules || []) {
    serializeRequestRules(matchingRules.request, requestRules);
    serializeResponseRules(matchingRules.response, responseRules);
  }

  normalizeMatchingRules(requestRules);
  normalizeMatchingRules(responseRules);

  applyMatchingRules(pact.request, requestRules);
  applyMatchingRules(pact.response, responseRules);

  return pact;
}

function serializeRequestRules(source, target) {
  if (!source) { return; }

  assert('Version 2 of the Pact Specification doesn\'t allow for matching rules for query params', !source.query);

  serializeMatchingRules(VERSION, {
    body: source.body,
    headers: source.headers || source.header,
    path: source.path
  }, '$', target);
}

function serializeResponseRules(source, target) {
  if (!source) { return; }

  serializeMatchingRules(VERSION, {
    body: source.body,
    headers: source.headers || source.header
  }, '$', target);
}

function normalizeMatchingRules(rules) {
  Object.keys(rules).forEach((key) => {
    let matchers = rules[key].matchers;

    assert('Version 2 of the Pact Specification only allows for one matching rule per field', matchers.length < 2);

    if (!matchers.length) {
      delete rules[key];
    } else {
      rules[key] = matchers[0];
    }
  });
}

function applyProviderState(pact, interaction) {
  if (!interaction.providerStates) { return; }

  assert(
    'Version 2 of the Pact Specification only allows for a single provider state per interaction',
    interaction.providerStates.length < 2
  );

  let providerState = interaction.providerStates[0];
  if (!providerState) { return; }

  assert(
    'Version 2 of the Pact Specification doesn\'t allow for parameterized provider states',
    !providerState.params || !Object.keys(providerState.params).length
  );

  pact.providerState = providerState.name;
}
