/* global define */

define('ember-cli-qunit', [], function() {
  return {
    __esModule: true,
    start: function() {}
  };
});

define('ember-qunit', [], function() {
  return {
    __esModule: true,
    setResolver: function() {},
    moduleFor: function() {},
    test: function() {},
  };
});

define('qunit', [], function() {
  return {
    __esModule: true,
    isFake: true,
    module: function() {},
    test: function() {}
  };
});
