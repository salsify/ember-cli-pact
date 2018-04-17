# ember-cli-pact [![Build Status](https://travis-ci.org/salsify/ember-cli-pact.svg?branch=master)](https://travis-ci.org/salsify/ember-cli-pact)

- [Overview](#overview)
  - [What Does a Pact Test Look Like?](#what-does-a-pact-test-look-like)
  - [Terminology](#terminology)
- [Installation](#installation)
- [Usage](#usage)
  - [Writing Pact Tests](#writing-pact-tests)
  - [Provider States](#provider-states)
  - [Matching Rules](#matching-rules)
  - [Write vs Verify](#write-vs-verify)
  - [Customizing Interactions](#customizing-interactions)
  - [Publishing Pacts](#publishing-pacts)
- [Configuration](#configuration)
- [Mock Providers](#mock-providers)
  - [Mirage](#mirage)
  - [Pretender](#pretender)
  - [Custom Mock Providers](#custom-mock-providers)

## Overview

[Pact](https://docs.pact.io) is a family of frameworks for performing [consumer-driven contract testing](https://martinfowler.com/articles/consumerDrivenContracts.html). It allows you to set up interactions between a _consumer_ and a _provider_ (i.e. a client and a server) and then verify them independently.

In concrete terms with an Ember app, it lets you mock your API with tools like [Mirage](https://ember-cli-mirage.com) or [Pretender](https://github.com/pretenderjs/pretender), then verify that your mock API behaves the same way as the real one without forcing you to test your app and your API at the same time!

### What Does a Pact Test Look Like?

Below is an annotated example of a simple Pact test. Note that, while this example uses Ember Data, Mirage and QUnit, you could just as easily write a comparable test with GraphQL, Pretender and Mocha.

```js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact, given, interaction } from 'ember-cli-pact';

module('Pact | People', function(hooks) {
  setupTest(hooks);
  setupPact(hooks, {
    // Specify the names of the provider and consumer whose interactions are being set up.
    // Normally these values would be defaulted from global configuration for your app.
    provider: 'my-api',
    consumer: 'my-app'
  });

  test('locating a person by ID', async function(assert) {
    // Record the state(s) the provider should be in prior to the interaction under test.
    // When verifying the generated pact document against the 'my-api' provider later,
    // its own 'a person exists' state will be invoked with the same parameters.
    given('a person exists', { id: '123', name: 'Alice' });

    // Perform the interaction that this test is intended to record, in this case
    // fetching a particular person record by ID.
    let person = await interaction(() => this.store().findRecord('person', '123'));

    // Verify that the response we received contained the data we expected, and that
    // we interpreted it correctly.
    assert.equal(person.get('id'), '123');
    assert.equal(person.get('name'), 'Alice');
  });
});
```

After running this test, a file `my-api.json` capturing the interaction would be created:

```json
{
  "provider": {
    "name": "my-api"
  },
  "consumer": {
    "name": "my-app"
  },
  "interactions": [
    {
      "description": "locating a person by ID",
      "providerStates": [
        {
          "name": "a person exists",
          "params": {
            "id": "123",
            "name": "Alice"
          }
        }
      ],
      "request": {
        "method": "GET",
        "path": "/people/123",
        "headers": {
          "Accept": "application/vnd.api+json"
        }
      },
      "response": {
        "status": 200,
        "headers": {
          "Content-Type": "application/vnd.api+json"
        },
        "body": {
          "data": {
            "type": "people",
            "id": "123",
            "attributes": {
              "name": "Alice"
            },
            "relationships": {}
          }
        }
      }
    }
  ],
  "metadata": {
    "pact-specification": {
      "version": "3.0.0"
    }
  }
}
```

Additional tests of interactions with this provider would add further elements to the `interactions` array. This Pact contract can be used in your actual API's test suite to verify that its own response to the same request matches. See the [Publishing Pacts](#publishing-pacts) section below for more details on possible workflows for managing shared contracts.

### Terminology
 - A _contract_ is a document describing the expected ways in which a consumer and a provider will interact with one another. A contract is tied to one consumer and one provider, and is composed of one or more interactions.
 - The _consumer_ is the system that initiates requests. In the case of ember-cli-pact, this is typically your Ember app.
 - The _producer_ is the system that fulfills request. In the case of ember-cli-pact, this is typically an HTTP API of some sort.
 - An _interaction_ captures the contents of a request from the consumer and the corresponding response from the provider. They may also include additional matching rules that loosen the definition of what constitutes an acceptable "replay" of that interaction.

## Installation

To get started, run:

```sh
ember install ember-cli-pact
```

Depending on your choice of [mock provider](#mock-providers), you'll likely also want to install either [ember-cli-mirage](https://github.com/samselikoff/ember-cli-mirage) or [ember-cli-pretender](https://github.com/rwjblue/ember-cli-pretender).

## Usage

### Writing Pact Tests

All the contracts your consumer (i.e. Ember app) produces will be driven a set of Pact tests whose sole person is to perform and verify interactions with a mock provider. These tests will typically live within a `tests/pact` directory that is a peer to your other high-level test types (`unit`, `acceptance`, etc.).

You can find a few sample Pact tests in this repository: ([QUnit](tests/pact/people-qunit-test.js) | [Mocha](tests/pact/people-mocha-test.js))

#### Common Test API

Whether in a QUnit `test()` or a Mocha `it()` block, ember-cli-pact exposes the following functions for setting up and recording an interaction:

```js
import { given, interaction, getProvider, specifyMatchingRules } from 'ember-cli-pact';
```

##### `given(name, params)`

Calling `given` adds a requirement for the specified provider state to the interaction under test. Provider states represent scenarios that should be set up prior to verifying the interaction, such as creating a particular record or logging in as a user with particular permissions.

See [Provider States](#provider-states) section below for more details.

##### `interaction(callback)`

Calling `interaction` indicates that the wrapped request represents the interaction you're actually testing. This allows you to perform any other actions (e.g. fetching a record that you plan to test updating) without polluting the resulting contract. Every Pact test should contain exactly one interaction.

Note that `interaction` returns the result of its callback so that you can subsequently verify that the response was interpreted as expected.

```js
let widgets = await interaction(() => store().findAll('widget'));

assert.equal(widgets.get('length'), 3);
assert.deepEqual(widgets.mapBy('name'), ['Foo', 'Bar', 'Baz']);
```

##### `specifyMatchingRules(rules)`

Some interactions may involve data that's impossible to predict. Calling `specifyMatchingRules` specifies a set of rules for the interaction under test dictating what constitutes a successful match when verifying the interaction.

For instance, to ensure the response body has an `id` field the looks roughly like a UUID:

```js
specifyMatchingRules({
  response: {
    body: {
      id: regex(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)
    }
  }
});
```

The [Matching Rules](#matching-rules) section below discusses how and when to use matching rules in more detail.

##### `getProvider()`

The `getProvider` function allows access to the mock provider instance for the current test. See the [Mock Providers](#mock-providers) section below for further details.

#### QUnit Module Setup

Note that this addon relies on the [simplified QUnit testing API](http://rwjblue.com/2017/10/23/ember-qunit-simplication/), meaning it requires your `ember-cli-qunit` version to be at least `4.1.0-beta.2`.

```js
// tests/pact/people-test.js
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupPact, /* ... */ } from 'ember-cli-pact';

module('Pact | People', function(hooks) {
  setupTest(hooks);
  setupPact(hooks, {
    // optional module-specific configuration here
  });

  test('...', function(assert) {
    // ...
  });
});
```

#### Mocha Module Setup

```js
// tests/pact/people-test.js
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { setupPact, /* ... */ } from 'ember-cli-pact';

describe('Pact | People', function() {
  setupTest({ integration: true });
  setupPact({
    // optional module-specific configuration here
  });

  it('...', function() {
    // ...
  });
});
```

### Provider States

Provider states are named scenarios that the provider and consumer have an agreed-upon understanding of. They allow you to specify what kind of state the provider needs to be in before verifying a given interaction.

In the "people API" examples above, for instance, we reference an `'a person exists'` provider state that takes `id` and `name` parameters. This provider state allows the consumer to ensure that a person record with the given details exists prior to actually testing the given interaction.

By default, calling `given(name, params)` only adds a record of the desired provided state to the interaction under test, but some mock providers may also take calls to `given` into account. For instance, the [Mirage mock provider](#mirage) expects you to register a callback that will be executed when a given provider state is added, allowing you to make the corresponding change to your Mirage server state, e.g. `server.create('person', params)`.

*Note*: version 2 of the Pact Specification only allows for a single provider state per interaction, and it doesn't support supplying parameters to that state. Given this, if you're working with a provider that verifies using Pact v2, you may need to have a larger set of provider states that encode specific hard coded information in their description.

### Matching Rules

Some interactions may involve data that's impossible to make static, like a generated ID for a newly-created record or a timestamp. For cases like these, replaying the same interaction may validly produce a slightly different result every time.

To account for this, Pact allows for defining a set of matching rules for various elements of an interaction. You can import and call `specifyMatchingRules(...)` in any Pact test to add matching rules to the current interaction, and the [Mirage mock provider](#mirage) also allows you to generate matching rules for parts of the response body that correspond to model attributes.

#### Matchable Interaction Elements

A fully-specified set of matching rules for an interaction might look something like this:

```js
specifyMatchingRules({
  request: {
    path: /* matcher for the request path */,
    query: {
      paramA: /* matcher for the values of query param A */,
      paramB: /* matcher for the values of query param B */
    },
    header: {
      headerA: /* matcher for the value of request header A */,
      headerB: /* matcher for the value of request header B */
    },
    body: {
      some: {
        value: /* matcher for body.some.value */,
        array: [
          /* matcher for the first element of body.some.array */,
          /* matcher for the second element of body.some.array */
        ]
      }
    }
  },
  response: {
    header: {
      headerA: /* matcher for the value of response header A */,
      headerB: /* matcher for the value of response header B */
    },
    body: {
      some: {
        value: /* matcher for body.some.value */,
        array: [
          /* matcher for the first element of body.some.array */,
          /* matcher for the second element of body.some.array */
        ]
      }
    }
  }
});
```

Note that every element of this structure is optional; you can specify rules for any individual piece of the interaction alone.

#### Matchers

Pact provides several possible matchers to determine exactly how tested request/response elements compare to the recorded ones. All matchers are available to be imported from the module `'ember-cli-pact/matchers'`.

 - `type()`: matches if the expected and actual value have the same type (e.g. both are strings, or both numbers, etc.)
   - `type({ min })`: matches if the expected and actual value have the same type, and if that value represents a collection, that it has at least `min` elements
   - `type({ max })`: matches if the expected and actual value have the same type, and if that value represents a collection, that it has at most `max` elements
 - `regex(regexpOrString)`: matches if the actual value matches the given regular expression, which is either a string or a `RegExp` instance
 - `equality()`: matches if the actual and expected values are structurally equal (`'abc'` equals `'abc'`, `[1, 2, 3]` equals `[1, 2, 3]`, etc.). This is the default matching behavior.
 - `integer()`: matches if the actual value is an integer
 - `decimal()`: matches if the actual value is a decimal number (i.e. has decimal places)
 - `allOf([matcher1, matcher2, ...])`: matches if the actual value matches *all* of the given matchers
 - `anyOf([matcher1, matcher2, ...])`: matches if the actual value matches *any* of the given matchers
 - `arrayElements(matcher)`: matches if all elements of the actual array value match the given matcher
 - `hashValues(matcher)`: matches if all children of the actual hash value match the given matcher

### Write vs Verify

Pact tests can be run in one of two modes: `write` or `verify`.

When running in `write` mode, all preexisting contracts will be removed and the results of the test run will be written in their place. This is the default when running tests locally.

When running in `verify` mode, no new contracts will be written. Instead, the test server will verify that all generated contracts match the previously written ones on disk, failing the test suite otherwise. This is the default when running in CI (e.g. Travis or Circle).

The Pact mode can be overwritten via [a configuration option](#configuration) or the `PACT_MODE` environment variable, e.g.

```sh
PACT_MODE=verify ember test
```

### Customizing Recorded Interactions

Before the details of an interaction are uploaded to the test server to be written or verified, you may wish to tweak the payload. The [mock provider](#mock-providers) provides a `beforeUpload` hook that you can use to accomplish this.

The provided callback will receive a JSON representation of the interaction that you can tweak however you like. For instance, if you wish to exclude a certain request header from being recorded for a test, you could write:

```js
getProvider().beforeUpload((interaction) => {
  delete interaction.request.headers['X-Dont-Save-Me'];
});
```

If you wanted to do this for every single interaction in your test suite, you could implement a [custom mock provider](#custom-mock-providers):

```js
export default class SecretiveProvider extends SomeBaseProvider {
  constructor() {
    super(...arguments);
    this.beforeUpload((interaction) => {
      delete interaction.request.headers['X-Dont-Save-Me'];
    });
  }
}
```

### Publishing Pacts

Pact verification can be run against contracts persisted in a number of places, including as files on disk, in a git remote, or from a Web server. One commonly used option, however, is a [Pact Broker](https://github.com/pact-foundation/pact_broker).

The Pact Broker provides APIs for managing published contracts, tagging particular versions for use as provider testing targets, and firing webhooks to trigger a test suite when a contract is updated. It also provides bells and whistles like autogenerated network diagrams among your consumers and providers and repo badges to easily monitor contract verification state.

Before ember-cli-pact reaches a stable 1.0 release, the intent is to expose an ember-cli command for publishing the generated contracts to a Pact Broker.

## Configuration

The primary means of configuring ember-cli-pact is by defining an `ember-cli-pact` key in your `config/environment.js` containing a hash of the options here. In most cases, you can also pass overriding values for these options on a per-test basis `setupPact`.

 - `enabled`: whether ember-cli-pact and its dependencies should be included in the build; defaults to `true` except when the build environment is `production`
 - `providerName`: the name of the provider under test
 - `consumerName`: the name of the consumer (i.e. your app) under test; defaults to the ember-cli project name
 - `mockProvider`: the name of the mock provider that should be started up for each Pact test (see the [Mock Providers](#mock-providers) section below); defaults to `'mirage'`
 - `serviceInjections`: an array of service names that should be made available as a method of the same name in your Pact tests; defaults to `['store']`
 - `pactsDirectory`: the location relative to the project root where contract files should be written; defaults to `'pacts'`
 - `mode`: the [write/verify mode](#write-vs-verify) ember-cli-pact should operate in; defaults to the value of the `PACT_MODE` environment variable if present, others `'write'` in development and `'verify'` in CI environments like Travis or Circle
 - `pactVersion`: the version of the Pact specification that should be used; defaults to `3` (the only other currently supported value is `2`)

## Mock Providers

All Pact tests are powered by a mock provider, which is responsible for capturing the details of the interaction that will ultimately be recorded. Out of the box, ember-cli-pact ships with mock provider implementations for Pretender and Mirage, but it's also possible to customize these or build your own.

### Pretender

The Pretender mock provider is fairly lightweight; it starts and stops [a Pretender mock server](https://github.com/pretenderjs/pretender) for each Pact test, and exposes a way to [map request handlers](https://github.com/pretenderjs/pretender#the-server-dsl) for that server.

To add handlers to the provider, call `map()` on it:

```js
import { getProvider, interaction } from 'ember-cli-pact';

// ...

getProvider().map((server) => {
  server.get('/test-route', () => [200, {}, 'ok']);
});

let response = await interaction(() => $.get('/test-route'));

assert.equal(response, 'ok');
```

### Mirage

The Mirage mock provider integrates with [ember-cli-mirage](https://github.com/samselikoff/ember-cli-mirage) to simplify the process of managing mock resources and matching rules.

#### The `PactEnabled` Serializer Mixin

To enable the Mirage mock provider, you'll need to wrap your Mirage application serializer with the `PactEnabled` mixin:

```js
// mirage/serializers/application.js
import { MyBaseSerializer } from 'ember-cli-mirage';
import { PactEnabled } from 'ember-cli-pact/mock-provider/mirage';

export default PactEnabled(MyBaseSerializer).extend({

});

// or, with ES6 syntax:

export default class ApplicationSerializer extends PactEnabled(MyBaseSerializer) {

}
```

#### Provider States

The Mirage mock provider requires that all provider states be declared using the `providerState` helper. Provider state definitions will be loaded from all modules `tests/helpers/pact-provider-states`, so within that directory you can organize them however you see fit.

When you activate a provider state with `given()`, the configured callback for that state will be invoked with the running Mirage server in order for the server to be set up in that state.

For instance, the `'a person exists'` provider state described above could be declared like this:

```js
// tests/helpers/pact-provider-states/people.js
import { providerState } from 'ember-cli-pact';

providerState('a person exists', (server, { id, name }) => {
  server.create('person', { id, name });
});
```

Then, when a test adds a requirement for the `'a person exists'` provider state, the Mirage server will automatically be ready to serve the corresponding person record.

If you ever need to simulate a request failure (such as `500` status code request), you could do something like:

```js
import { Response } from 'ember-cli-mirage';
import { getProvider, providerState } from 'ember-cli-pact';

providerState('api returns an error', (server, { statusCode, headers, errors }) => {
  // this could also get `server.get`
  server.post('/url/that/would/fail', (schema, request) => {
    // because we do not create a new Mirage model, we will
    // avoid `serialize` hook altogether.
    // calling `recordRequest` manually to make sure
    // the interaction is captured
    getProvider().recordRequest(request);
    return new Response(statusCode, headers, { errors });
  });
});
```

#### Model Attribute Matching Rules

Mirage models can expose matching rules for attributes of those models wherever they appear in a response payload by defining a static `matchingRules` property on the model class.

For instance, supposing our `Person` model has a `createdAt` attribute that will vary in the real provider responses, the following would ensure that any `Person` payloads appearing in a response would have the appropriate matching rule configured:

```js
export default Model.extend({}, {
  matchingRules: {
    createdAt: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  }
});

// or, with ES6 class syntax and the class fields proposal:

export default class PersonModel extends Model {
  static matchingRules = {
    createdAt: regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  }
}
```

#### Request/Response Matching Rules

To provide general matching rules for a given request, you can define a `getMatchingRules(request, serialized)` method. This method will receive the Pretender `FakeRequest` object and the serialized data for the response, and should return a hash of matching rules in the same format as the `matchingRules()` test method expects.

Note that `getMatchingRules()` will be invoked on the root serializer for a given request, so defining the method on the `application` serializer would apply to every response, while defining it on the `person` serializer would only generate matching rules for requests whose primary payloads were `Person` instances.

Matching rules returned from `getMatchingRules()` will be merged with any body rules generated based on model attributes.

### Custom Mock Providers

To specify a custom mock provider, define a class in `tests/helpers/pact-providers/<name>`, and then set `mockProvider: '<name>'` in your ember-cli-pact configuration. This class should extend the [`MockProvider`](addon/mock-provider/index.js) class exported from `ember-cli-pact/mock-provider`, and may override any of the methods defined there.

You can also customize the behavior of the built-in `pretender` and `mirage` providers by defining custom providers with the same name that extend from the base implementations, available at `ember-cli-pact/mock-provider/{pretender,mirage}`.
