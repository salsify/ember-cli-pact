/* global Testem */

import require from 'require';
import { TestModule } from 'ember-test-helpers';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { camelize } from '@ember/string';
import { Promise } from 'rsvp'

import { uploadInteraction, finalize } from './upload';

export default class PactTestModule extends TestModule {
  constructor(name, description, callbacks) {
    if (typeof description === 'object' && !callbacks) {
      callbacks = description;
      description = null;
    } else {
      callbacks = callbacks || {};
    }

    callbacks.integration = true;

    super('pact:-', description || name, callbacks);

    this.setupSteps.push(this.setupServices);
    this.setupSteps.push(this.setupProvider);
    this.teardownSteps.push(this.teardownProvider);
  }

  setupServices() {
    for (let service of this._getConfigValue('serviceInjections')) {
      this.context[camelize(service)] = () => this.container.lookup(`service:${service}`);
    }
  }

  setupProvider({ test }) {
    let { context } = this;
    let MockProvider = this._loadMockProvider();
    let provider = this.provider = new MockProvider(this._config());

    this._assertSingleConsumerName();

    context.provider = () => provider;
    context.given = (name, params) => provider.addState(name, params);
    context.interaction = (perform) => provider.specifyInteraction(context, perform);
    context.matchingRules = (rules) => provider.specifyMatchingRules(rules);

    provider.startInteraction(test.testName);
  }

  teardownProvider() {
    let interaction = this.provider.interaction.serialize(this._getConfigValue('pactVersion'));
    let upload = uploadInteraction(interaction, {
      provider: this._getConfigValue('providerName'),
      consumer: this._getConfigValue('consumerName')
    });

    addUpload(upload);
    registerFinalizeCallback();

    this.provider.endInteraction();
    this.provider = null;
  }

  _config() {
    return this.__config || (this.__config = getOwner(this.context).resolveRegistration('config:environment'));
  }

  _getConfigValue(key) {
    return key in this.callbacks ? this.callbacks[key] : this._config()['ember-cli-pact'][key];
  }

  _loadMockProvider() {
    let { modulePrefix } = this._config();
    let name = this._getConfigValue('mockProvider');
    return require(`${modulePrefix}/tests/helpers/pact-providers/${name}`).default;
  }

  _assertSingleConsumerName() {
    let localConsumerName = this.callbacks.consumerName;
    let globalConsumerName = this._config()['ember-cli-pact'].consumerName;
    let hasOverriddenConsumer = localConsumerName && localConsumerName !== globalConsumerName;
    assert(`ember-cli-pact doesn't currently support testing multiple consumers`, !hasOverriddenConsumer);
  }
}

let addedFinalizeCallback = false;
let uploads = [];

function addUpload(upload) {
  uploads.push(upload);
  upload.then(() => uploads.splice(uploads.indexOf(upload), 1));
}

function registerFinalizeCallback() {
  if (!addedFinalizeCallback) {
    addedFinalizeCallback = true;

    // istanbul ignore next: runs after coverage has been reported
    Testem.afterTests((config, data, callback) => {
      Promise.all(uploads)
        .then(() => finalize())
        .catch((error) => setTimeout(() => { throw error; }))
        .then(() => setTimeout(callback));
    });
  }
}
