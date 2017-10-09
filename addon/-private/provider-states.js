/* global require */
import { assert } from '@ember/debug';

export function lookupProviderState(name) {
  assert(`Unknown provider state: ${name}`, STATES[name]);
  return STATES[name];
}

export function registerProviderState(name, callback) {
  assert(`Don't import provider state modules directly`, currentModule);
  assert(`Duplicate provider state: ${name}`, !(name in STATES));
  STATES[name] = new ProviderState(name, callback);
}

class ProviderState {
  constructor(name, callback) {
    this.name = name;
    this.callback = callback;
    this.source = currentModule;
  }
}

let currentModule;
let loaded = false;

let STATES = Object.create(null);
export function loadProviderStates(env) {
  if (!loaded) {
    loaded = true;
    let prefix = `${env.modulePrefix}/tests/helpers/pact-provider-states/`;
    for (let module of Object.keys(require.entries)) {
      if (module.indexOf(prefix) === 0) {
        currentModule = module;
        try {
          require(module);
        } finally {
          currentModule = null;
        }
      }
    }
  }
  return STATES;
}
