import resolver from './helpers/resolver';
import { setResolver as setMochaResolver } from 'ember-mocha';
import { setResolver as setQunitResolver } from 'ember-qunit';
import { start } from 'ember-cli-qunit';

setMochaResolver(resolver);
setQunitResolver(resolver);

start();
