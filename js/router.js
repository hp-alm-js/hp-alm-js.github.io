AlmUi.Router.map(function () {
  this.resource('application');
  this.resource('defects', { path: '/defects' });
});

AlmUi.ApplicationRoute = Em.Route.extend({
  model: function () {
  }
});

AlmUi.DefectsRoute = Ember.Route.extend({
  model: function () {
    return AlmUi.Defect.find();
  }
});
