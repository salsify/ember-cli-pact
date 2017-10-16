import Matcher from './index';

export default class SubpathMatcher extends Matcher {
  constructor(name, availableVersion, subpath, matcher) {
    super(name, availableVersion);
    this.subpath = subpath;
    this.matcher = matcher;
  }

  serialize(version, parentPath, root, serializeMatchingRules) {
    serializeMatchingRules(version, this.matcher, `${parentPath}${this.subpath}`, root);
  }
}
