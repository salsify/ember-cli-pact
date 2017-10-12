import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  department: DS.belongsTo(),
  createdAt: DS.attr('date')
});
