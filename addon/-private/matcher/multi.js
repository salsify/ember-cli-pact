import { assert } from '@ember/debug';
import Matcher from './index';

export default class MultiMatcher extends Matcher {
  constructor(name, availableVersion, combine, matchers) {
    super(name, availableVersion);
    this.combine = combine;
    this.matchers = matchers;
  }

  serialize(version, parentPath, root, serializeMatchingRules) {
    let output = root[parentPath];
    if (!output) {
      output = root[parentPath] = { matchers: [] };
      if (this.combine) {
        output.combine = this.combine;
      }
    }

    assert(`Conflicting allOf() and anyOf() matchers`, output.combine === this.combine);

    for (let matcher of this.matchers) {
      serializeMatchingRules(version, matcher, parentPath, root);
    }

    if (!output.matchers.length) {
      delete root[parentPath];
    }
  }
}
