/* global Testem */

import require from 'require';
import { TestModule } from 'ember-test-helpers';
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { Promise } from 'rsvp'

import { uploadInteraction, finalize } from './upload';

export default class PactTestModule extends TestModule {
  constructor(name, description, callbacks) {
    if (!callbacks && typeof description === 'object') {
      callbacks = description;
      description = null;
    }

    callbacks.integration = true;

    super('pact:-', description || name, callbacks);

    assert(`ember-cli-pact doesn't currently support testing multiple consumers`, !callbacks.consumerName);

    this.setupSteps.push(this.setupStore);
    this.setupSteps.push(this.setupProvider);
    this.teardownSteps.push(this.teardownProvider);
  }

  setupStore() {
    this.context.store = () => this.container.lookup('service:store');
  }

  setupProvider({ test }) {
    let { context } = this;
    let MockProvider = this._loadMockProvider();
    let provider = this.provider = new MockProvider(this._config());

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
