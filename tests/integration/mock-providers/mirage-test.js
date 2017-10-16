import { moduleFor, test } from 'ember-qunit';
import { getOwner } from '@ember/application';
import { startMirage } from 'dummy/initializers/ember-cli-mirage';

moduleFor('mock-provider:mirage', 'Integration | Mock Provider | Mirage', {
  integration: true
});

test('Mirage requests work when no mock provider is active', function(assert) {
  let server = startMirage();
  let store = getOwner(this).lookup('service:store');

  server.createList('person', 2);

  return store.findAll('person')
    .then((people) => {
      assert.equal(people.get('length'), 2);
      server.shutdown();
    });
});
