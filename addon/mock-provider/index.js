import { assert } from '@ember/debug';
import { run } from '@ember/runloop';
import { Promise } from 'rsvp';

import Interaction from 'ember-cli-pact/-private/interaction';
import { loadProviderStates, lookupProviderState } from 'ember-cli-pact/-private/provider-states';

export default class MockProvider {

  constructor(config) {
    this.config = config;
    this.interaction = null;
    this._capturing = false;
  }

  /**
   * Looks up the configured provider state with the given name.
   *
   * @protected
   * @method lookupProviderState
   * @param {string} name
   * @return {ProviderState}
   */
  lookupProviderState(name) {
    loadProviderStates(this.config);
    return lookupProviderState(name);
  }

  /**
   * Begins a new interaction with the given description. Note that only one interaction may be in progress at a time.
   *
   * @public
   * @method startInteraction
   * @param {string} description
   */
  startInteraction(description) {
    assert('This provider already has an interaction in progress', !this.interaction);
    this.interaction = new Interaction(description);
  }

  /**
   * Adds the given provider state to the current interaction.
   *
   * @public
   * @method addState
   * @param {string} name
   * @param {object} [params]
   */
  addState(name, params) {
    this.interaction.addProviderState(name, params);
  }

  /**
   * Specifies details for the current interaction.
   *
   * @public
   * @method specifyInteraction
   * @param {object} context the `this` value for the perform callback
   * @param {object} details a hash of details about expectations for the interaction
   * @param {function} details.perform the callback to be invoked to capture this interaction
   * @param {string} [details.uponReceiving] a description for the current interaction
   * @param {object} [details.withRequest] details about the expected request
   * @param {object} [details.willRespondWith] details about the expected response
   */
  specifyInteraction(context, details) {
    if (details.uponReceiving) {
      this.interaction.description = details.uponReceiving;
    }

    if (details.withRequest) {
      this.interaction.addMatchRules({ request: details.withRequest });
    }

    if (details.willRespondWith) {
      this.interaction.addMatchRules({ response: details.willRespondwith });
    }

    return new Promise((resolve) => {
      this._capturing = true;
      resolve(run(() => details.perform.call(context)));
    }).finally(() => {
      this._capturing = false;
    });
  }

  /**
   * Whether or not this provider is currently capturing interaction details.
   *
   * @protected
   * @method isCapturing
   * @return {boolean}
   */
  isCapturing() {
    return this._capturing;
  }

  /**
   * Ends the current interaction
   *
   * @public
   * @method endInteraction
   */
  endInteraction() {
    assert('This provider has no in-progress interaction', this.interaction);
    this.interaction = null;
  }
}
