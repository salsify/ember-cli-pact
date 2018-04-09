import { assert } from '@ember/debug';
import { run } from '@ember/runloop';
// import { getContext } from '@ember/test-helpers';
import { getContext } from 'ember-test-helpers';
import { Promise } from 'rsvp';

import Interaction from 'ember-cli-pact/-private/interaction';
import { loadProviderStates, lookupProviderState } from 'ember-cli-pact/-private/provider-states';

export default class MockProvider {
  constructor(config) {
    this.config = config;
    this.interaction = null;
    this._uploadCallbacks = [];
    this._capturing = false;
  }

  /**
   * Adds a callback that will be invoked before uploading the current interaction.
   * This callback will receive the serialized interaction and may mutate it in place
   * to affect the final data sent to be written/verified.
   *
   * @public
   * @method beforeUpload
   * @param {Function} callback
   */
  beforeUpload(callback) {
    this._uploadCallbacks.push(callback);
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
   * Specifies details for the current interaction.
   *
   * @public
   * @method specifyInteraction
   * @param {object} context the `this` value for the perform callback
   * @param {function} perform the callback to be invoked to capture this interaction
   */
  specifyInteraction(perform) {
    return Promise.resolve().then(() => {
      this._capturing = true;
      return run(() => perform.call(getContext()));
    }).finally(() => {
      this._capturing = false;
    });
  }

  /**
   * Specifies matching rules for the interaction under test.
   *
   * @public
   * @method specifyMatchingRules
   * @param {object} rules
   */
  specifyMatchingRules(rules) {
    this.interaction.addMatchingRules(rules);
  }

  /**
   * Serializes the current interaction to be uploaded, invoking any registered
   * `beforeUpload` callbacks first.
   *
   * @public
   * @method serializeInteraction
   * @param {number} version the Pact specification version to use when serializing
   * @return {object} the serialized interaction
   */
  serializeInteraction(version) {
    let serialized = this.interaction.serialize(version);
    for (let callback of this._uploadCallbacks) {
      callback(serialized);
    }
    return serialized;
  }
}
