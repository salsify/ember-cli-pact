/* global Testem */

import require from 'require';
import { TestModule } from 'ember-test-helpers';
import { getOwner } from '@ember/application';

import { uploadInteraction } from './upload-interaction';

export default class PactTestModule extends TestModule {
  constructor(description, callbacks = {}) {
    callbacks.integration = true;

    super('pact:-', description, callbacks);

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
    context.interaction = (options) => provider.specifyInteraction(context, this._normalize(options));

    provider.startInteraction(test.testName);
  }

  teardownProvider() {
    let interaction = this.provider.interaction;
    let upload = uploadInteraction(interaction, {
      provider: this._getConfigValue('providerName'),
      consumer: this._getConfigValue('consumerName')
    });

    this.provider.endInteraction();
    this.provider = null;

    Testem.afterTests((config, data, callback) => upload.then(() => callback()));
  }

  _config() {
    return this.__config || (this.__config = getOwner(this.context).resolveRegistration('config:environment'));
  }

  _getConfigValue(key) {
    return key in this.callbacks ? this.callbacks[key] : this._config()['ember-cli-pact'][key];
  }

  _normalize(details) {
    if (typeof details === 'function') {
      return { perform: details };
    }

    return details;
  }

  _loadMockProvider() {
    let { modulePrefix } = this._config();
    let name = this._getConfigValue('mockProvider');
    return require(`${modulePrefix}/tests/helpers/pact-providers/${name}`).default;
  }
}
