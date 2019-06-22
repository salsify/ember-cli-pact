'use strict';

/*
 * Ember CLI Pact Publish command.
 *
 * ```
 * ember pact:publish
 * ```
 */
module.exports = {
  name: 'pact:publish',
  description: 'Uploads pact contracts to a pact broker',
  works: 'insideProject',

  availableOptions: [
    { name: 'path', type: String, description: 'A path to pact contracts.', default: '' },
    { name: 'broker', type: String, description: 'URL of the Pact Broker to publish pacts to.', default: '' },
    { name: 'consumer-version', type: String, description: 'A string containing a semver-style version, e.g. 1.0.0.', default: '' },
    { name: 'broker-username', type: String, description: 'Username for Pact Broker basic authentication.', default: '' },
    { name: 'broker-password', type: String, description: 'Password for Pact Broker basic authentication.', default: '' },
    { name: 'broker-token', type: String, description: 'Token for Pact Broker token authentication.', default: '' },
    { name: 'tags', type: String, description: 'A comma-separated string to tag the Pacts being published.', default: '' },
  ],

  /*
   * Generates a set of options that are passed to the pact client for
   * publishing local pacts.
   *
   * @method getPublishOptions
   * @private
   * @param {String} projectRoot A path to the project to be able to default to
   *                             create a default path to pacts
   * @param {String} projectVersion Project version from `package.json` to be
   *                                able to use it as a default consumer version during upload
   * @param {Object} commandLineOptions A set of command line options defined
   *                                    through `availableOptions`
   */
  getPublishOptions(projectRoot, projectVersion, commandLineOptions) {
    let config = {
      path: process.env.EMBER_CLI_PACT_PATH,
      version: process.env.EMBER_CLI_PACT_CONSUMER_VERSION,
      broker: process.env.EMBER_CLI_PACT_BROKER,
      brokerUsername: process.env.EMBER_CLI_PACT_BROKER_USERNAME,
      brokerPassword: process.env.EMBER_CLI_PACT_BROKER_PASSWORD,
      brokerToken: process.env.EMBER_CLI_PACT_BROKER_TOKEN,
      tags: process.env.EMBER_CLI_PACT_TAGS
    };

    const pactPath = (config) => config.path ? [config.path] : null
    const splitTags = (config) => config.tags ? config.tags.split(',') : null

    let resultingConfig = {
      pactFilesOrDirs: pactPath(commandLineOptions) || pactPath(config) || [`${projectRoot}/pacts`],
      consumerVersion: commandLineOptions.version || config.version || projectVersion,
      pactBroker: commandLineOptions.broker || config.broker || '',
      pactBrokerUsername: commandLineOptions.brokerUsername || config.brokerUsername || '',
      pactBrokerPassword: commandLineOptions.brokerPassword || config.brokerPassword || '',
      pactBrokerToken: commandLineOptions.brokerToken || config.brokerToken || '',
      tags: splitTags(commandLineOptions) || splitTags(config) || []
    };

    if (!resultingConfig.pactBroker) {
      throw new Error('URL of the Pact Broker is not specified! Please, use `.env` file or `--broker` parameter to set it.');
    }

    return resultingConfig;
  },

  /*
   * A wrapper method around pact client to publish pacts to a pact broker.
   *
   * @method publishPacts
   * @private
   * @param {Object} options A set of publish options
  */
  publishPacts(options) {
    let pact = require('@pact-foundation/pact-node');

    return pact.publishPacts(options);
  },

  run(commandOptions/*, rawArgs*/) {
    require('dotenv').config();

    let projectRoot = this.project.root;
    let projectVersion = this.project.pkg.version;

    let publishOptions = this.getPublishOptions(
      projectRoot,
      projectVersion,
      commandOptions
    );

    return this.publishPacts(publishOptions);
  }
};
