'use strict';

const fs = require('fs-extra');
const stringify = require('json-stable-stringify');
const difference = require('lodash/difference');
const intersection = require('lodash/intersection');
const debug = require('debug')('ember-cli-pact:test-session');
const PactError = require('./pact-error');

module.exports = class TestSession {
  constructor(id, config) {
    this.id = id;
    this.config = config;
    this.providerInteractions = new Map();
    this.finalized = false;
  }

  addInteraction(data) {
    assert(`Can't add new interactions to a finalized session`, !this.finalized);
    assert(`No interaction submitted`, data.interaction);
    assert(`No version submitted`, data.version);
    debug('Adding interaction "%s" for provider "%s"', data.interaction.description, data.provider);

    let interactions = this._interactionsFor(data.version, data.provider);
    interactions.push(data.interaction);
  }

  finalize() {
    assert(`Can't finalize a session twice`, !this.finalized);
    debug('Finalizing test session');
    this.finalized = true;

    if (this.config.mode === 'write') {
      this._writePacts();
    } else {
      this._verifyPacts();
    }
  }

  _writePacts() {
    let target = this.config.pactsDirectory;
    fs.removeSync(target);
    fs.mkdirpSync(target);

    for (let provider of this.providerInteractions.keys()) {
      fs.writeFileSync(`${target}/${provider}.json`, this._pactStringFor(provider));
    }
  }

  _verifyPacts() {
    let failures = [];
    let actualProviders = Array.from(this.providerInteractions.keys());
    let expectedProviders = fs.readdirSync(this.config.pactsDirectory).map(name => name.replace(/\.json$/, ''));

    for (let extra of difference(actualProviders, expectedProviders)) {
      failures.push(`Unexpected pact: ${extra}.json`);
    }

    for (let missing of difference(expectedProviders, actualProviders)) {
      failures.push(`Missing pact: ${missing}.json`);
    }

    for (let provider of intersection(expectedProviders, actualProviders)) {
      let contents = this._pactStringFor(provider);
      if (fs.readFileSync(`${this.config.pactsDirectory}/${provider}.json`, 'utf-8') !== contents) {
        failures.push(`Changed pact: ${provider}.json`);
      }
    }

    if (failures.length) {
      let message = `Verification failed:\n  - ${failures.join('\n  - ')}`;
      throw new PactError(409, message);
    }
  }

  _pactStringFor(provider) {
    let providerRecord = this.providerInteractions.get(provider);
    let interactions = sortInteractions(providerRecord.interactions);
    let pact = makePact(this.config.consumerName, provider, providerRecord.version, interactions);
    return stringify(pact, { space: 2 }) + '\n';
  }

  _interactionsFor(version, provider) {
    let record = this.providerInteractions.get(provider);
    if (!record) {
      this.providerInteractions.set(provider, record = { version, interactions: [] });
    } else if (record.version !== version) {
      throw new PactError(409, `Received conflicting spec versions for provider ${provider}`);
    }
    return record.interactions;
  }
}

function makePact(consumer, provider, version, interactions) {
  return {
    provider: { name: provider },
    consumer: { name: consumer },
    interactions: interactions,
    metadata: {
      'pactSpecification': {
        version: standardizeVersionNumber(version),
      }
    }
  };
}

function sortInteractions(interactions) {
  return interactions.sort((a, b) => {
    assert(`Duplicate interaction name: '${a.description}'`, a.description !== b.description);
    return a.description < b.description ? -1 : 1;
  });
}

function standardizeVersionNumber(version) {
  return `${Number(version).toFixed(1)}.0`;
}

function assert(message, condition) {
  if (!condition) {
    throw new PactError(400, message);
  }
}
