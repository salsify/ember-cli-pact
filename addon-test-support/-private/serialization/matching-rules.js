import { assert } from '@ember/debug';
import Matcher from 'ember-cli-pact/-private/matcher';

export default function serializeMatchingRules(version, object, parentPath = '$', root = {}) {
  if (object instanceof Matcher) {
    assert(`The ${object.name} matcher is unavailable in Pact v${version}`, object.availableVersion <= version);
    object.serialize(version, parentPath, root, serializeMatchingRules);
  } else if (Array.isArray(object)) {
    for (let i = 0, len = object.length; i < len; i++) {
      serializeMatchingRules(version, object[i], `${parentPath}[${i}]`, root);
    }
  } else if (object && typeof object === 'object') {
    for (let key of Object.keys(object)) {
      serializeMatchingRules(version, object[key], `${parentPath}.${key}`, root);
    }
  }

  return root;
}
