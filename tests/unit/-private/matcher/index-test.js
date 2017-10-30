import Matcher from 'ember-cli-pact/-private/matcher';
import { module, test } from 'qunit';

module('Unit | Matcher', function() {
  test('it records the given name and available version', function(assert) {
    let matcher = new Matcher('test-matcher', 5);
    assert.equal(matcher.name, 'test-matcher');
    assert.equal(matcher.availableVersion, 5);
  });

  test('it raises an error if no serialize() method is defined', function(assert) {
    let matcher = new Matcher();
    assert.throws(() => matcher.serialize(), /subclasses must implement serialize/);
  });
});
