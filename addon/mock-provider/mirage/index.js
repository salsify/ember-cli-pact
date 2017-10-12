import require from 'require';
import { assert } from '@ember/debug';
import MockProvider from 'ember-cli-pact/mock-provider';

let activeProvider = null;

export default class MirageProvider extends MockProvider {
  static current() {
    return activeProvider;
  }

  constructor() {
    super(...arguments);
    this.server = null;
  }

  startInteraction() {
    super.startInteraction(...arguments);
    this._activate();
    this._startServer();
  }

  addState(name, params) {
    super.addState(...arguments);

    let state = this.lookupProviderState(name);
    assert('Mirage provider states require a callback function', typeof state.config === 'function');
    state.config.call(null, this.server, params);
  }

  endInteraction() {
    this._shutdownServer();
    this._deactivate();
    super.endInteraction(...arguments);
  }

  // Called by the PactEnabled serializer mixin
  recordRequest(request) {
    if (this.isCapturing()) {
      this.interaction.recordRequest(request);
    }
  }

  _activate() {
    assert('Attempted to activate multiple mock Mirage providers at once', !activeProvider);
    activeProvider = this;
  }

  _deactivate() {
    assert('Attempted to shut down a mock Mirage provider that wasn\'t active', activeProvider === this);
    activeProvider = null;
  }

  _startServer() {
    try {
      let { modulePrefix } = this.config;
      let { startMirage } = require(`${modulePrefix}/initializers/ember-cli-mirage`);
      this.server = startMirage();
    } catch (error) {
      throw new Error(`Unable to start mirage server; is ember-cli-mirage installed? ${error.message}`);
    }
  }

  _shutdownServer() {
    this.server.shutdown();
  }
}
