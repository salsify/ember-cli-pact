import ApplicationSerializer from './application';

export default class PersonSerializer extends ApplicationSerializer {
  include = ['department'];
}
