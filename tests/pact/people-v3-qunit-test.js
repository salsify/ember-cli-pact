import { test, module } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact, given, interaction } from 'ember-cli-pact';
import { run } from '@ember/runloop';

module('Pact | People', function(hooks) {
  setupTest(hooks);
  setupPact(hooks);

  test('listing people', async function(assert) {
    given('a department exists', { id: '1', name: 'People' });
    given('a person exists', { id: '1', name: 'Alice', departmentId: '1' });
    given('a person exists', { id: '2', name: 'Bob', departmentId: '1' });

    let people = await interaction(() => this.store().findAll('person'));

    assert.deepEqual([...people.mapBy('id')], ['1', '2']);
    assert.deepEqual([...people.mapBy('name')], ['Alice', 'Bob']);
    assert.deepEqual([...people.mapBy('department.name')], ['People', 'People']);
  });

  test('querying people', async function(assert) {
    given('a person exists', { id: '1', name: 'Alice' });
    given('a person exists', { id: '2', name: 'Bob' });

    let people = await interaction(() => this.store().query('person', { name: 'Bob' }));

    assert.equal(people.get('length'), 1);
    assert.equal(people.get('firstObject.id'), '2');
    assert.equal(people.get('firstObject.name'), 'Bob');
  });

  test('fetching a person by ID', async function(assert) {
    given('a person exists', { id: '1', name: 'Alice' });

    let person = await interaction(() => this.store().findRecord('person', '1'));

    assert.equal(person.get('id'), '1');
    assert.equal(person.get('name'), 'Alice');
  });

  test('updating a person', async function(assert) {
    given('a person exists', { id: '1', name: 'Alice' });

    let person = await run(() => this.store().findRecord('person', '1'));

    await interaction(() => {
      person.set('name', 'Alicia');
      return person.save();
    });

    assert.equal(person.get('name'), 'Alicia');
  });
});
