import Pretender from 'pretender';
import MockProvider from 'ember-cli-pact/mock-provider';

export default class PretenderProvider extends MockProvider {
  constructor() {
    super(...arguments);
    this.pretender = null;
  }

  map(callback) {
    return this.pretender.map(function() {
      callback.call(this, this);
    });
  }

  startInteraction() {
    super.startInteraction(...arguments);
    this._startServer();
  }

  endInteraction() {
    this._shutdownServer();
    super.endInteraction(...arguments);
  }

  _startServer() {
    this.pretender = new Pretender(function() {
      this.post('/_pact/*path', this.passthrough);
    });

    this.pretender.handledRequest = (verb, path, request) => {
      if (this.isCapturing()) {
        this.interaction.recordRequest(request);
      }
    };
  }

  _shutdownServer() {
    this.pretender.shutdown();
    this.pretender = null;
  }
}
