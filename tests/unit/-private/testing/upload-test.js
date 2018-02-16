import { module, test } from 'qunit';
import { uploadInteraction } from 'ember-cli-pact/-private/testing/upload';

module('Unit | upload', function() {
  test('a failed upload', function(assert) {
    return uploadInteraction(null, { provider: 'x', version: 'x' })
      .then(() => assert.ok(false, 'upload should have failed'))
      .catch((error) => {
        assert.equal(error.message, '[ember-cli-pact] No interaction submitted');
      });
  });
});
