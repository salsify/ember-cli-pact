/* global Testem */

import require from 'require';
import { TestModule } from 'ember-test-helpers';
import { getOwner } from '@ember/application';

import Interaction from './interaction';
import { loadProviderStates } from './provider-states';

export default class PactTestModule extends TestModule {
  constructor(description, callbacks = {}) {
    callbacks.integration = true;

    super('pact:-', description, callbacks);

    this.setupSteps.push(this.setupStore);
    this.setupSteps.push(this.setupInteraction);
    this.setupSteps.push(this.setupProviderStates);
    this.teardownSteps.push(this.teardownInteraction);
  }

  setupStore() {
    this.context.store = () => this.container.lookup('service:store');
  }

  setupInteraction({ test }) {
    let { callbacks, context } = this;
    let provider = callbacks.provider
      ? callbacks.provider.call(context)
      : startMirageIfAvailable(this._env());

    let interaction = Interaction.start(test.testName, provider);

    context.given = (name, params) => interaction.given(name, params);
    context.interaction = (options) => interaction.capture(context, options);
    context.provider = () => provider;
  }

  setupProviderStates() {
    loadProviderStates(this._env());
  }

  teardownInteraction() {
    let interaction = Interaction.assertCurrent();
    let upload = uploadInteraction(interaction);

    interaction.teardown();

    Testem.afterTests((config, data, callback) => upload.then(() => callback()));
  }

  _env() {
    return getOwner(this.context).resolveRegistration('config:environment');
  }
}

function uploadInteraction(interaction) {
  let fetch = self.fetch || require('fetch').default;
  let params = {
    method: 'POST',
    body: JSON.stringify(interaction),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return fetch('/_pact/upload', params)
    .then((result) => result.ok || warn(`Error uploading interaction result: ${result.statusText}`))
    .catch((error) => warn(`Error uploading interaction result: ${error}`));
}

function startMirageIfAvailable(env) {
  try {
    let { startMirage } = require(`${env.modulePrefix}/initializers/ember-cli-mirage`);
    return startMirage();
  } catch (error) {
    // Do nothing
  }
}

function warn(...args) {
  // eslint-disable-next-line no-console
  console.warn(...args);
}
