'use strict';

const fs = require('fs-extra');
const stringify = require('json-stable-stringify');
const debug = require('debug')('ember-cli-pact:test-session');

module.exports = class TestSession {
  constructor(id, config) {
    this.id = id;
    this.config = config;
    this.providerInteractions = new Map();
    this.finalized = false;
  }

  addInteraction(data) {
    assert(`Can't add new interactions to a finalized session`, !this.finalized);
    debug('Adding interaction "%s" for provider "%s"', data.interaction.description, data.provider);

    let interactions = this._interactionsFor(data.provider);
    interactions.push(data.interaction);
  }

  finalize() {
    assert(`Can't finalize a session twice`, !this.finalized);
    debug('Finalizing test session');

    this.finalized = true;

    let target = this.config.pactsDirectory;

    fs.removeSync(target);
    fs.mkdirpSync(target);

    for (let provider of this.providerInteractions.keys()) {
      let interactions = this.providerInteractions.get(provider).sort((a, b) => {
        assert(`Duplicate interaction name: '${a.description}'`, a.description !== b.description);
        return a.description < b.description ? -1 : 1;
      });

      let pact = makePact(this.config.consumerName, provider, interactions);

      fs.writeFileSync(`${target}/${provider}.json`, stringify(pact, { space: 2 }) + '\n');
    }
  }

  _interactionsFor(provider) {
    let interactions = this.providerInteractions.get(provider);
    if (!interactions) {
      this.providerInteractions.set(provider, interactions = []);
    }
    return interactions;
  }
}

function makePact(consumer, provider, interactions) {
  return {
    provider: { name: provider },
    consumer: { name: consumer },
    interactions: interactions,
    metadata: {
      'pact-specification': {
        version: '3.0.0',
      },
      'ember-cli-pact': {
        version: require('../package.json').version
      }
    }
  };
}

function assert(message, condition) {
  if (!condition) {
    throw new Error(message);
  }
}
