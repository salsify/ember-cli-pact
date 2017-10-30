import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

module('Integration | Mock Provider | Mirage', function(hooks) {
  setupTest(hooks);

  test('Mirage requests work when no mock provider is active', function(assert) {
    let server = startMirage();
    let store = this.owner.lookup('service:store');

    server.createList('person', 2);

    return store.findAll('person')
      .then((people) => {
        assert.equal(people.get('length'), 2);
        server.shutdown();
      });
  });
});
