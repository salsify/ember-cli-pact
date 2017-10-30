import { module, test } from 'qunit';
import { serializeMatchingRules } from 'ember-cli-pact/-private/serialization';
import { type, equality, regex, integer, decimal, allOf, anyOf, arrayElements, hashValues } from 'ember-cli-pact/matchers';

module('Unit | matching-rules', function() {
  test('type()', function(assert) {
    assert.throws(() => serializeMatchingRules(1, type()), /type matcher is unavailable in pact v1/i);

    assert.deepEqual(serializeMatchingRules(2, type()), {
      '$': {
        matchers: [{ match: 'type' }]
      }
    });

    assert.deepEqual(serializeMatchingRules(2, type({ min: 3 })), {
      '$': {
        matchers: [{ match: 'type', min: 3 }]
      }
    });

    assert.deepEqual(serializeMatchingRules(2, type({ max: 5 })), {
      '$': {
        matchers: [{ match: 'type', max: 5 }]
      }
    });

    assert.deepEqual(serializeMatchingRules(2, type({ min: 1, max: 10 })), {
      '$': {
        matchers: [{ match: 'type', min: 1, max: 10 }]
      }
    });

    assert.deepEqual(serializeMatchingRules(2, type({ foo: 'bar' })), {
      '$': {
        matchers: [{ match: 'type' }]
      }
    });
  });

  test('equality()', function(assert) {
    assert.throws(() => serializeMatchingRules(2, equality()), /equality matcher is unavailable in pact v2/i);

    assert.deepEqual(serializeMatchingRules(3, equality()), {
      '$': {
        matchers: [{ match: 'equality' }]
      }
    })
  });

  test('regex()', function(assert) {
    assert.throws(() => serializeMatchingRules(1, regex(/abc/)), /regex matcher is unavailable in pact v1/i);

    assert.deepEqual(serializeMatchingRules(2, regex('a(b)c')), {
      '$': {
        matchers: [{ match: 'regex', regex: 'a(b)c' }]
      }
    });

    assert.deepEqual(serializeMatchingRules(2, regex(/a'b/)), {
      '$': {
        matchers: [{ match: 'regex', regex: 'a\'b' }]
      }
    });

    assert.throws(() => regex(/ab/i), /specifying flags/);
    assert.throws(() => regex({}), /RegExp instance or a string/);
  });

  test('integer()', function(assert) {
    assert.throws(() => serializeMatchingRules(2, integer()), /integer matcher is unavailable in pact v2/i);

    assert.deepEqual(serializeMatchingRules(3, integer()), {
      '$': {
        matchers: [{ match: 'integer' }]
      }
    });
  });

  test('decimal()', function(assert) {
    assert.throws(() => serializeMatchingRules(2, decimal()), /decimal matcher is unavailable in pact v2/i);

    assert.deepEqual(serializeMatchingRules(3, decimal()), {
      '$': {
        matchers: [{ match: 'decimal' }]
      }
    });
  });

  test('arrays', function(assert) {
    assert.deepEqual(serializeMatchingRules(3, [type(), equality()]), {
      '$[0]': {
        matchers: [{ match: 'type' }]
      },
      '$[1]': {
        matchers: [{ match: 'equality' }]
      }
    });
  });

  test('objects', function(assert) {
    let rule = {
      a: type(),
      b: equality()
    };

    assert.deepEqual(serializeMatchingRules(3, rule), {
      '$.a': {
        matchers: [{ match: 'type' }]
      },
      '$.b': {
        matchers: [{ match: 'equality' }]
      }
    });
  });

  test('arrayElements()', function(assert) {
    assert.throws(() => serializeMatchingRules(1, arrayElements()), /arrayElements matcher is unavailable in pact v1/i);

    assert.deepEqual(serializeMatchingRules(2, arrayElements(type())), {
      '$[*]': {
        matchers: [{ match: 'type' }]
      }
    });

    assert.deepEqual(serializeMatchingRules(2, arrayElements({ a: regex(/a/), b: type() })), {
      '$[*].a': {
        matchers: [{ match: 'regex', regex: 'a' }]
      },
      '$[*].b': {
        matchers: [{ match: 'type' }]
      }
    });
  });

  test('hashValues()', function(assert) {
    assert.throws(() => serializeMatchingRules(1, hashValues()), /hashValues matcher is unavailable in pact v1/i);

    assert.deepEqual(serializeMatchingRules(2, hashValues(type())), {
      '$.*': {
        matchers: [{ match: 'type' }]
      }
    });

    assert.deepEqual(serializeMatchingRules(2, hashValues({ a: regex(/a/), b: type() })), {
      '$.*.a': {
        matchers: [{ match: 'regex', regex: 'a' }]
      },
      '$.*.b': {
        matchers: [{ match: 'type' }]
      }
    });
  });

  test('allOf()', function(assert) {
    let rule = allOf([type(), regex(/a/)]);

    assert.throws(() => serializeMatchingRules(2, rule), /allOf matcher is unavailable in pact v2/i);

    assert.deepEqual(serializeMatchingRules(3, rule), {
      '$': {
        matchers: [
          { match: 'type' },
          { match: 'regex', regex: 'a' }
        ]
      }
    });
  });

  test('anyOf()', function(assert) {
    let rule = anyOf([integer(), decimal()]);

    assert.throws(() => serializeMatchingRules(2, rule), /anyOf matcher is unavailable in pact v2/i);

    assert.deepEqual(serializeMatchingRules(3, rule), {
      '$': {
        matchers: [
          { match: 'integer' },
          { match: 'decimal' }
        ],
        combine: 'OR'
      }
    });
  });

  test('anyOf()/allOf() combinations', function(assert) {
    assert.deepEqual(serializeMatchingRules(3, allOf([integer(), allOf([type(), equality()])])), {
      '$': {
        matchers: [
          { match: 'integer' },
          { match: 'type' },
          { match: 'equality' }
        ]
      }
    });

    assert.deepEqual(serializeMatchingRules(3, anyOf([equality(), anyOf([integer(), decimal()])])), {
      '$': {
        matchers: [
          { match: 'equality' },
          { match: 'integer' },
          { match: 'decimal' }
        ],
        combine: 'OR'
      }
    });

    assert.throws(() => serializeMatchingRules(3, allOf([integer(), anyOf([type(), equality()])])), /Conflict/);
    assert.throws(() => serializeMatchingRules(3, anyOf([integer(), allOf([type(), equality()])])), /Conflict/);
  });

  test('final boss', function(assert) {
    let rule = {
      animals: allOf([
        type({ min: 1 }),
        arrayElements(allOf([
          hashValues(type()),
          {
            offspring: allOf([
              type({ min: 3 }),
              arrayElements(hashValues(allOf([
                type(),
                {
                  name: equality()
                }
              ])))
            ])
          }
        ]))
      ])
    };

    assert.deepEqual(serializeMatchingRules(3, rule), {
      '$.animals': {
        matchers: [{ match: 'type', min: 1 }]
      },
      '$.animals[*].*': {
        matchers: [{ match: 'type' }]
      },
      '$.animals[*].offspring': {
        matchers: [{ match: 'type', min: 3 }]
      },
      '$.animals[*].offspring[*].*': {
        matchers: [{ match: 'type' }]
      },
      '$.animals[*].offspring[*].*.name': {
        matchers: [{ match: 'equality' }]
       }
    });
  });
});
