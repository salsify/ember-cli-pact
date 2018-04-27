const expect = require('chai').expect;
const publishCommand = require('../../lib/commands/publish');
const helpers = require('../helpers/command');

const contextFor = helpers.contextFor;

describe('Publish Command', function() {
  let defaultCommandLineOptions = {
    path: '',
    broker: '',
    consumerVersion: '',
    brokerUsername: '',
    brokerPassword: '',
    tags: ''
  };

  afterEach(function() {
    delete process.env.EMBER_CLI_PACT_PATH;
    delete process.env.EMBER_CLI_PACT_CONSUMER_VERSION;
    delete process.env.EMBER_CLI_PACT_BROKER;
    delete process.env.EMBER_CLI_PACT_BROKER_USERNAME;
    delete process.env.EMBER_CLI_PACT_BROKER_PASSWORD;
    delete process.env.EMBER_CLI_PACT_TAGS;
  });

  it('uploads pacts', function() {
    process.env.EMBER_CLI_PACT_BROKER = 'http://localhost:1235/';

    publishCommand.publishPacts = function() {
      expect(true).to.equal(true, 'publishing of pacts is enabled');
    };

    publishCommand.run.call(contextFor('publish'));
  });

  it('generates publish options in the right order: command line takes precedence', function() {
    process.env.EMBER_CLI_PACT_BROKER = 'http://localhost:1235/';

    let result = publishCommand.getPublishOptions('great-app', '1.2.3', {
      path: 'great-app/lib/pacts',
      version: '2.2.3',
      brokerUsername: '',
      brokerPassword: '',
      tags: 'release'
    });

    expect(result).to.deep.equal({
      pactFilesOrDirs: ['great-app/lib/pacts'],
      consumerVersion: '2.2.3',
      pactBroker: 'http://localhost:1235/',
      pactBrokerUsername: '',
      pactBrokerPassword: '',
      tags: ['release']
    });
  });

  it('if a path to pact files is not specified, defaults to `project-root/pacts`', function() {
    process.env.EMBER_CLI_PACT_BROKER = 'http://localhost:1235/';

    let result = publishCommand.getPublishOptions('great-app', '1.2.3', defaultCommandLineOptions);

    expect(result).to.deep.equal({
      pactFilesOrDirs: ['great-app/pacts'],
      consumerVersion: '1.2.3',
      pactBroker: 'http://localhost:1235/',
      pactBrokerUsername: '',
      pactBrokerPassword: '',
      tags: []
    });
  });

  it('if a consumer version is not specified, defaults to version in `package.json`', function() {
    process.env.EMBER_CLI_PACT_BROKER = 'http://localhost:1235/';

    let result = publishCommand.getPublishOptions('great-app', '1.2.3', defaultCommandLineOptions);

    expect(result).to.deep.equal({
      pactFilesOrDirs: ['great-app/pacts'],
      consumerVersion: '1.2.3',
      pactBroker: 'http://localhost:1235/',
      pactBrokerUsername: '',
      pactBrokerPassword: '',
      tags: []
    });
  });

  it('throws an error if pact broker url is not specified', function() {
    expect(() => {
      publishCommand.getPublishOptions('great-app', '1.2.3', defaultCommandLineOptions);
    }).throws(/URL of the Pact Broker is not specified! Please, use `.env` file or `--broker` parameter to set it./);
  });
});
