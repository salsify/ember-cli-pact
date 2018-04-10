import { assert } from '@ember/debug';
import { createPactSkeleton, applyBody, serializeMatchingRules, applyMatchingRules } from './utils';

const VERSION = 3;

export default function serializeV3(interaction) {
  let pact = createPactSkeleton(interaction);
  pact.providerStates = interaction.providerStates;

  applyBody(pact.request, interaction.captured.requestBody);
  applyBody(pact.response, interaction.captured.responseText);

  let requestRules = {};
  let responseRules = {};
  for (let matchingRules of interaction.matchingRules || []) {
    serializeRequestRules(matchingRules.request, requestRules);
    serializeResponseRules(matchingRules.response, responseRules);
  }

  applyMatchingRules(pact.request, requestRules);
  applyMatchingRules(pact.response, responseRules);

  return pact;
}

function serializeRequestRules(source, target) {
  if (!source) return;

  normalizeHeaderRules(source);
  serializeRulesForKey(source, target, 'path');
  serializeRulesHashForKey(source, target, 'query');
  serializeRulesHashForKey(source, target, 'header');
  serializeRulesForBody(source, target);
}

function serializeResponseRules(source, target) {
  if (!source) return;

  normalizeHeaderRules(source);
  serializeRulesHashForKey(source, target, 'header');
  serializeRulesForBody(source, target);
}

function normalizeHeaderRules(rules) {
  if (rules.headers) {
    assert('Conflicting matching rules: both `header` and `headers` keys defined', !rules.header);
    rules.header = rules.headers;
    delete rules.headers;
  }
}

function serializeRulesForBody(source, target) {
  if (source.body) {
    target.body = target.body || {};
    Object.assign(target.body, serializeMatchingRules(VERSION, source.body));
  }
}

function serializeRulesForKey(source, target, key) {
  if (source[key]) {
    let rules = serializeMatchingRules(VERSION, source[key]);
    let count = Object.keys(rules).length;
    assert(`Matching rules for ${key} must be for a simple value`, count === 0 || (count === 1 && rules.$));
    target[key] = rules.$;
  }
}

function serializeRulesHashForKey(source, target, key) {
  if (source[key]) {
    target[key] = {};
    for (let childKey of Object.keys(source[key])) {
      serializeRulesForKey(source[key], target[key], childKey);
    }
  }
}
