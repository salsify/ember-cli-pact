import require from 'require';
import PactTestModule from './-private/pact-test-module';

export { registerProviderState as providerState } from './-private/provider-states';

// QUnit-style moduleFor hook
export function moduleForPact(...args) {
  let { createModule } = require('ember-qunit/qunit-module');
  return createModule(PactTestModule, ...args);
}

// Mocha-style setupTest hook
export function setupPactTest(...args) {
  let setupTestFactory = require('ember-mocha/setup-test-factory');
  return setupTestFactory(PactTestModule)(...args);
}
