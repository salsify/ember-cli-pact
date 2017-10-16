import require from 'require';
import PactTestModule from './pact-test-module';

// QUnit-style moduleFor hook
export function moduleForPact(name, description, callbacks) {
  // Hook for our own tests to determine which test framework we're mocking
  if (require('qunit').isFake) return;

  if (typeof description === 'object' && !callbacks) {
    callbacks = description;
    description = name;
  }

  callbacks = callbacks || {};

  let { createModule } = require('ember-qunit/qunit-module');
  return createModule(PactTestModule, name, description, callbacks);
}

// Mocha-style setupTest hook
export function setupPactTest(...args) {
  let { beforeEach } = require('mocha');
  let setupTestFactory = require('ember-mocha/setup-test-factory').default;
  let test;

  beforeEach(function() {
    test = { testName: this.currentTest.title };
  });

  let factory = setupTestFactory(class extends PactTestModule {
    setupProvider() {
      return super.setupProvider({ test });
    }
  });

  return factory(...args);
}
