import { module, test } from 'qunit';
import serializeV2 from 'ember-cli-pact/-private/serialization/v2';
import { type, regex } from 'ember-cli-pact/matchers';

module('Unit | Serialization | v2', function() {
  test('serializing path and query params', function(assert) {
    let pact = serializeV2({
      captured: { url: '/foo/bar?baz=qux&a=b&a=c' }
    });

    assert.equal(pact.request.path, '/foo/bar');
    assert.deepEqual(pact.request.query, {
      baz: ['qux'],
      a: ['b', 'c']
    });

    pact = serializeV2({
      captured: { url: '/a/b/c' }
    });

    assert.equal(pact.request.path, '/a/b/c');
    assert.equal('query' in pact.request, false);
  });

  test('serializing request method', function(assert) {
    let pact = serializeV2({
      captured: {
        url: '',
        method: 'GET'
      }
    });

    assert.equal(pact.request.method, 'GET');
  });

  test('serializing respone status', function(assert) {
    let pact = serializeV2({
      captured: {
        url: '',
        status: 200
      }
    });

    assert.equal(pact.response.status, 200);
  });

  test('serializing description and provider states', function(assert) {
    let pact = serializeV2({
      captured: { url: '' },
      description: 'my test interaction',
      providerStates: [{ name: 'one', params: {} }]
    });

    assert.equal(pact.description, 'my test interaction');
    assert.deepEqual(pact.providerState, 'one');

    assert.throws(() => serializeV2({
      captured: { url: '' },
      description: 'my test interaction',
      providerStates: [{ name: 'one', params: { foo: true } }]
    }), /parameterized provider state/);

    assert.throws(() => serializeV2({
      captured: { url: '' },
      description: 'my test interaction',
      providerStates: [
        { name: 'one', params: {} },
        { name: 'two', params: {} }
      ]
    }), /single provider state/);
  });

  test('serializing request/response bodies', function(assert) {
    let pact = serializeV2({
      captured: {
        url: '',
        requestBody: '',
        responseText: ''
      }
    });

    assert.equal('body' in pact.request, false);
    assert.equal('body' in pact.response, false);

    pact = serializeV2({
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
    let pact = serializeV2({
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

    assert.deepEqual(pact.request.matchingRules, {
      '$.headers.Accept': { match: 'type' }
    });

    assert.deepEqual(pact.response.matchingRules, {
      '$.headers.Content-Type': { match: 'type' }
    });
  });

  test('serializing path matching rules', function(assert) {
    let pact = serializeV2({
      captured: { url: '' },
      matchingRules: [{
        request: { path: type() }
      }]
    });

    assert.deepEqual(pact.request.matchingRules, {
      '$.path': { match: 'type' }
    });
  });

  test('serializing query matching rules', function(assert) {
    assert.throws(() => {
      serializeV2({
        captured: { url: '' },
        matchingRules: [{
          request: {
            query: {}
          }
        }]
      });
    }, /matching rules for query params/);
  });

  test('serializing body matching rules', function(assert) {
    let pact = serializeV2({
      captured: { url: '' },
      matchingRules: [
        {
          request: {
            body: {
              foo: [type(), regex(/abc/)]
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

    assert.deepEqual(pact.response.matchingRules, {
      '$.body': { match: 'type' }
    });

    assert.deepEqual(pact.request.matchingRules, {
      '$.body.foo[0]': { match: 'type' },
      '$.body.foo[1]': { match: 'regex', regex: 'abc' },
      '$.body.bar': { match: 'type' }
    });
  });
});
