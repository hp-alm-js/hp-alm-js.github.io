AlmUi.UsersController = Ember.ArrayController.extend({
});

AlmUi.DefectsController = Ember.ArrayController.extend({
  needs: ['defects', 'application', 'users'],
  fetch: function() {
    this.set('controllers.defects.model', this.model());
  }
});

AlmUi.DefectsMyController = AlmUi.DefectsController.extend({
  model: function() {
    var username = this.get('controllers.application.currentUser');
    var query = { owner: [username], status: ['Open', 'New'] };
    return AlmUi.Defect.find({query: query});
  }
});

AlmUi.DefectsTeamController = Em.ArrayController;

AlmUi.DefectController = Em.ObjectController.extend({
  needs: ['application', 'users']
});
