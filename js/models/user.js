AlmUi.User = DS.Model.extend({
  email: DS.attr('string'),
  phone: DS.attr('string'),
  name: DS.attr('string'),
  fullname: DS.attr('string')
});


AlmUi.User.FIXTURES = [
  {
    name: "User",
    fullname: "User user",
    email: "User@example.com",
    phone: "1234"
  }
]
