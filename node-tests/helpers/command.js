/*
 * Creates a fake project object for unit tests.
 *
 * @method getProject
 * @private
 */
function getProject(options) {
  options = options || {};

  let root = options.root || 'default-root';
  let pkg = options.pkg || {
    version: '1.0.0'
  };

  return {
    root,
    pkg,
  };
}

/*
 * Creates a context (`this`) for `ember-cli` command to be able to successfully
 * execute and test `run` method.
 *
 * In unit tests, we could simply
 *
 * @method contextFor
 * @protected
 * @param {String} type A name of the command, e.g. 'publish'
 * @param {Object} options Any additional options that needs to be overwritten
 *                         on the command (`project`, etc.)
 */
function contextFor(name, options) {
  options = options || {};

  let command = require(`../../lib/commands/${name}`);
  command.project = getProject(options);
  return command;
}

module.exports = {
  contextFor
}
