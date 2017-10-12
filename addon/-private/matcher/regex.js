import { assert } from '@ember/debug';
import SimpleMatcher from './simple';

export default class RegexMatcher extends SimpleMatcher {
  constructor(name, availableVersion, regex) {
    let source = regex;
    if (regex instanceof RegExp) {
      source = regex.source;
      assert('Pact doesn\'t support specifying flags to regular expressions', !regex.flags);
    }
    assert('regex() requires either a RegExp instance or a string', typeof source === 'string');
    super(name, availableVersion, { match: 'regex', regex: source });
  }
}
