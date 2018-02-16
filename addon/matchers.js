import SimpleMatcher from 'ember-cli-pact/-private/matcher/simple';
import TypeMatcher from 'ember-cli-pact/-private/matcher/type';
import RegexMatcher from 'ember-cli-pact/-private/matcher/regex';
import MultiMatcher from 'ember-cli-pact/-private/matcher/multi';
import SubpathMatcher from 'ember-cli-pact/-private/matcher/subpath';

export function type(options) {
  return new TypeMatcher('type', 2, options);
}

export function regex(regex) {
  return new RegexMatcher('regex', 2, regex);
}

export function equality() {
  return new SimpleMatcher('equality', 3, { match: 'equality' });
}

export function integer() {
  return new SimpleMatcher('integer', 3, { match: 'integer' });
}

export function decimal() {
  return new SimpleMatcher('decimal', 3, { match: 'decimal' });
}

export function allOf(matchers) {
  return new MultiMatcher('allOf', 2, undefined /* implicitly AND */, matchers);
}

export function anyOf(matchers) {
  return new MultiMatcher('anyOf', 2, 'OR', matchers);
}

export function arrayElements(object) {
  return new SubpathMatcher('arrayElements', 2, '[*]', object);
}

export function hashValues(object) {
  return new SubpathMatcher('hashValues', 2, '.*', object);
}
