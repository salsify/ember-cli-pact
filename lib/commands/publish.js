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
      tags: process.env.EMBER_CLI_PACT_TAGS
    };
    let mergedConfig = Object.assign({}, config, commandLineOptions);

    let resultingConfig = {
      pactFilesOrDirs: mergedConfig.path ? [mergedConfig.path] : [`${projectRoot}/pacts`],
      consumerVersion: mergedConfig.version || projectVersion,
      pactBroker: mergedConfig.broker || config.broker,
      pactBrokerUsername: mergedConfig.brokerUsername,
      pactBrokerPassword: mergedConfig.brokerPassword,
      tags: mergedConfig.tags ? mergedConfig.tags.split(',') : []
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
