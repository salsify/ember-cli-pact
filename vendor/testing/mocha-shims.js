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
    isFake: true,
    it: function() {},
    describe: function() {}
  };
});

define('ember-mocha', [], function() {
  return {
    __esModule: true,
    setupTest: function() {}
  };
});
