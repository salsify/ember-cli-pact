import { assert } from '@ember/debug';
import serializeMatchingRules from './matching-rules';

const VERSION = 3;

export default function serializeV3(interaction) {
  let pact = createPact(interaction);

  extractPathAndQuery(pact, interaction.captured.url);

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

function createPact(interaction) {
  return {
    description: interaction.description,
    providerStates: interaction.providerStates,
    request: {
      type: interaction.captured.method,
      headers: interaction.captured.requestHeaders
    },
    response: {
      status: interaction.captured.status,
      headers: interaction.captured.responseHeaders
    }
  };
}

function applyBody(target, body) {
  if (body) {
    target.body = JSON.parse(body);
  }
}

function applyMatchingRules(target, rules) {
  if (Object.keys(rules).length) {
    target.matchingRules = rules;
  }
}

function extractPathAndQuery(pact, url) {
  let questionIndex = url.indexOf('?');
  if (questionIndex !== -1) {
    pact.request.query = parseQuery(url.substring(questionIndex + 1));
    url = url.substring(0, questionIndex);
  }
  pact.request.path = url;
}

function parseQuery(query) {
  let parsed = {};
  for (let item of query.split('&')) {
    let pair = item.split('=');
    let key = decodeURIComponent(pair[0]);
    let value = decodeURIComponent(pair[1]);
    if (parsed[key]) {
      parsed[key].push(value);
    } else {
      parsed[key] = [value];
    }
  }
  return parsed;
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
