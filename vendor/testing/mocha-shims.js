/* global define */

define('chai', [], function() {
  return {
    __esModule: true,
    assert: {},
  };
});

define('mocha', [], function() {
  return {
    __esModule: true,
    it: function() {},
    describe: function() {}
  };
});

define('ember-mocha', [], function() {
  return {
    __esModule: true,
    setResolver: function() {}
  };
});

define('ember-mocha/setup-test-factory', [], function() {
  return {
    __esModule: true,
    default: function() {}
  };
});
