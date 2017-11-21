import { getContext } from 'ember-test-helpers';

export { setupPact } from './-private/testing';
export { registerProviderState as providerState } from './-private/provider-states';

export function getProvider() {
  return getContext()._pactProvider;
}

export function given(name, params) {
  return getProvider().addState(name, params);
}

export function interaction(perform) {
  return getProvider().specifyInteraction(perform);
}

export function specifyMatchingRules(rules) {
  return getProvider().specifyMatchingRules(rules);
}
