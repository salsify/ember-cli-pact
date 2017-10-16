import Matcher from './index';

export default class SimpleMatcher extends Matcher {
  constructor(name, availableVersion, payload) {
    super(name, availableVersion);
    this.payload = payload;
  }

  serialize(version, parentPath, root) {
    if (!root[parentPath]) {
      root[parentPath] = { matchers: [] };
    }
    root[parentPath].matchers.push(this.payload);
  }
}
