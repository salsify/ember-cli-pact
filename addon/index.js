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
  return getMochaTestFactory()(...args);
}

let mochaTestFactory;
function getMochaTestFactory() {
  if (!mochaTestFactory) {
    let setupTestFactory = require('ember-mocha/setup-test-factory').default;
    let test;
    require('mocha').beforeEach(function() {
      test = { testName: this.currentTest.title };
    });

    mochaTestFactory = setupTestFactory(class extends PactTestModule {
      setupProvider() {
        return super.setupProvider({ test });
      }
    });
  }
  return mochaTestFactory;
}
