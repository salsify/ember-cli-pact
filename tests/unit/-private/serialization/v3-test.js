import { module, test } from 'qunit';
import serializeV3 from 'ember-cli-pact/-private/serialization/v3';
import { type, equality } from 'ember-cli-pact/matchers';

module('Unit | Serialization | v3', function() {
  test('serializing path and query params', function(assert) {
    let pact = serializeV3({
      captured: { url: '/foo/bar?baz=qux&a=b&a=c' }
    });

    assert.equal(pact.request.path, '/foo/bar');
    assert.deepEqual(pact.request.query, {
      baz: ['qux'],
      a: ['b', 'c']
    });

    pact = serializeV3({
      captured: { url: '/a/b/c' }
    });

    assert.equal(pact.request.path, '/a/b/c');
    assert.equal('query' in pact.request, false);
  });

  test('serializing request method', function(assert) {
    let pact = serializeV3({
      captured: {
        url: '',
        method: 'GET'
      }
    });

    assert.equal(pact.request.method, 'GET');
  });

  test('serializing respone status', function(assert) {
    let pact = serializeV3({
      captured: {
        url: '',
        status: 200
      }
    });

    assert.equal(pact.response.status, 200);
  });

  test('serializing description and provider states', function(assert) {
    let pact = serializeV3({
      captured: { url: '' },
      description: 'my test interaction',
      providerStates: [
        { name: 'one', params: { a: 1 } },
        { name: 'two', params: {} }
      ]
    });

    assert.equal(pact.description, 'my test interaction');
    assert.deepEqual(pact.providerStates, [
      { name: 'one', params: { a: 1 } },
      { name: 'two', params: {} }
    ]);
  });

  test('serializing request/response bodies', function(assert) {
    let pact = serializeV3({
      captured: {
        url: '',
        requestBody: '',
        responseText: ''
      }
    });

    assert.equal('body' in pact.request, false);
    assert.equal('body' in pact.response, false);

    pact = serializeV3({
      captured: {
        url: '',
        requestBody: '[1, 2, 3]',
        responseText: '"hello"'
      }
    });

    assert.deepEqual(pact.request.body, [1, 2, 3]);
    assert.deepEqual(pact.response.body, 'hello');
  });

  test('serializing header matching rules', function(assert) {
    let pact = serializeV3({
      captured: { url: '' },
      matchingRules: [{
        request: {
          header: {
            'Accept': type()
          }
        },
        response: {
          // Should accept either `header` or `headers`
          headers: {
            'Content-Type': type()
          }
        }
      }]
    });

    assert.deepEqual(pact.request.matchingRules.header, {
      'Accept': {
        matchers: [{ match: 'type' }]
      }
    });

    assert.deepEqual(pact.response.matchingRules.header, {
      'Content-Type': {
        matchers: [{ match: 'type' }]
      }
    });

    assert.throws(() => {
      serializeV3({
        captured: { url: '' },
        matchingRules: [{
          request: { headers: {}, header: {} }
        }]
      });
    }, /conflicting matching rules/i)

    assert.throws(() => {
      serializeV3({
        captured: { url: '' },
        matchingRules: [{
          request: {
            headers: {
              'Accept': [type()]
            }
          }
        }]
      });
    }, /must be for a simple value/i);
  });

  test('serializing path matching rules', function(assert) {
    let pact = serializeV3({
      captured: { url: '' },
      matchingRules: [{
        request: { path: type() }
      }]
    });

    assert.deepEqual(pact.request.matchingRules.path, {
      matchers: [{ match: 'type' }]
    });
  });

  test('serializing query matching rules', function(assert) {
    let pact = serializeV3({
      captured: { url: '' },
      matchingRules: [{
        request: {
          query: {
            a: type(),
            b: equality()
          }
        }
      }]
    });

    assert.deepEqual(pact.request.matchingRules.query, {
      a: { matchers: [{ match: 'type' }] },
      b: { matchers: [{ match: 'equality' }] }
    });
  });

  test('serializing body matching rules', function(assert) {
    let pact = serializeV3({
      captured: { url: '' },
      matchingRules: [
        {
          request: {
            body: {
              foo: [type(), equality()]
            }
          }
        },
        {
          response: {
            body: type()
          }
        },
        {
          request: {
            body: {
              bar: type()
            }
          }
        }
      ]
    });

    assert.deepEqual(pact.response.matchingRules.body, {
      '$': { matchers: [{ match: 'type' }] }
    });

    assert.deepEqual(pact.request.matchingRules.body, {
      '$.foo[0]': { matchers: [{ match: 'type' }] },
      '$.foo[1]': { matchers: [{ match: 'equality' }] },
      '$.bar': { matchers: [{ match: 'type' }] }
    });
  });
});
