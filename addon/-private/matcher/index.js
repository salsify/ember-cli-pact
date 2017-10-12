import { assert } from '@ember/debug';

export default class Matcher {
  constructor(name, availableVersion) {
    this.name = name;
    this.availableVersion = availableVersion;
  }

  serialize() {
    assert('Matcher subclasses must implement serialize');
  }
}
