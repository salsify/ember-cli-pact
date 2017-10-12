import SimpleMatcher from './simple';

export default class TypeMatcher extends SimpleMatcher {
  constructor(name, availableVersion, { min, max } = {}) {
    let hash = { match: 'type' };

    if (typeof min === 'number') {
      hash.min = min;
    }

    if (typeof max == 'number') {
      hash.max = max;
    }

    super(name, availableVersion, hash);
  }
}
