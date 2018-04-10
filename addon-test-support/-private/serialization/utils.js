import { assert } from '@ember/debug';
import Matcher from 'ember-cli-pact/-private/matcher';

// Generates the base frame for a pact document for either v2 or v3 of the spec
export function createPactSkeleton(interaction) {
  let pact = {
    description: interaction.description,
    request: {
      method: interaction.captured.method,
      headers: interaction.captured.requestHeaders
    },
    response: {
      status: interaction.captured.status,
      headers: interaction.captured.responseHeaders
    }
  };

  extractPathAndQuery(pact, interaction.captured.url);

  return pact;
}

export function applyBody(target, body) {
  if (body) {
    target.body = JSON.parse(body);
  }
}

export function applyMatchingRules(target, rules) {
  if (Object.keys(rules).length) {
    target.matchingRules = rules;
  }
}

export function serializeMatchingRules(version, object, parentPath = '$', root = {}) {
  if (object instanceof Matcher) {
    assert(`The ${object.name} matcher is unavailable in Pact v${version}`, object.availableVersion <= version);
    object.serialize(version, parentPath, root, serializeMatchingRules);
  } else if (Array.isArray(object)) {
    for (let i = 0, len = object.length; i < len; i++) {
      serializeMatchingRules(version, object[i], `${parentPath}[${i}]`, root);
    }
  } else if (object && typeof object === 'object') {
    for (let key of Object.keys(object)) {
      serializeMatchingRules(version, object[key], `${parentPath}.${key}`, root);
    }
  }
  return root;
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
