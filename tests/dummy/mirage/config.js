export default function() {
  this.resource('departments');
  this.resource('people');

  this.get('people', function(schema, request) {
    let people = schema.people.all();
    if (request.queryParams.name) {
      people = people.filter(person => person.name === request.queryParams.name);
    }
    return people;
  });
}
