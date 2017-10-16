import { module, test } from 'qunit';
import { uploadInteraction } from 'ember-cli-pact/-private/testing/upload';

module('Unit | upload');

test('a failed upload', function(assert) {
  return uploadInteraction(null, {})
    .then(() => assert.ok(false, 'upload should have failed'))
    .catch((error) => {
      assert.equal(error.message, '[ember-cli-pact] No interaction submitted');
    });
});
